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

    // ✅ PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // FETCH
    useEffect(() => {
        setLoading(true);

        const endpoint =
            activeTab === "active"
                ? "https://mav-backend-system.onrender.com/api/customers"
                : "https://mav-backend-system.onrender.com/api/customers-archived";

        axios.get(endpoint)
            .then(res => {
                setCustomers(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeTab]);

    // RESET PAGE WHEN TAB CHANGES
    useEffect(() => {
        setCurrentPage(1);
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
  const confirmDelete = window.confirm("Are you sure you want to archive this customer?");
  if (!confirmDelete) return;

  axios.delete(`https://mav-backend-system.onrender.com/api/customers/${id}`)
    .then(() => {
      setCustomers(prev => prev.filter(c => c.CustomerID !== id));
      alert("Customer archived successfully.");
    })
    .catch(err => {
      const message = err.response?.data?.message
        || "Failed to archive customer.";
      alert(message);
    });
};

    // RESTORE
    const handleRestore = (id: number) => {
    const confirmRestore = window.confirm("Do you want to restore this customer?");

    if (!confirmRestore) return;

    axios.patch(`https://mav-backend-system.onrender.com/api/customers/${id}/restore`)
        .then(() => {
            setCustomers(prev =>
                prev.filter(c => c.CustomerID !== id)
            );
            alert("Customer restored successfully.");
        })
        .catch(() => {
            alert("Failed to restore customer.");
        });
};

    // SUBMIT
const handleSubmit = (e: any) => {
    e.preventDefault();

    const contact = formData.Contact;

    // 🔥 duplicates (ignore current record when editing)
    const fullNameExists = customers.some(c =>
    c.CustomerID !== currentCustomerID &&
    (c.FirstName ?? "").toLowerCase().trim() === formData.FirstName.toLowerCase().trim() &&
    (c.LastName ?? "").toLowerCase().trim() === formData.LastName.toLowerCase().trim()
);

const emailExists = customers.some(c =>
    c.CustomerID !== currentCustomerID &&
    (c.Email ?? "").toLowerCase().trim() === formData.Email.toLowerCase().trim()
);

const contactExists = customers.some(c =>
    c.CustomerID !== currentCustomerID &&
    (c.Contact ?? "") === formData.Contact
);

    // 🔥 CONTACT VALIDATION
    if (!/^[0-9]+$/.test(contact)) {
        alert("Contact number must contain digits only.");
        return;
    }

    if (contact.length !== 11) {
        alert("Contact number must be exactly 11 digits.");
        return;
    }

    // 🔥 EMAIL VALIDATION (fixes '@' only issue)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
        alert("Please enter a valid email address (e.g. name@gmail.com).");
        return;
    }

    // 🔥 DUPLICATE CHECKS (ADD + EDIT SAFE)
    if (fullNameExists) {
        alert("A customer with this name already exists.");
        return;
    }

    if (emailExists) {
        alert("This email is already registered.");
        return;
    }

    if (contactExists) {
        alert("This contact number is already registered.");
        return;
    }

    // API REQUEST
    if (isEditing && currentCustomerID) {
        axios.put(`https://mav-backend-system.onrender.com/api/customers/${currentCustomerID}`, formData)
            .then(res => {
                setCustomers(prev =>
                    prev.map(c =>
                        c.CustomerID === currentCustomerID ? res.data : c
                    )
                );
                setShowModal(false);
            });
    } else {
        axios.post("https://mav-backend-system.onrender.com/api/customers", formData)
            .then(res => {
                setCustomers(prev => [...prev, res.data]);
                setShowModal(false);
            });
    }
};

    // ✅ PAGINATION LOGIC
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentCustomers = customers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(customers.length / rowsPerPage);

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
                                <input
                                    name="Contact"
                                    value={formData.Contact}
                                    onChange={handleChange}
                                    maxLength={11}
                                    inputMode="numeric"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input name="Email" value={formData.Email} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input name="Address" value={formData.Address} onChange={handleChange} required />
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
                            {currentCustomers.map(c => (
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

                    {/* PAGINATION */}
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
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInfo;