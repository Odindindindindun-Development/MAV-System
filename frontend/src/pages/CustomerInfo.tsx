import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css"
import { FaPen, FaTrash} from "react-icons/fa";

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
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/customers")
            .then((response) => {
                setCustomers(response.data);
                console.log("DATA ONLY:", response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch customers");
                setLoading(false);
            });
    }, []);

    const [showModal, setShowModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        FirstName: "",
        LastName: "",
        Contact: "",
        Email: "",
        Address: "",
        IsArchived: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Edit handler
    const handleEdit = (customer: Customer) => {
        console.log("Edit clicked for:", customer);
        // Open the modal pre-filled for editing
        // setFormData({...customer}) and setShowModal(true)
    };

    // Delete handler
    const handleDelete = (customerID: number) => {
        console.log("delete clicked for:", customerID);

    };

    // Submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios
            .post("http://127.0.0.1:8000/api/customers", formData)
            .then((res) => {
                // Add new customer to the table
                setCustomers((prev) => [...prev, res.data]);
                setShowModal(false);
                setFormData({
                    FirstName: "",
                    LastName: "",
                    Contact: "",
                    Email: "",
                    Address: "",
                    IsArchived: 0,
                });
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to add customer");
            });
    };

    return (
        <div>
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
                    <h1>Customer Information</h1>
                    <p>Track, manage and forecast your customers and orders.</p>
                </div>
                <div className="customerinfo-right">
                    <button className="add-customer-btn" onClick={() => setShowModal(true)}>+ Add Customer</button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Customer</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="FirstName">First Name</label>
                                <input
                                    id="FirstName"
                                    type="text"
                                    name="FirstName"
                                    value={formData.FirstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="LastName">Last Name</label>
                                <input
                                    id="LastName"
                                    type="text"
                                    name="LastName"
                                    value={formData.LastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="Contact">Contact</label>
                                <input
                                    id="Contact"
                                    type="text"
                                    name="Contact"
                                    value={formData.Contact}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="Email">Email</label>
                                <input
                                    id="Email"
                                    type="email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="Address">Address</label>
                                <input
                                    id="Address"
                                    type="text"
                                    name="Address"
                                    value={formData.Address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn">
                                    Submit
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

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && (
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Contact Number</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th className="action">Actions</th> {/* new column */}
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
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
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(c)}
                                            title="Edit Customer"
                                        >
                                            <FaPen />
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(c.CustomerID)}
                                            title="Delete Customer"
                                        >
                                            <FaTrash />
                                        </button>
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