import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaEye } from "react-icons/fa";

interface Billing {
    BillingID: number;
    JobOrderID: number;
    CustomerName?: string;
    TotalAmount: number;
    Status: string;
    created_at: string;
}

const Billings: React.FC = () => {
    const [billings, setBillings] = useState<Billing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/billings")
            .then((res) => {
                setBillings(res.data.data); // adjust if needed
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch billings");
                setLoading(false);
            });
    }, []);

    const handleView = (id: number) => {
        console.log("View billing:", id);
        // navigate(`/billings/${id}`);
    };

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
                    <h1>Billing</h1>
                    <p>View and manage all generated billings.</p>
                </div>
                <div className="customerinfo-right">
                    {/* ❌ No Add Button */}
                </div>
            </div>

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
                                <th>Job Order</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th className="action">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billings.map((b) => (
                                <tr key={b.BillingID}>
                                    <td>{b.BillingID}</td>
                                    <td>#{b.JobOrderID}</td>
                                    <td>{b.CustomerName || "—"}</td>
                                    <td>₱{b.TotalAmount}</td>
                                    <td>
                                        <span className={`status ${b.Status.toLowerCase()}`}>
                                            {b.Status}
                                        </span>
                                    </td>
                                    <td>{b.created_at?.split("T")[0]}</td>
                                    <td className="action-buttons">
                                        <button
                                            className="view-btn"
                                            onClick={() => handleView(b.BillingID)}
                                            title="View Billing"
                                        >
                                            <FaEye />
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

export default Billings;