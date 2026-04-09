import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaPen, FaTrash, FaRecycle } from "react-icons/fa";

interface Customer {
    CustomerID: number;
    FirstName: string;
    LastName: string;
    Contact: string;
    Email: string;
    Address: string;
    IsArchived: number;
}

const CustomerInfo: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCustomerID, setCurrentCustomerID] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        FirstName: "",
        LastName: "",
        Contact: "",
        Email: "",
        Address: "",
        IsArchived: 0,
    });

    // FETCH
    useEffect(() => {
        setLoading(true);

        const endpoint =
            activeTab === "active"
                ? "http://127.0.0.1:8000/api/customers"
                : "http://127.0.0.1:8000/api/customers-archived";

        axios.get(endpoint)
            .then(res => {
                setCustomers(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeTab]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // EDIT
    const handleEdit = (c: Customer) => {
        setFormData(c);
        setCurrentCustomerID(c.CustomerID);
        setIsEditing(true);
        setShowModal(true);
    };

    // ARCHIVE
    const handleArchive = (id: number) => {
        axios.delete(`http://127.0.0.1:8000/api/customers/${id}`)
            .then(() => {
                setCustomers(prev =>
                    prev.filter(c => c.CustomerID !== id)
                );
            });
    };

    // RESTORE
    const handleRestore = (id: number) => {
        axios.patch(`http://127.0.0.1:8000/api/customers/${id}/restore`)
            .then(() => {
                setCustomers(prev => prev.filter(c => c.CustomerID !== id));
            });
    };

    // SUBMIT
    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (isEditing && currentCustomerID) {
            axios.put(`http://127.0.0.1:8000/api/customers/${currentCustomerID}`, formData)
                .then(res => {
                    setCustomers(prev =>
                        prev.map(c =>
                            c.CustomerID === currentCustomerID ? res.data : c
                        )
                    );
                    setShowModal(false);
                });
        } else {
            axios.post("http://127.0.0.1:8000/api/customers", formData)
                .then(res => {
                    setCustomers(prev => [...prev, res.data]);
                    setShowModal(false);
                });
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
                    <h1>Customers</h1>
                    <p>Manage your customers</p>
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
                        onClick={() => {
                            setShowModal(true);
                            setIsEditing(false);
                        }}
                    >
                        + Add Customer
                    </button>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? "Edit Customer" : "Add Customer"}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>First Name</label>
                                <input name="FirstName" value={formData.FirstName} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <input name="LastName" value={formData.LastName} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Contact</label>
                                <input name="Contact" value={formData.Contact} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input name="Email" value={formData.Email} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input name="Address" value={formData.Address} onChange={handleChange} />
                            </div>

                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn">
                                    {isEditing ? "Update" : "Submit"}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
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
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th className="action">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map(c => (
                                <tr key={c.CustomerID}>
                                    <td>{c.CustomerID}</td>
                                    <td>{c.FirstName} {c.LastName}</td>
                                    <td>{c.Contact}</td>
                                    <td>{c.Email}</td>
                                    <td>{c.Address}</td>
                                    <td>
                                        <span className={c.IsArchived ? "status archived" : "status active"}>
                                            {c.IsArchived ? "Archived" : "Active"}
                                        </span>
                                    </td>

                                    <td className="action-buttons">
                                        {activeTab === "active" ? (
                                            <>
                                                <button className="edit-btn" onClick={() => handleEdit(c)}>
                                                    <FaPen />
                                                </button>

                                                <button className="delete-btn" onClick={() => handleArchive(c.CustomerID)}>
                                                    <FaTrash />
                                                </button>
                                            </>
                                        ) : (
                                            <button className="restore-btn" onClick={() => handleRestore(c.CustomerID)}>
                                                <FaRecycle />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerInfo;