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
        Quantity: "",
        UnitPrice: "",
        Supplier: "",
        ReorderLevel: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Notification dropdown
    const [notifOpen, setNotifOpen] = useState(false);

    const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");
    const [adjustQty, setAdjustQty] = useState("");

const applyAdjustment = () => {
    const qty = Number(adjustQty);

    if (!qty || qty <= 0) {
        alert("Please enter a valid quantity greater than 0.");
        return;
    }

    const currentQty = Number(formData.Quantity);

    if (adjustType === "deduct" && qty > currentQty) {
        alert("Cannot deduct more than current stock.");
        return;
    }

    const newQty =
        adjustType === "add"
            ? currentQty + qty
            : currentQty - qty;

    setFormData((prev) => ({
        ...prev,
        Quantity: String(newQty),
    }));

    setAdjustQty("");
};

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
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        setCurrentPage(1);
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
    const confirmDelete = window.confirm(
        "Are you sure you want to archive this item? This action can be reversed."
    );

    if (!confirmDelete) return;

    axios
        .delete(`http://127.0.0.1:8000/api/stock-items/${id}`)
        .then(() => {
            setItems((prev) =>
                prev.map((i) =>
                    i.StockItemID === id ? { ...i, IsArchived: true } : i
                )
            );

            alert("Item archived successfully.");
        })
        .catch(() => {
            alert("Failed to archive item.");
        });
};

    // ♻️ RESTORE
const handleRestore = (id: number) => {
    const confirmRestore = window.confirm(
        "Do you want to restore this item back to active stock?"
    );

    if (!confirmRestore) return;

    axios
        .patch(`http://127.0.0.1:8000/api/stock-items/${id}`, {
            IsArchived: false
        })
        .then(() => {
            setItems((prev) =>
                prev.filter((i) => i.StockItemID !== id)
            );

            alert("Item restored successfully.");
        })
        .catch(() => {
            alert("Failed to restore item.");
        });
};

    // SUBMIT ADD / EDIT
const handleSubmit = (e: any) => {
    e.preventDefault();

    const nameExists = items.some(i =>
        i.ItemName.trim().toLowerCase() === formData.ItemName.trim().toLowerCase() &&
        i.StockItemID !== currentItemID // IMPORTANT: ignore itself when editing
    );

    if (nameExists) {
        alert("An item with this name already exists.");
        return;
    }

    if (Number(formData.UnitPrice) < 0) {
        alert("Unit price cannot be negative.");
        return;
    }

    if (Number(formData.Quantity) < 0) {
        alert("Quantity cannot be negative.");
        return;
    }

    if (Number(formData.ReorderLevel) < 0) {
        alert("Reorder level cannot be negative.");
        return;
    }

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
            Quantity: "",
            UnitPrice: "",
            Supplier: "",
            ReorderLevel: "",
        });
        setShowModal(false);
        setIsEditing(false);
        setCurrentItemID(null);
        setAdjustQty(""); // ✅ add this
    };

    // 🔔 ITEMS BELOW REORDER LEVEL
    const lowStockItems = items.filter(
        (i) => !i.IsArchived && i.Quantity <= i.ReorderLevel
    );
    const notifCount = lowStockItems.length;

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;

    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(items.length / rowsPerPage);

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
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
                        <h2>{isEditing ? "Edit Item / Adjust Stock" : "Add Item"}</h2>

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

                            {isEditing && (
                                <div className="form-group">
                                    <label>Adjust Stock</label>

                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <select
                                            value={adjustType}
                                            onChange={(e) =>
                                                setAdjustType(e.target.value as "add" | "deduct")
                                            }
                                        >
                                            <option value="add">Add</option>
                                            <option value="deduct">Deduct</option>
                                        </select>

                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            value={adjustQty}
                                            onChange={(e) => setAdjustQty(e.target.value)}
                                        />

                                        <button type="button" onClick={applyAdjustment}>
                                            Apply
                                        </button>
                                    </div>

                                    <span style={{ marginLeft: "10px" }}>
                                        Current: {formData.Quantity || 0}
                                    </span>
                                </div>
                            )}

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
                                    required
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
                <div className="table-container">
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
                            {currentItems.map((i) => (
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
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={currentPage === i + 1 ? "active-page" : ""}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setCurrentPage(prev => Math.min(prev + 1, totalPages))
                            }
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;