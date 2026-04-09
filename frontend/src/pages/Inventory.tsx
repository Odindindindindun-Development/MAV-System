import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaTrash, FaRecycle, FaPen, FaBell } from "react-icons/fa";

interface Item {
    StockItemID: number;
    ItemName: string;
    Description?: string;
    Quantity: number;
    UnitPrice: number;
    Supplier?: string;
    ReorderLevel: number;
    IsArchived: boolean;
}

const Inventory: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItemID, setCurrentItemID] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        ItemName: "",
        Description: "",
        Quantity: "",
        UnitPrice: "",
        Supplier: "",
        ReorderLevel: "",
    });

    // Notification dropdown
    const [notifOpen, setNotifOpen] = useState(false);

    // FETCH ITEMS
    useEffect(() => {
        setLoading(true);

        const endpoint =
            activeTab === "active"
                ? "http://127.0.0.1:8000/api/stock-items"
                : "http://127.0.0.1:8000/api/stock-items-archived";

        axios
            .get(endpoint)
            .then((res) => {
                setItems(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeTab]);

    // CLOSE NOTIF DROPDOWN WHEN CLICKED OUTSIDE
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".notification-bell-container")) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // HANDLE FORM INPUT
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✏️ EDIT OR ADD STOCK
    const handleEdit = (item: Item) => {
        setFormData({
            ItemName: item.ItemName,
            Description: item.Description || "",
            Quantity: String(item.Quantity),
            UnitPrice: String(item.UnitPrice),
            Supplier: item.Supplier || "",
            ReorderLevel: String(item.ReorderLevel),
        });
        setCurrentItemID(item.StockItemID);
        setIsEditing(true);
        setShowModal(true);
    };

    // 🗄️ ARCHIVE
    const handleArchive = (id: number) => {
        axios
            .delete(`http://127.0.0.1:8000/api/stock-items/${id}`)
            .then(() => {
                setItems((prev) =>
                    prev.map((i) =>
                        i.StockItemID === id ? { ...i, IsArchived: true } : i
                    )
                );
            });
    };

    // ♻️ RESTORE
    const handleRestore = (id: number) => {
        axios
            .patch(`http://127.0.0.1:8000/api/stock-items/${id}`, { IsArchived: false })
            .then(() => {
                setItems((prev) => prev.filter((i) => i.StockItemID !== id));
            });
    };

    // SUBMIT ADD / EDIT
    const handleSubmit = (e: any) => {
        e.preventDefault();

        const payload = {
            ...formData,
            Quantity: Number(formData.Quantity),
            UnitPrice: Number(formData.UnitPrice),
            ReorderLevel: Number(formData.ReorderLevel),
        };

        if (isEditing && currentItemID) {
            axios
                .put(`http://127.0.0.1:8000/api/stock-items/${currentItemID}`, payload)
                .then((res) => {
                    setItems((prev) =>
                        prev.map((i) => (i.StockItemID === currentItemID ? res.data : i))
                    );
                    resetForm();
                });
        } else {
            axios
                .post("http://127.0.0.1:8000/api/stock-items", payload)
                .then((res) => {
                    setItems((prev) => [...prev, res.data]);
                    resetForm();
                });
        }
    };

    const resetForm = () => {
        setFormData({
            ItemName: "",
            Description: "",
            Quantity: "",
            UnitPrice: "",
            Supplier: "",
            ReorderLevel: "",
        });
        setShowModal(false);
        setIsEditing(false);
        setCurrentItemID(null);
    };

    // 🔔 ITEMS BELOW REORDER LEVEL
    const lowStockItems = items.filter(
        (i) => !i.IsArchived && i.Quantity <= i.ReorderLevel
    );
    const notifCount = lowStockItems.length;

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div>
                    <h1>Inventory</h1>
                    <p>Manage stock items and supplies.</p>
                </div>

                <div className="header-actions">
                    <div className="tabs-container">
                        {/* 🔔 Notification Bell */}
                        {activeTab === "active" && (
                            <div className="notification-bell-container">
                                <button
                                    className="notification-btn"
                                    onClick={() => setNotifOpen((prev) => !prev)}
                                >
                                    <FaBell size={20} />
                                    {notifCount > 0 && (
                                        <span className="notif-count">
                                            {notifCount > 9 ? "9+" : notifCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && notifCount > 0 && (
                                    <div className="notif-dropdown">
                                        {lowStockItems.map((item) => (
                                            <div
                                                key={item.StockItemID}
                                                className="notif-item"
                                                onClick={() => handleEdit(item)}
                                            >
                                                {item.ItemName} ({item.Quantity} left)
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className={activeTab === "active" ? "tab active" : "tab"}
                            onClick={() => setActiveTab("active")}
                        >
                            Active
                        </button>
                        <button
                            className={activeTab === "archived" ? "tab active" : "tab"}
                            onClick={() => setActiveTab("archived")}
                        >
                            Archived
                        </button>
                        <button
                            className="add-customer-btn"
                            disabled={activeTab === "archived"}
                            onClick={() => setShowModal(true)}
                        >
                            + Add Item
                        </button>
                    </div>
                </div>
            </div>

           {/* MODAL */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>{isEditing ? "Edit Item / Add Stock" : "Add Item"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ItemName">Item Name</label>
          <input
            id="ItemName"
            name="ItemName"
            placeholder="Item Name"
            value={formData.ItemName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="Description">Description</label>
          <input
            id="Description"
            name="Description"
            placeholder="Description"
            value={formData.Description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Add Stock</label>
          <button
            type="button"
            className="add-stock-btn"
            onClick={() => {
              const addQty = prompt("Enter quantity to add:");
              if (addQty && !isNaN(Number(addQty))) {
                setFormData((prev) => ({
                  ...prev,
                  Quantity: String(Number(prev.Quantity) + Number(addQty)),
                }));
              }
            }}
          >
            + Add Stock
          </button>
          <span style={{ marginLeft: "10px" }}>
            Current: {formData.Quantity || 0}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="UnitPrice">Unit Price</label>
          <input
            id="UnitPrice"
            name="UnitPrice"
            type="number"
            placeholder="Unit Price"
            value={formData.UnitPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="Supplier">Supplier</label>
          <input
            id="Supplier"
            name="Supplier"
            placeholder="Supplier"
            value={formData.Supplier}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ReorderLevel">Reorder Level</label>
          <input
            id="ReorderLevel"
            name="ReorderLevel"
            type="number"
            placeholder="Reorder Level"
            value={formData.ReorderLevel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-buttons">
          <button type="submit">{isEditing ? "Update" : "Submit"}</button>
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

            {/* TABLE */}
            {!loading && (
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Supplier</th>
                            <th>Reorder</th>
                            <th>State</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((i) => (
                            <tr key={i.StockItemID}>
                                <td>{i.StockItemID}</td>
                                <td>{i.ItemName}</td>
                                <td>{i.Quantity}</td>
                                <td>{i.UnitPrice}</td>
                                <td>{i.Supplier}</td>
                                <td>{i.ReorderLevel}</td>
                                <td>{i.IsArchived ? "Archived" : "Active"}</td>
                                <td className="action-buttons">
                                    {activeTab === "active" ? (
                                        <>
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(i)}
                                            >
                                                <FaPen />
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleArchive(i.StockItemID)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="restore-btn"
                                            onClick={() => handleRestore(i.StockItemID)}
                                        >
                                            <FaRecycle />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Inventory;