import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    business_name: "",
    gst_number: "",
    customer_type: "Retail",
    address: "",
    status: "Lead",
    follow_up_date: "",
    notes: ""
  });

  // Follow-up modal state
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupCustomer, setFollowupCustomer] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [newFollowupDate, setNewFollowupDate] = useState("");
  const [newFollowupNotes, setNewFollowupNotes] = useState("");

  // Load all customers when page opens
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      if (searchQuery.trim() !== "") {
        const res = await api.get(`/customers/search?q=${searchQuery}`);
        setCustomers(res.data);
      } else {
        const res = await api.get("/customers");
        setCustomers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim() === "") {
      fetchCustomers();
      return;
    }

    try {
      const res = await api.get(`/customers/search?q=${q}`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      customer_name: "", mobile: "", email: "", business_name: "",
      gst_number: "", customer_type: "Retail", address: "",
      status: "Lead", follow_up_date: "", notes: ""
    });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingId(customer.id);
    setFormData({
      customer_name: customer.customer_name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      business_name: customer.business_name || "",
      gst_number: customer.gst_number || "",
      customer_type: customer.customer_type || "Retail",
      address: customer.address || "",
      status: customer.status || "Lead",
      follow_up_date: customer.follow_up_date ? customer.follow_up_date.split("T")[0] : "",
      notes: customer.notes || ""
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
      } else {
        await api.post("/customers", formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Follow-up handlers ----------

  const openFollowupModal = async (customer) => {
    setFollowupCustomer(customer);
    setNewFollowupDate("");
    setNewFollowupNotes("");
    setShowFollowupModal(true);
    try {
      const res = await api.get(`/followups/customer/${customer.id}`);
      setFollowups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFollowup = async () => {
    if (!newFollowupDate) {
      alert("Follow-up date is required");
      return;
    }
    try {
      await api.post("/followups", {
        customer_id: followupCustomer.id,
        followup_date: newFollowupDate,
        notes: newFollowupNotes
      });
      const res = await api.get(`/followups/customer/${followupCustomer.id}`);
      setFollowups(res.data);
      setNewFollowupDate("");
      setNewFollowupNotes("");
    } catch (err) {
      console.error(err);
      alert("Failed to add follow-up");
    }
  };

  const handleDeleteFollowup = async (id) => {
    if (!window.confirm("Delete this follow-up?")) return;
    try {
      await api.delete(`/followups/${id}`);
      const res = await api.get(`/followups/customer/${followupCustomer.id}`);
      setFollowups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (status) => {
    if (status === "Active") return "badge badge-active";
    if (status === "Inactive") return "badge badge-inactive";
    return "badge badge-lead";
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2>Customers</h2>
          <button className="btn-primary" onClick={openAddModal}>+ Add Customer</button>
        </div>

        <input
          type="text"
          placeholder="Search by name or mobile..."
          className="search-input"
          value={searchQuery}
          onChange={handleSearch}
          style={{ marginBottom: "20px" }}
        />

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Status</th>
              <th>Business</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.customer_name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.customer_type}</td>
                  <td><span className={getBadgeClass(c.status)}>{c.status}</span></td>
                  <td>{c.business_name || "-"}</td>
                  <td>
                    <button className="btn-sm btn-edit" onClick={() => openEditModal(c)}>Edit</button>
                    <button
                      className="btn-sm"
                      style={{ backgroundColor: "#6c757d", color: "white" }}
                      onClick={() => openFollowupModal(c)}
                    >
                      Follow-ups
                    </button>
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>

            <div className="form-group">
              <label>Customer Name *</label>
              <input name="customer_name" value={formData.customer_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Mobile *</label>
              <input name="mobile" value={formData.mobile} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Business Name</label>
              <input name="business_name" value={formData.business_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>GST Number</label>
              <input name="gst_number" value={formData.gst_number} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Customer Type</label>
              <select name="customer_type" value={formData.customer_type} onChange={handleChange}>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2"></textarea>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2"></textarea>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups Modal */}
      {showFollowupModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Follow-ups: {followupCustomer?.customer_name}</h3>

            <div className="form-group">
              <label>Follow-up Date *</label>
              <input
                type="date"
                value={newFollowupDate}
                onChange={(e) => setNewFollowupDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="2"
                value={newFollowupNotes}
                onChange={(e) => setNewFollowupNotes(e.target.value)}
              ></textarea>
            </div>

            <button className="btn-primary" onClick={handleAddFollowup} style={{ marginBottom: "20px" }}>
              + Add Follow-up
            </button>

            <h4 style={{ marginBottom: "10px" }}>History</h4>
            {followups.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>No follow-ups yet.</p>
            ) : (
              followups.map((f) => (
                <div key={f.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0", fontSize: "14px" }}>
                  <strong>{f.followup_date.split("T")[0]}</strong> — {f.notes || "No notes"}
                  <br />
                  <span style={{ color: "#888", fontSize: "12px" }}>By {f.created_by_name}</span>
                  <button
                    className="btn-sm btn-delete"
                    style={{ float: "right", padding: "3px 8px" }}
                    onClick={() => handleDeleteFollowup(f.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowFollowupModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;