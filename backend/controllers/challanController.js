const db = require("../config/db");

// Generate a simple unique challan number like CH-20260722-001
const generateChallanNumber = (callback) => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // e.g. 20260722

  const sql = "SELECT COUNT(*) AS count FROM challans WHERE challan_number LIKE ?";
  db.query(sql, [`CH-${datePart}-%`], (err, results) => {
    if (err) return callback(err);
    const nextNumber = (results[0].count + 1).toString().padStart(3, "0");
    callback(null, `CH-${datePart}-${nextNumber}`);
  });
};

// Create a new challan as Draft, with multiple items
const createChallan = (req, res) => {
  const { customer_id, items } = req.body; // items = [{ product_id, quantity, price }, ...]
  const created_by = req.user.id;

  if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "customer_id and at least one item are required" });
  }

  generateChallanNumber((err, challanNumber) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error generating challan number" });
    }

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const challanSql = `INSERT INTO challans (challan_number, customer_id, status, total_quantity, created_by)
                         VALUES (?, ?, 'Draft', ?, ?)`;

    db.query(challanSql, [challanNumber, customer_id, totalQuantity, created_by], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      const challanId = result.insertId;

      // Fetch product names for the snapshot (product_name_snapshot)
      const productIds = items.map((i) => i.product_id);
      const placeholders = productIds.map(() => "?").join(",");

      db.query(`SELECT id, product_name FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        const productMap = {};
        products.forEach((p) => { productMap[p.id] = p.product_name; });

        const itemValues = items.map((item) => [
          challanId,
          item.product_id,
          productMap[item.product_id] || "Unknown Product",
          item.quantity,
          item.price
        ]);

        const itemsSql = `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, quantity, price)
                           VALUES ?`;

        db.query(itemsSql, [itemValues], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
          }
          res.status(201).json({ message: "Challan created as Draft ✅", challanId, challanNumber });
        });
      });
    });
  });
};

// Get all challans (basic list)
const getChallans = (req, res) => {
  const sql = `SELECT ch.*, c.customer_name
               FROM challans ch
               JOIN customers c ON ch.customer_id = c.id
               ORDER BY ch.created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Get one challan with its items
const getChallanById = (req, res) => {
  const { id } = req.params;

  const challanSql = `SELECT ch.*, c.customer_name
                       FROM challans ch
                       JOIN customers c ON ch.customer_id = c.id
                       WHERE ch.id = ?`;

  db.query(challanSql, [id], (err, challanResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (challanResults.length === 0) {
      return res.status(404).json({ message: "Challan not found" });
    }

    db.query("SELECT * FROM challan_items WHERE challan_id = ?", [id], (err, itemResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ ...challanResults[0], items: itemResults });
    });
  });
};

// Confirm a challan: validate stock for ALL items first, then deduct stock for ALL items
const confirmChallan = (req, res) => {
  const { id } = req.params;

  // Step 1: Get the challan and make sure it's still a Draft
  db.query("SELECT * FROM challans WHERE id = ?", [id], (err, challanResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (challanResults.length === 0) {
      return res.status(404).json({ message: "Challan not found" });
    }
    if (challanResults[0].status !== "Draft") {
      return res.status(400).json({ message: `Challan is already ${challanResults[0].status}` });
    }

    // Step 2: Get all items in this challan
    db.query("SELECT * FROM challan_items WHERE challan_id = ?", [id], (err, items) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      const productIds = items.map((i) => i.product_id);
      const placeholders = productIds.map(() => "?").join(",");

      // Step 3: Get CURRENT stock for every product in this challan, in one query
      db.query(`SELECT id, current_stock FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        const stockMap = {};
        products.forEach((p) => { stockMap[p.id] = p.current_stock; });

        // Step 4: Validate EVERY item BEFORE changing anything
        for (const item of items) {
          const available = stockMap[item.product_id];
          if (available < item.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for "${item.product_name_snapshot}". Available: ${available}, Required: ${item.quantity}`
            });
          }
        }

        // Step 5: All items have enough stock — now actually deduct stock for each one
        let completed = 0;
        let hasError = false;

        items.forEach((item) => {
          const newStock = stockMap[item.product_id] - item.quantity;

          db.query("UPDATE products SET current_stock = ? WHERE id = ?", [newStock, item.product_id], (err) => {
            if (err && !hasError) {
              hasError = true;
              console.error(err);
              return res.status(500).json({ message: "Server error updating stock" });
            }

            db.query(
              "INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by) VALUES (?, ?, 'OUT', ?, ?)",
              [item.product_id, item.quantity, `Challan ${challanResults[0].challan_number}`, req.user.id],
              (err) => {
                if (err && !hasError) {
                  hasError = true;
                  console.error(err);
                  return res.status(500).json({ message: "Server error logging movement" });
                }

                completed++;
                // Step 6: Once ALL items are processed, mark challan as Confirmed
                if (completed === items.length && !hasError) {
                  db.query("UPDATE challans SET status = 'Confirmed' WHERE id = ?", [id], (err) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({ message: "Server error confirming challan" });
                    }
                    res.json({ message: "Challan confirmed ✅. Stock updated." });
                  });
                }
              }
            );
          });
        });
      });
    });
  });
};

// Cancel a draft challan
const cancelChallan = (req, res) => {
  const { id } = req.params;

  db.query("SELECT status FROM challans WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Challan not found" });
    }
    if (results[0].status !== "Draft") {
      return res.status(400).json({ message: `Cannot cancel a ${results[0].status} challan` });
    }

    db.query("UPDATE challans SET status = 'Cancelled' WHERE id = ?", [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json({ message: "Challan cancelled ✅" });
    });
  });
};

module.exports = {
  createChallan,
  getChallans,
  getChallanById,
  confirmChallan,
  cancelChallan
};