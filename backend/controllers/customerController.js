const db = require("../config/db");

// Add new customer
const addCustomer = (req, res) => {
  const { customer_name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

  if (!customer_name || !mobile) {
    return res.status(400).json({ message: "customer_name and mobile are required" });
  }

  const sql = `INSERT INTO customers 
    (customer_name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    customer_name, mobile, email || null, business_name || null, gst_number || null,
    customer_type || "Retail", address || null, status || "Lead", follow_up_date || null, notes || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(201).json({ message: "Customer added ✅", customerId: result.insertId });
  });
};

// Get all customers
const getCustomers = (req, res) => {
  db.query("SELECT * FROM customers ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

// Get single customer by id
const getCustomerById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM customers WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(results[0]);
  });
};

// Update customer
const updateCustomer = (req, res) => {
  const { id } = req.params;
  const { customer_name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

  const sql = `UPDATE customers SET
    customer_name = ?, mobile = ?, email = ?, business_name = ?, gst_number = ?,
    customer_type = ?, address = ?, status = ?, follow_up_date = ?, notes = ?
    WHERE id = ?`;

  const values = [customer_name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer updated ✅" });
  });
};

// Delete customer
const deleteCustomer = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM customers WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted ✅" });
  });
};

// Search customers by name or mobile
const searchCustomers = (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: "Search query 'q' is required" });
  }

  const sql = "SELECT * FROM customers WHERE customer_name LIKE ? OR mobile LIKE ?";
  const likeQuery = `%${q}%`;

  db.query(sql, [likeQuery, likeQuery], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

module.exports = {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers
};