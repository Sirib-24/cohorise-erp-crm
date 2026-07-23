const db = require("../config/db");

// Add new product
const addProduct = (req, res) => {
  const { product_name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location } = req.body;

  if (!product_name || !sku) {
    return res.status(400).json({ message: "product_name and sku are required" });
  }

  const sql = `INSERT INTO products (product_name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    product_name, sku, category || null, unit_price || 0,
    current_stock || 0, minimum_stock || 0, warehouse_location || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "SKU already exists" });
      }
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(201).json({ message: "Product added ✅", productId: result.insertId });
  });
};

// Get all products
const getProducts = (req, res) => {
  db.query("SELECT * FROM products ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Get single product
const getProductById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(results[0]);
  });
};

// Update product details (not stock — that's handled separately via movements)
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { product_name, sku, category, unit_price, minimum_stock, warehouse_location } = req.body;

  const sql = `UPDATE products SET
    product_name = ?, sku = ?, category = ?, unit_price = ?, minimum_stock = ?, warehouse_location = ?
    WHERE id = ?`;

  const values = [product_name, sku, category, unit_price, minimum_stock, warehouse_location, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "SKU already exists" });
      }
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated ✅" });
  });
};

// Get low stock products (current_stock <= minimum_stock)
const getLowStockProducts = (req, res) => {
  const sql = "SELECT * FROM products WHERE current_stock <= minimum_stock";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Record a stock movement (IN or OUT) and update current_stock accordingly
const addStockMovement = (req, res) => {
  const { product_id, quantity_changed, movement_type, reason } = req.body;
  const created_by = req.user.id;

  if (!product_id || !quantity_changed || !movement_type) {
    return res.status(400).json({ message: "product_id, quantity_changed, and movement_type are required" });
  }

  if (!["IN", "OUT"].includes(movement_type)) {
    return res.status(400).json({ message: "movement_type must be IN or OUT" });
  }

  // Step 1: Get current stock for this product
  db.query("SELECT current_stock FROM products WHERE id = ?", [product_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const currentStock = results[0].current_stock;

    // Step 2: Calculate the new stock level
    const newStock = movement_type === "IN"
      ? currentStock + quantity_changed
      : currentStock - quantity_changed;

    // Step 3: Block negative stock for OUT movements
    if (newStock < 0) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity_changed}` });
    }

    // Step 4: Insert the movement record (audit trail)
    const insertSql = `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
                        VALUES (?, ?, ?, ?, ?)`;

    db.query(insertSql, [product_id, quantity_changed, movement_type, reason || null, created_by], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      // Step 5: Update the product's running stock total
      db.query("UPDATE products SET current_stock = ? WHERE id = ?", [newStock, product_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }
        res.status(201).json({ message: "Stock movement recorded ✅", newStock });
      });
    });
  });
};

// Get movement history for a product
const getStockMovements = (req, res) => {
  const { productId } = req.params;

  const sql = `SELECT sm.*, u.name AS created_by_name
               FROM stock_movements sm
               LEFT JOIN users u ON sm.created_by = u.id
               WHERE sm.product_id = ?
               ORDER BY sm.created_at DESC`;

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Delete Product
const deleteProduct = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully ✅" });
    });
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  getLowStockProducts,
  addStockMovement,
  getStockMovements,
  deleteProduct
};