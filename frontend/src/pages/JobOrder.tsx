import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface JobOrder {
    JobOrderID: number;
    DateCreated: string;
    Status: string;
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

    const [formData, setFormData] = useState({
        DateCreated: "",
        Status: "",
        VehicleID: "",
    });

    const [searchText, setSearchText] = useState("");

    // ✅ PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const navigate = useNavigate();

    // FETCH JOB ORDERS
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/job-orders")
            .then(res => {
                setJobOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to fetch job orders");
                setLoading(false);
            });
    }, []);

    // FETCH VEHICLES
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/vehicles")
            .then(res => setVehicles(res.data))
            .catch(err => console.error(err));
    }, []);

    // HANDLE INPUT
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // MATCH VEHICLE FROM SEARCH
    useEffect(() => {
        const matched = vehicles.find(v => String(v.VehicleID) === searchText);

        if (matched) {
            setFormData(prev => ({
                ...prev,
                VehicleID: String(matched.VehicleID),
            }));
        } else {
            setFormData(prev => ({ ...prev, VehicleID: "" }));
        }
    }, [searchText, vehicles]);

    // SUBMIT
    const handleSubmit = (e: any) => {
        e.preventDefault();

        axios.post("http://127.0.0.1:8000/api/job-orders", {
            DateCreated: formData.DateCreated,
            Status: formData.Status,
            VehicleID: Number(formData.VehicleID),
        })
        .then(res => {
            setJobOrders(prev => [...prev, res.data.data]);
            setShowModal(false);
            setFormData({
                DateCreated: "",
                Status: "",
                VehicleID: "",
            });
            setSearchText("");
            setCurrentPage(1); // reset page
        })
        .catch(err => {
            console.error(err);
            alert("Failed to create job order");
        });
    };

    const handleManage = (id: number) => {
        navigate(`/joborder/${id}`);
    };

    // FILTER VEHICLES
    const filteredVehicles = vehicles.filter(v => {
        const name = `${v.customer?.FirstName || ""} ${v.customer?.LastName || ""}`;
        return (
            name.toLowerCase().includes(searchText.toLowerCase()) ||
            String(v.VehicleID).includes(searchText)
        );
    });

    const selectedVehicle = vehicles.find(
        v => v.VehicleID === Number(formData.VehicleID)
    );

    // ✅ PAGINATION LOGIC
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = jobOrders.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(jobOrders.length / rowsPerPage);

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
                    <h1>Job Orders</h1>
                    <p>Manage and track all service job orders.</p>
                </div>

                <button
                    className="add-customer-btn"
                    onClick={() => setShowModal(true)}
                >
                    + Add Job Order
                </button>
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

                            <div className="form-group">
                                <label>Vehicle / Customer</label>
                                <input
                                    type="text"
                                    placeholder="Type Vehicle ID or Customer..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    list="vehicle-options"
                                    required
                                />

                                <datalist id="vehicle-options">
                                    {filteredVehicles.map(v => (
                                        <option key={v.VehicleID} value={v.VehicleID}>
                                            {v.Model} - {v.customer?.FirstName} {v.customer?.LastName}
                                        </option>
                                    ))}
                                </datalist>
                            </div>

                            {selectedVehicle && (
                                <>
                                    <div className="form-group">
                                        <label>Customer</label>
                                        <input
                                            value={`${selectedVehicle.customer?.FirstName} ${selectedVehicle.customer?.LastName}`}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Vehicle Model</label>
                                        <input
                                            value={selectedVehicle.Model}
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
                                <th className="action">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentRows.map(j => (
                                <tr key={j.JobOrderID}>
                                    <td>{j.JobOrderID}</td>
                                    <td>{j.DateCreated.split("T")[0]}</td>
                                    <td>{j.Status}</td>
                                    <td>#{j.VehicleID}</td>
                                    <td>
                                        {j.vehicle?.customer?.FirstName}{" "}
                                        {j.vehicle?.customer?.LastName}
                                    </td>

                                    <td className="action-buttons">
                                        <button
                                            className="manage-btn"
                                            onClick={() => handleManage(j.JobOrderID)}
                                        >
                                            <FaClipboardList />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ✅ PAGINATION */}
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

export default JobOrder;