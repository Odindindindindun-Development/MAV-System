import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../style/BillingDetail.css";

interface BillingItem {
  JobOrderItemID: number;
  Quantity: number;
  UnitPrice: number;
  stock_item?: {
    ItemName: string;
  };
}

interface BillingLabor {
  JobOrderLaborID: number;
  Description: string;
  Cost: number;
}

interface BillingAdjustment {
  BillingAdjustmentID: number;
  Description: string;
  Amount: number;
}

interface Payment {
  PaymentID: number;
  Amount: number;
  PaymentDate: string;
  PaymentMethod: string;
}

interface Billing {
  BillingID: number;
  TotalAmount: number;
  Status: string;
  DateIssued: string;
  customer?: {
    FirstName: string;
    LastName: string;
  };
  job_order?: {
    JobOrderID: number;
    items?: BillingItem[];
    labors?: BillingLabor[];
  };
  adjustments?: BillingAdjustment[];
  payments?: Payment[];
}

const BillingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [billing, setBilling] = useState<Billing | null>(null);
  const [adjustments, setAdjustments] = useState<BillingAdjustment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment inputs
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState<number>(0);

  // Payment inputs
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:8000/api/billings/${id}`)
      .then((res) => {
        setBilling(res.data);
        setAdjustments(res.data.adjustments || []);
        setPayments(res.data.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!billing) return <p>Billing not found</p>;

  // --- TOTALS ---
  const itemsTotal =
    billing.job_order?.items?.reduce(
      (sum, item) => sum + item.Quantity * Number(item.UnitPrice),
      0
    ) || 0;

  const laborTotal =
    billing.job_order?.labors?.reduce(
      (sum, labor) => sum + Number(labor.Cost),
      0
    ) || 0;

  const adjustmentTotal = adjustments.reduce(
    (sum, a) => sum + Number(a.Amount),
    0
  );

  const grandTotal = Number(billing.TotalAmount);

  const paymentsTotal = payments.reduce((sum, p) => sum + Number(p.Amount), 0);

  const balance = grandTotal - paymentsTotal;

  // --- HANDLERS ---
  const handleAddAdjustment = async () => {
    if (!desc || amount <= 0) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/billings/${billing.BillingID}/adjustments`,
        {
          Description: desc,
          Amount: amount,
        }
      );
      setAdjustments((prev) => [...prev, res.data]);
      setDesc("");
      setAmount(0);
    } catch {
      alert("Failed to add adjustment");
    }
  };

const handleAddPayment = async () => {
  // Prevent invalid payment
  if (paymentAmount <= 0) {
    alert("Enter a valid payment amount");
    return;
  }

  try {
    const res = await axios.post("http://localhost:8000/api/payments", {
      BillingID: billing?.BillingID,
      Amount: paymentAmount,
      PaymentDate: paymentDate,
      PaymentMethod: paymentMethod,
    });

    // Backend returns { payment, billing }
    const { payment: newPayment, billing: updatedBilling } = res.data;

    // Add new payment to payments state
    setPayments(prev => [...prev, newPayment]);

    // Update billing state (includes updated status, totals, etc.)
    setBilling(updatedBilling);

    // Reset payment inputs
    setPaymentAmount(0);
    setPaymentMethod("Cash");
    setPaymentDate(new Date().toISOString().slice(0, 10));
  } catch (err: any) {
    console.error("Payment error:", err.response?.data || err.message);
    alert("Payment failed. Check console for details.");
  }
};

  return (
    <div className="billing-container">
      <h1>Invoice</h1>

      {/* INFO */}
      <div className="billing-card">
        <p>
          <strong>Invoice ID:</strong> {billing.BillingID}
        </p>
        <p>
          <strong>Job Order:</strong> #{billing.job_order?.JobOrderID}
        </p>
        <p>
          <strong>Customer:</strong> {billing.customer?.FirstName}{" "}
          {billing.customer?.LastName}
        </p>
        <p>
          <strong>Date Issued:</strong> {billing.DateIssued}
        </p>
        <p>
          <strong>Status:</strong> {billing.Status}
        </p>
      </div>

      {/* ITEMS */}
      <div className="billing-card">
        <h2>Items</h2>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {billing.job_order?.items?.map((item) => (
              <tr key={item.JobOrderItemID}>
                <td>{item.stock_item?.ItemName}</td>
                <td>{item.Quantity}</td>
                <td>₱{Number(item.UnitPrice).toFixed(2)}</td>
                <td>₱{(item.Quantity * Number(item.UnitPrice)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Items Total: ₱{itemsTotal.toFixed(2)}</h3>
      </div>

      {/* LABOR */}
      <div className="billing-card">
        <h2>Labor</h2>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {billing.job_order?.labors?.map((labor) => (
              <tr key={labor.JobOrderLaborID}>
                <td>{labor.Description}</td>
                <td>₱{Number(labor.Cost).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Labor Total: ₱{laborTotal.toFixed(2)}</h3>
      </div>

      {/* ADJUSTMENTS */}
      <div className="billing-card">
        <h2>Adjustments</h2>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              {billing.Status !== "Paid" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {adjustments.map((adj) => (
              <tr key={adj.BillingAdjustmentID}>
                <td>{adj.Description}</td>
                <td>₱{Number(adj.Amount).toFixed(2)}</td>
              </tr>
            ))}

            {billing.Status !== "Paid" && (
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="Description"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </td>
                <td>
                  <button onClick={handleAddAdjustment}>Add</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <h3>Adjustment Total: ₱{adjustmentTotal.toFixed(2)}</h3>
      </div>

      {/* GRAND TOTAL */}
      <div className="billing-total">
        <h2>Grand Total: ₱{grandTotal.toFixed(2)}</h2>
      </div>

      {/* PAYMENTS */}
      <div className="billing-card">
        <h2>Payments</h2>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              {billing.Status !== "Paid" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.PaymentID}>
                <td>{p.PaymentDate}</td>
                <td>₱{Number(p.Amount).toFixed(2)}</td>
                <td>{p.PaymentMethod}</td>
              </tr>
            ))}

            {billing.Status !== "Paid" && (
              <tr>
                <td>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  />
                </td>
                <td>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Gcash">Gcash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </td>
                <td>
                  <button onClick={handleAddPayment}>Pay</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <h3>Payments Total: ₱{paymentsTotal.toFixed(2)}</h3>
        <h3>Balance: ₱{balance.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default BillingDetail;