import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../style/JobOrderDetail.css";

interface Vehicle {
  VehicleID: number;
  customer?: { FirstName?: string; LastName?: string };
}

interface JobOrderItem {
  JobOrderItemID: number;
  StockItemID: number;
  Quantity: number;
  UnitPrice: number;
  stock_item?: {
    ItemName: string;
  };
}

interface JobOrderLabor {
  JobOrderLaborID: number;
  Description: string;
  Cost: number;
}

interface JobOrder {
  JobOrderID: number;
  DateCreated: string;
  Status: string; // We'll use this to determine if billing is generated
  VehicleID: number;
  vehicle?: Vehicle;
  items?: JobOrderItem[];
  labors?: JobOrderLabor[];
}

interface StockItem {
  StockItemID: number;
  ItemName: string;
  Quantity: number;
  UnitPrice: number;
}

const JobOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStockID, setSelectedStockID] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  const [laborDescription, setLaborDescription] = useState<string>("");
  const [laborCost, setLaborCost] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    const fetchJobOrder = axios.get<JobOrder>(`http://localhost:8000/api/job-orders/${id}`);
    const fetchStock = axios.get<StockItem[]>(`http://localhost:8000/api/stock-items`);

    Promise.all([fetchJobOrder, fetchStock])
      .then(([jobRes, stockRes]) => {
        setJobOrder(jobRes.data);
        setStockItems(stockRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch job order or stock items");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!jobOrder) return null;

  // Determine billing state from backend status
  const billingGenerated = jobOrder.Status === "Completed"; // or "Billed" depending on your backend

  // --- Handlers ---
  const handleAddItem = async () => {
    if (!selectedStockID || stockQuantity <= 0 || billingGenerated) return;
    try {
      const res = await axios.post(
        `http://localhost:8000/api/job-orders/${jobOrder.JobOrderID}/items`,
        { StockItemID: selectedStockID, Quantity: stockQuantity }
      );
      setJobOrder(prev => prev ? { ...prev, items: [...(prev.items || []), res.data] } : prev);
      setSelectedStockID(null);
      setStockQuantity(1);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  const handleAddLabor = async () => {
    if (!laborDescription || laborCost <= 0 || billingGenerated) return;
    try {
      const res = await axios.post(
        `http://localhost:8000/api/job-orders/${jobOrder.JobOrderID}/labors`,
        { Description: laborDescription, Cost: laborCost }
      );
      setJobOrder(prev => prev ? { ...prev, labors: [...(prev.labors || []), res.data] } : prev);
      setLaborDescription("");
      setLaborCost(0);
    } catch {
      alert("Failed to add labor");
    }
  };

  const totalItems = jobOrder.items?.reduce(
    (sum, item) => sum + item.Quantity * item.UnitPrice,
    0
  ) || 0;

  const totalLabor = jobOrder.labors?.reduce(
    (sum, labor) => sum + Number(labor.Cost),
    0
  ) || 0;

  const grandTotal = totalItems + totalLabor;

  return (
    <div className="joborder-container">
      <h1>Job Order Details</h1>
      <div className="joborder-card">
        <p><strong>ID:</strong> {jobOrder.JobOrderID}</p>
        <p><strong>Status:</strong> {jobOrder.Status}</p>
        <p><strong>Date Created:</strong> {jobOrder.DateCreated}</p>
        <p><strong>Vehicle ID:</strong> {jobOrder.VehicleID}</p>
        {jobOrder.vehicle?.customer && (
          <p>
            Customer: {jobOrder.vehicle.customer.FirstName} {jobOrder.vehicle.customer.LastName}
          </p>
        )}
      </div>

      {/* Inventory Form */}
      <div className="joborder-card">
        <h2>Items Used</h2>
        <table className="item-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Cost</th>
              <th>Total</th>
              {!billingGenerated && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {jobOrder.items?.map(item => (
              <tr key={item.JobOrderItemID}>
                <td>{item.stock_item?.ItemName || item.StockItemID}</td>
                <td>{item.Quantity}</td>
                <td>{item.UnitPrice}</td>
                <td>{item.Quantity * item.UnitPrice}</td>
                {!billingGenerated && (
                  <td>
                    <button
                      className="remove-btn"
                      onClick={async () => {
                        try {
                          await axios.delete(
                            `http://localhost:8000/api/job-orders/items/${item.JobOrderItemID}`
                          );
                          setJobOrder(prev =>
                            prev
                              ? {
                                  ...prev,
                                  items: prev.items!.filter(
                                    i => i.JobOrderItemID !== item.JobOrderItemID
                                  ),
                                }
                              : prev
                          );
                        } catch {
                          alert("Failed to remove item");
                        }
                      }}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {/* Input Row */}
            {!billingGenerated && (
              <tr>
                <td>
                  <select
                    value={selectedStockID || ""}
                    onChange={(e) => setSelectedStockID(Number(e.target.value))}
                  >
                    <option value="">Select item</option>
                    {stockItems.map(stock => (
                      <option key={stock.StockItemID} value={stock.StockItemID}>
                        {stock.ItemName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                  />
                </td>
                <td>
                  {stockItems.find(s => s.StockItemID === selectedStockID)?.UnitPrice || "-"}
                </td>
                <td>
                  {(stockItems.find(s => s.StockItemID === selectedStockID)?.UnitPrice || 0) *
                    stockQuantity}
                </td>
                <td>
                  <button onClick={handleAddItem}>Add</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h3>Total Items: ${totalItems}</h3>

      {/* Labor Form */}
      <div className="joborder-card">
        <h2>Labor</h2>
        <table className="item-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Cost</th>
              {!billingGenerated && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {jobOrder.labors?.map(labor => (
              <tr key={labor.JobOrderLaborID}>
                <td>{labor.Description}</td>
                <td>{labor.Cost}</td>
                {!billingGenerated && (
                  <td>
                    <button
                      className="remove-btn"
                      onClick={async () => {
                        try {
                          await axios.delete(
                            `http://localhost:8000/api/job-orders/labors/${labor.JobOrderLaborID}`
                          );
                          setJobOrder(prev =>
                            prev
                              ? {
                                  ...prev,
                                  labors: prev.labors!.filter(
                                    l => l.JobOrderLaborID !== labor.JobOrderLaborID
                                  ),
                                }
                              : prev
                          );
                        } catch {
                          alert("Failed to remove labor");
                        }
                      }}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {!billingGenerated && (
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={laborDescription}
                    onChange={(e) => setLaborDescription(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    placeholder="Cost"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                  />
                </td>
                <td>
                  <button onClick={handleAddLabor}>Add</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h3>Total Labor: ${totalLabor}</h3>
      <h2>Grand Total: ${grandTotal}</h2>

      <button
        className="generate-btn"
        disabled={billingGenerated}
        onClick={async () => {
          try {
            await axios.post(
              `http://localhost:8000/api/job-orders/${jobOrder.JobOrderID}/generate-billing`
            );

            alert("Billing generated successfully!");
            // Refetch to get updated status
            const res = await axios.get<JobOrder>(`http://localhost:8000/api/job-orders/${id}`);
            setJobOrder(res.data);

          } catch (err: any) {
            alert(err.response?.data?.message || "Failed to generate billing");
          }
        }}
      >
        {billingGenerated ? "Billing Generated" : "Generate Billing"}
      </button>
    </div>
  );
};

export default JobOrderDetails;