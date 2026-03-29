import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaTrash, FaClipboardList, FaRecycle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface JobOrder {
    JobOrderID: number;
    DateCreated: string;
    Status: string;
    IsArchived: boolean;
    VehicleID: number;
    vehicle?: any;
}

interface Vehicle {
    VehicleID: number;
    Model: string;
    customer?: {
        FirstName: string;
        LastName: string;
    };
}

const JobOrder: React.FC = () => {
    const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'

    // Form states
    const [formData, setFormData] = useState({
        DateCreated: "",
        Status: "",
        VehicleID: "",
    });
    const [searchText, setSearchText] = useState("");

    // FETCH JOB ORDERS
    useEffect(() => {
        setLoading(true);
        setError("");

        const endpoint =
            activeTab === "active"
                ? "http://127.0.0.1:8000/api/job-orders"
                : "http://127.0.0.1:8000/api/job-orders-archived";

        axios
            .get(endpoint)
            .then((res) => {
                setJobOrders(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch job orders");
                setLoading(false);
            });
    }, [activeTab]); // 🔹 runs whenever activeTab changes

    // FETCH VEHICLES
    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/vehicles")
            .then((res) => setVehicles(res.data))
            .catch((err) => console.error(err));
    }, []);

    // HANDLE INPUT CHANGE
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // UPDATE VehicleID BASED ON SELECTION
    useEffect(() => {
        const matchedVehicle = vehicles.find(
            v => String(v.VehicleID) === searchText
        );
        if (matchedVehicle) {
            setFormData(prev => ({
                ...prev,
                VehicleID: String(matchedVehicle.VehicleID), // convert to string
            }));
        } else {
            setFormData(prev => ({ ...prev, VehicleID: "" }));
        }
    }, [searchText, vehicles]);

    // SUBMIT FORM
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        axios.post("http://127.0.0.1:8000/api/job-orders", {
            DateCreated: formData.DateCreated,
            Status: formData.Status,
            VehicleID: Number(formData.VehicleID), // convert to number here
        })
            .then((res) => {
                setJobOrders((prev) => [...prev, res.data.data]);
                setShowModal(false);
                setFormData({
                    DateCreated: "",
                    Status: "",
                    VehicleID: "",
                });
                setSearchText("");
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to create job order");
            });
    };

    const navigate = useNavigate();

    // Edit handler
    const handleManage = (id: number) => {
        navigate(`/joborder/${id}`);
    };


    // DELETE / ARCHIVE
    const handleDelete = (id: number) => {
        axios
            .delete(`http://127.0.0.1:8000/api/job-orders/${id}`)
            .then(() => {
                setJobOrders((prev) =>
                    prev.map((j) =>
                        j.JobOrderID === id ? { ...j, IsArchived: true } : j
                    )
                );
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to delete job order");
            });
    };

    // FILTERED VEHICLES FOR SEARCHABLE DROPDOWN
    const filteredVehicles = vehicles.filter((v) => {
        const name = `${v.customer?.FirstName || ""} ${v.customer?.LastName || ""}`;
        return (
            name.toLowerCase().includes(searchText.toLowerCase()) ||
            String(v.VehicleID).includes(searchText)
        );
    });

    const selectedVehicle = vehicles.find(
        (v) => v.VehicleID === Number(formData.VehicleID)
    );

    const handleRestore = (id: number) => {
    axios
        .patch(`http://127.0.0.1:8000/api/job-orders/${id}`, {
            IsArchived: false
        })
        .then(() => {
            setJobOrders(prev => prev.filter(j => j.JobOrderID !== id));
        })
        .catch(err => {
            console.error(err);
            alert("Failed to restore job order");
        });
};

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
                    <h1>Job Orders</h1>
                    <p>Manage and track all service job orders.</p>
                </div>
                <div className="customerinfo-right">
                    <div className="tabs-container">
                        <button
                            className={activeTab === 'active' ? 'tab active' : 'tab'}
                            onClick={() => setActiveTab('active')}
                        >
                            Active
                        </button>
                        <button
                            className={activeTab === 'archived' ? 'tab active' : 'tab'}
                            onClick={() => setActiveTab('archived')}
                        >
                            Archived
                        </button>

                        <button
                            className="add-customer-btn"
                            disabled={activeTab === "archived"}
                            onClick={() => setShowModal(true)}
                        >
                            + Add Job Order
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Job Order</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="DateCreated"
                                    value={formData.DateCreated}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            {/* 🔹 SEARCHABLE DROPDOWN */}
                            {/* SEARCHABLE DROPDOWN */}
                            <div className="form-group">
                                <label>Vehicle / Customer</label>
                                <input
                                    type="text"
                                    placeholder="Type Vehicle model or Customer name..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    list="vehicle-options"
                                    required
                                />
                                <datalist id="vehicle-options">
                                    {filteredVehicles.map((v) => (
                                        <option
                                            key={v.VehicleID}
                                            value={v.VehicleID} // sets VehicleID when selected
                                        >
                                            {v.Model} - {v.customer?.FirstName} {v.customer?.LastName}
                                        </option>
                                    ))}
                                </datalist>
                            </div>

                            {/* SHOW CUSTOMER NAME & VEHICLE MODEL */}
                            {selectedVehicle && (
                                <>
                                    <div className="form-group">
                                        <label>Customer</label>
                                        <input
                                            type="text"
                                            value={`${selectedVehicle.customer?.FirstName} ${selectedVehicle.customer?.LastName}`}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Vehicle Model</label>
                                        <input
                                            type="text"
                                            value={selectedVehicle.Model || ""}
                                            disabled
                                        />
                                    </div>
                                </>
                            )}

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

            {/* STATES */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {/* TABLE */}
            {!loading && !error && (
                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Vehicle</th>
                                <th>Customer</th>
                                <th>State</th>
                                <th className="action">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobOrders.map((j) => (
                                <tr key={j.JobOrderID}>
                                    <td>{j.JobOrderID}</td>
                                    <td>{j.DateCreated.split("T")[0]}</td>
                                    <td>{j.Status}</td>
                                    <td>#{j.VehicleID}</td>
                                    <td>{j.vehicle?.customer?.FirstName} {j.vehicle?.customer?.LastName}</td>
                                    <td>{j.IsArchived ? "Archived" : "Active"}</td>
                                    <td className="action-buttons">
                                        {activeTab === "active" ? (
                                            <>
                                                <button
                                                    className="manage-btn"
                                                    onClick={() => handleManage(j.JobOrderID)}
                                                    title="Manage Job Order"
                                                >
                                                    <FaClipboardList />
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(j.JobOrderID)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        ) : (
                                            // Archived tab → only restore
                                            <button
                                                className="restore-btn"
                                                onClick={() => handleRestore(j.JobOrderID)}
                                                title="Restore Job Order"
                                            >
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

export default JobOrder;