import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "", sku: "", category: "", unit_price: "",
    current_stock: "", minimum_stock: "", warehouse_location: ""
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [movementQty, setMovementQty] = useState("");
  const [movementType, setMovementType] = useState("IN");
  const [movementReason, setMovementReason] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      product_name: "", sku: "", category: "", unit_price: "",
      current_stock: "", minimum_stock: "", warehouse_location: ""
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setFormData({
      product_name: p.product_name, sku: p.sku, category: p.category || "",
      unit_price: p.unit_price, current_stock: p.current_stock,
      minimum_stock: p.minimum_stock, warehouse_location: p.warehouse_location || ""
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post("/products", formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const openStockModal = async (product) => {
    setStockProduct(product);
    setMovementQty("");
    setMovementType("IN");
    setMovementReason("");
    setShowStockModal(true);
    try {
      const res = await api.get(`/products/${product.id}/movements`);
      setStockMovements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMovement = async () => {
    if (!movementQty || movementQty <= 0) {
      alert("Enter a valid quantity");
      return;
    }
    try {
      await api.post("/products/stock-movement", {
        product_id: stockProduct.id,
        quantity_changed: Number(movementQty),
        movement_type: movementType,
        reason: movementReason
      });
      const res = await api.get(`/products/${stockProduct.id}/movements`);
      setStockMovements(res.data);
      setMovementQty("");
      setMovementReason("");
      fetchProducts(); // refresh main list so current_stock updates
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const isLowStock = (p) => p.current_stock <= p.minimum_stock;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2>Products & Inventory</h2>
          <button className="btn-primary" onClick={openAddModal}>+ Add Product</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.product_name}</td>
                  <td>{p.sku}</td>
                  <td>{p.category || "-"}</td>
                  <td>₹{p.unit_price}</td>
                  <td>
                    {p.current_stock}
                    {isLowStock(p) && <span className="badge badge-inactive" style={{ marginLeft: "8px" }}>Low</span>}
                  </td>
                  <td>{p.warehouse_location || "-"}</td>
                  <td>
                    <button className="btn-sm btn-edit" onClick={() => openEditModal(p)}>Edit</button>
                    <button className="btn-sm" style={{ backgroundColor: "#6c757d", color: "white" }} onClick={() => openStockModal(p)}>Stock</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

            <div className="form-group">
              <label>Product Name *</label>
              <input name="product_name" value={formData.product_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>SKU *</label>
              <input name="sku" value={formData.sku} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input name="category" value={formData.category} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Unit Price</label>
              <input type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} />
            </div>

            {!editingId && (
              <div className="form-group">
                <label>Opening Stock</label>
                <input type="number" name="current_stock" value={formData.current_stock} onChange={handleChange} />
              </div>
            )}

            <div className="form-group">
              <label>Minimum Stock (low-stock alert level)</label>
              <input type="number" name="minimum_stock" value={formData.minimum_stock} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Warehouse Location</label>
              <input name="warehouse_location" value={formData.warehouse_location} onChange={handleChange} />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Stock: {stockProduct?.product_name}</h3>
            <p style={{ marginBottom: "15px", color: "#666" }}>Current stock: <strong>{stockProduct?.current_stock}</strong></p>

            <div className="form-group">
              <label>Movement Type</label>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)}>
                <option value="IN">IN (add stock)</option>
                <option value="OUT">OUT (remove stock)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={movementQty} onChange={(e) => setMovementQty(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <input value={movementReason} onChange={(e) => setMovementReason(e.target.value)} placeholder="e.g. New shipment, Damaged goods" />
            </div>

            <button className="btn-primary" onClick={handleAddMovement} style={{ marginBottom: "20px" }}>Record Movement</button>

            <h4 style={{ marginBottom: "10px" }}>Movement History</h4>
            {stockMovements.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>No movements yet.</p>
            ) : (
              stockMovements.map((m) => (
                <div key={m.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0", fontSize: "14px" }}>
                  <span className={m.movement_type === "IN" ? "badge badge-active" : "badge badge-inactive"}>
                    {m.movement_type}
                  </span>{" "}
                  {m.quantity_changed} units — {m.reason || "No reason given"}
                  <br />
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    By {m.created_by_name} on {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowStockModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;