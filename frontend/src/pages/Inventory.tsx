import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaTrash, FaClipboardList, FaRecycle } from "react-icons/fa";

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
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("active");

    const [formData, setFormData] = useState({
        ItemName: "",
        Description: "",
        Quantity: "",
        UnitPrice: "",
        Supplier: "",
        ReorderLevel: "",
    });

    // FETCH ITEMS
    useEffect(() => {
        setLoading(true);

        const endpoint =
            activeTab === "active"
                ? "http://127.0.0.1:8000/api/stock-items"
                : "http://127.0.0.1:8000/api/stock-items-archived";

        axios.get(endpoint)
            .then(res => {
                setItems(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to fetch items");
                setLoading(false);
            });
    }, [activeTab]);

    // HANDLE INPUT
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // SUBMIT
    const handleSubmit = (e: any) => {
        e.preventDefault();

        axios.post("http://127.0.0.1:8000/api/stock-items", {
            ...formData,
            Quantity: Number(formData.Quantity),
            UnitPrice: Number(formData.UnitPrice),
            ReorderLevel: Number(formData.ReorderLevel),
        })
        .then(res => {
            setItems(prev => [...prev, res.data]);
            setShowModal(false);
        })
        .catch(err => {
            console.error(err);
            alert("Failed to add item");
        });
    };

    // ARCHIVE
    const handleDelete = (id: number) => {
        axios.delete(`http://127.0.0.1:8000/api/stock-items/${id}`)
            .then(() => {
                setItems(prev =>
                    prev.map(i =>
                        i.StockItemID === id ? { ...i, IsArchived: true } : i
                    )
                );
            });
    };

    // RESTORE
    const handleRestore = (id: number) => {
        axios.patch(`http://127.0.0.1:8000/api/stock-items/${id}`, {
            IsArchived: false
        })
        .then(() => {
            setItems(prev => prev.filter(i => i.StockItemID !== id));
        });
    };

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div>
                    <h1>Inventory</h1>
                    <p>Manage stock items and supplies.</p>
                </div>

                <div className="tabs-container">
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

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Item</h2>

                        <form onSubmit={handleSubmit}>
                            <input name="ItemName" placeholder="Item Name" onChange={handleChange} required />
                            <input name="Description" placeholder="Description" onChange={handleChange} />
                            <input name="Quantity" type="number" placeholder="Quantity" onChange={handleChange} required />
                            <input name="UnitPrice" type="number" placeholder="Unit Price" onChange={handleChange} required />
                            <input name="Supplier" placeholder="Supplier" onChange={handleChange} />
                            <input name="ReorderLevel" type="number" placeholder="Reorder Level" onChange={handleChange} required />

                            <div className="modal-buttons">
                                <button type="submit">Submit</button>
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
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
                        {items.map(i => (
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
                                            <button className="manage-btn">
                                                <FaClipboardList />
                                            </button>

                                            <button className="delete-btn" onClick={() => handleDelete(i.StockItemID)}>
                                                <FaTrash />
                                            </button>
                                        </>
                                    ) : (
                                        <button className="restore-btn" onClick={() => handleRestore(i.StockItemID)}>
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