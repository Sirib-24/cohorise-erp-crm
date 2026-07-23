const db = require("../config/db");

// Add a follow-up for a customer
const addFollowup = (req, res) => {
  const { customer_id, followup_date, notes } = req.body;
  const created_by = req.user.id; // comes from the JWT token, not user input

  if (!customer_id || !followup_date) {
    return res.status(400).json({ message: "customer_id and followup_date are required" });
  }

  const sql = `INSERT INTO customer_followups (customer_id, followup_date, notes, created_by)
               VALUES (?, ?, ?, ?)`;

  db.query(sql, [customer_id, followup_date, notes || null, created_by], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(201).json({ message: "Follow-up added ✅", followupId: result.insertId });
  });
};

// Get all follow-ups for a specific customer
const getFollowupsByCustomer = (req, res) => {
  const { customerId } = req.params;

  const sql = `SELECT cf.*, u.name AS created_by_name
               FROM customer_followups cf
               LEFT JOIN users u ON cf.created_by = u.id
               WHERE cf.customer_id = ?
               ORDER BY cf.followup_date DESC`;

  db.query(sql, [customerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Get all upcoming/pending follow-ups (across all customers) — useful for dashboard later
const getAllPendingFollowups = (req, res) => {
  const sql = `SELECT cf.*, c.customer_name, u.name AS created_by_name
               FROM customer_followups cf
               JOIN customers c ON cf.customer_id = c.id
               LEFT JOIN users u ON cf.created_by = u.id
               WHERE cf.followup_date >= CURDATE()
               ORDER BY cf.followup_date ASC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Delete a follow-up
const deleteFollowup = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM customer_followups WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Follow-up not found" });
    }
    res.json({ message: "Follow-up deleted ✅" });
  });
};

module.exports = {
  addFollowup,
  getFollowupsByCustomer,
  getAllPendingFollowups,
  deleteFollowup
};