import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../style/JobOrderDetail.css";

interface Vehicle {
  VehicleID: number;
  Model?: string;
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
  Status: string;
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

  // 🔍 Searchable item
  const [searchStockText, setSearchStockText] = useState("");
  const [selectedStockID, setSelectedStockID] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  // Labor
  const [laborDescription, setLaborDescription] = useState("");
  const [laborCost, setLaborCost] = useState(0);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      axios.get(`http://localhost:8000/api/job-orders/${id}`),
      axios.get(`http://localhost:8000/api/stock-items`)
    ])
      .then(([jobRes, stockRes]) => {
        setJobOrder(jobRes.data);
        setStockItems(stockRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [id]);

  // 🔍 FILTER ITEMS
  const filteredStock = stockItems.filter(item =>
    item.ItemName.toLowerCase().includes(searchStockText.toLowerCase()) ||
    String(item.StockItemID).includes(searchStockText)
  );

  // 🎯 MATCH ID
  useEffect(() => {
    const match = stockItems.find(
      s => String(s.StockItemID) === searchStockText
    );

    if (match) setSelectedStockID(match.StockItemID);
    else setSelectedStockID(null);
  }, [searchStockText, stockItems]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!jobOrder) return null;

  const billingGenerated = jobOrder.Status === "Completed";

  const selectedItem = stockItems.find(
    s => s.StockItemID === selectedStockID
  );

  // ➕ ADD ITEM
  const handleAddItem = async () => {
    if (!selectedStockID || stockQuantity <= 0 || billingGenerated) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/job-orders/${jobOrder.JobOrderID}/items`,
        { StockItemID: selectedStockID, Quantity: stockQuantity }
      );

      setJobOrder(prev =>
        prev
          ? { ...prev, items: [...(prev.items || []), res.data] }
          : prev
      );

      setSearchStockText("");
      setSelectedStockID(null);
      setStockQuantity(1);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  // ➕ ADD LABOR
  const handleAddLabor = async () => {
    if (!laborDescription || laborCost <= 0 || billingGenerated) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/job-orders/${jobOrder.JobOrderID}/labors`,
        { Description: laborDescription, Cost: laborCost }
      );

      setJobOrder(prev =>
        prev
          ? { ...prev, labors: [...(prev.labors || []), res.data] }
          : prev
      );

      setLaborDescription("");
      setLaborCost(0);
    } catch {
      alert("Failed to add labor");
    }
  };

  // 💰 TOTALS
  const totalItems =
    jobOrder.items?.reduce(
      (sum, item) => sum + item.Quantity * item.UnitPrice,
      0
    ) || 0;

  const totalLabor =
    jobOrder.labors?.reduce((sum, l) => sum + Number(l.Cost), 0) || 0;

  const grandTotal = totalItems + totalLabor;

  return (
    <div className="joborder-container">
      <h1>Job Order Details</h1>

      {/* ✅ RESTORED INFO */}
      <div className="joborder-card">
        <p><strong>ID:</strong> {jobOrder.JobOrderID}</p>
        <p><strong>Status:</strong> {jobOrder.Status}</p>
        <p><strong>Date:</strong> {jobOrder.DateCreated}</p>
        <p><strong>Vehicle ID:</strong> {jobOrder.VehicleID}</p>

        {jobOrder.vehicle?.customer && (
          <p>
            <strong>Customer:</strong>{" "}
            {jobOrder.vehicle.customer.FirstName}{" "}
            {jobOrder.vehicle.customer.LastName}
          </p>
        )}

        {jobOrder.vehicle?.Model && (
          <p><strong>Vehicle Model:</strong> {jobOrder.vehicle.Model}</p>
        )}
      </div>

      {/* ITEMS */}
      <div className="joborder-card">
        <h2>Items Used</h2>

        <table className="item-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              {!billingGenerated && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {jobOrder.items?.map(item => (
              <tr key={item.JobOrderItemID}>
                <td>{item.stock_item?.ItemName}</td>
                <td>{item.Quantity}</td>
                <td>{item.UnitPrice}</td>
                <td>{item.Quantity * item.UnitPrice}</td>
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
              </tr>
            ))}

            {!billingGenerated && (
              <tr>
                <td>
                  <input
                    placeholder="Search item..."
                    value={searchStockText}
                    onChange={(e) => setSearchStockText(e.target.value)}
                    list="stock-options"
                  />
                  <datalist id="stock-options">
                    {filteredStock.map(item => (
                      <option
                        key={item.StockItemID}
                        value={item.StockItemID}
                      >
                        {item.ItemName}
                      </option>
                    ))}
                  </datalist>
                </td>

                <td>
                  <input
                    type="number"
                    min={1}
                    value={stockQuantity}
                    onChange={(e) =>
                      setStockQuantity(Number(e.target.value))
                    }
                  />
                </td>

                <td>{selectedItem?.UnitPrice || "-"}</td>

                <td>
                  {(selectedItem?.UnitPrice || 0) * stockQuantity}
                </td>

                <td>
                  <button onClick={handleAddItem}>Add</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3>Total Items: {totalItems}</h3>

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