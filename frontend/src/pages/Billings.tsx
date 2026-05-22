import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Billing {
    BillingID: number;
    JobOrderID: number;
    TotalAmount: number;
    Status: string;
    created_at: string;

    customer?: {
        FirstName: string;
        LastName: string;
    };
}

const Billings: React.FC = () => {
    const [billings, setBillings] = useState<Billing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        axios
            .get("https://mav-backend-system.onrender.com/api/billings")
            .then((res) => {
                setBillings(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch billings");
                setLoading(false);
            });
    }, []);

    const navigate = useNavigate();

    const handleManage = (id: number) => {
        navigate(`/billings/${id}`);
    };

    // PAGINATION LOGIC
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentBillings = billings.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(billings.length / rowsPerPage);

    return (
        <div>
            {/* HEADER */}
            <div className="upper-customerinfo-container">
                <div className="customerinfo-left">
                    <h1>Billing</h1>
                    <p>View and manage all generated billings.</p>
                </div>

                <div className="customerinfo-right">
                    {/* No Add Button */}
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
                            {currentBillings.map((b) => (
                                <tr key={b.BillingID}>
                                    <td>{b.BillingID}</td>

                                    <td>#{b.JobOrderID}</td>

                                    <td>
                                        {b.customer
                                            ? `${b.customer.FirstName} ${b.customer.LastName}`
                                            : "—"}
                                    </td>

                                    <td>₱{Number(b.TotalAmount).toFixed(2)}</td>

                                    <td>
                                        <span
                                            className={`status ${b.Status.toLowerCase()}`}
                                        >
                                            {b.Status}
                                        </span>
                                    </td>

                                    <td>
                                        {new Date(b.created_at).toLocaleDateString(
                                            "en-PH",
                                            {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            }
                                        )}
                                    </td>

                                    <td className="action-buttons">
                                        <button
                                            className="manage-btn"
                                            onClick={() =>
                                                handleManage(b.BillingID)
                                            }
                                            title="View Billing"
                                        >
                                            <FaClipboardList />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* PAGINATION */}
                    <div className="pagination">
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1)
                                )
                            }
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={
                                    currentPage === i + 1
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
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

export default Billings;