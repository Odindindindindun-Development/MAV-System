import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../style/BillingDetail.css";

interface BillingItem {
  JobOrderItemID: number;
  Quantity: number;
  UnitPrice: number;
  stock_item?: { ItemName: string };
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
  customer?: { FirstName: string; LastName: string };
  job_order?: { JobOrderID: number; items?: BillingItem[]; labors?: BillingLabor[] };
  adjustments?: BillingAdjustment[];
  payments?: Payment[];
}

const BillingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [billing, setBilling] = useState<Billing | null>(null);
  const [adjustments, setAdjustments] = useState<BillingAdjustment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  // Fetch billing + related adjustments and payments
  const fetchBilling = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/billings/${id}`);
      const data = res.data;
      setBilling(data);
      setAdjustments(data.adjustments || []);
      setPayments(data.payments || []);
    } catch {
      alert("Failed to fetch billing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!billing) return <p>Billing not found</p>;

  // --- COMPUTED TOTALS ---
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

  const adjustmentTotal = adjustments.reduce((sum, a) => sum + Number(a.Amount), 0);

  const grandTotal = itemsTotal + laborTotal + adjustmentTotal;

  const paymentsTotal = payments.reduce((sum, p) => sum + Number(p.Amount), 0);

  const balance = grandTotal - paymentsTotal;

  // --- HANDLERS ---
  const handleAddAdjustment = async () => {
    if (!desc || amount <= 0) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/billings/${billing.BillingID}/adjustments`,
        { Description: desc, Amount: amount }
      );
      setAdjustments((prev) => [...prev, res.data.adjustment]);
      setBilling(res.data.billing); // update billing totals and status
      setDesc("");
      setAmount(0);
    } catch {
      alert("Failed to add adjustment");
    }
  };

  const handleRemoveAdjustment = async (adjId: number) => {
    if (!window.confirm("Are you sure you want to remove this adjustment?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:8000/api/billings/${billing.BillingID}/adjustments/${adjId}`
      );
      setAdjustments((prev) => prev.filter((a) => a.BillingAdjustmentID !== adjId));
      setBilling(res.data.billing); // update totals and status
    } catch {
      alert("Failed to remove adjustment");
    }
  };

  const handleAddPayment = async () => {
    if (paymentAmount <= 0) return alert("Enter a valid payment amount");

    try {
      const res = await axios.post("http://localhost:8000/api/payments", {
        BillingID: billing.BillingID,
        Amount: paymentAmount,
        PaymentDate: paymentDate,
        PaymentMethod: paymentMethod,
      });

      const { payment: newPayment, billing: updatedBilling } = res.data;
      setPayments((prev) => [...prev, newPayment]);
      setBilling(updatedBilling); // update grand total, balance, and status
      setPaymentAmount(0);
      setPaymentMethod("Cash");
      setPaymentDate(new Date().toISOString().slice(0, 10));
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Payment failed");
    }
  };

  return (
    <div className="billing-container">
      <h1>Invoice</h1>

      {/* INFO */}
      <div className="billing-card">
        <p><strong>Invoice ID:</strong> {billing.BillingID}</p>
        <p><strong>Job Order:</strong> #{billing.job_order?.JobOrderID}</p>
        <p><strong>Customer:</strong> {billing.customer?.FirstName} {billing.customer?.LastName}</p>
        <p><strong>Date Issued:</strong> {billing.DateIssued}</p>
        <p><strong>Status:</strong> {billing.Status}</p>
      </div>

      {/* ITEMS */}
      <div className="billing-card">
        <h2>Items</h2>
        <table className="billing-table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {billing.job_order?.items?.map(item => (
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
          <thead><tr><th>Description</th><th>Cost</th></tr></thead>
          <tbody>
            {billing.job_order?.labors?.map(l => (
              <tr key={l.JobOrderLaborID}><td>{l.Description}</td><td>₱{Number(l.Cost).toFixed(2)}</td></tr>
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
            {adjustments.map(adj => (
              <tr key={adj.BillingAdjustmentID}>
                <td>{adj.Description}</td>
                <td>₱{Number(adj.Amount).toFixed(2)}</td>
                {billing.Status !== "Paid" && (
                  <td>
                    <button className="remove-btn" onClick={() => handleRemoveAdjustment(adj.BillingAdjustmentID)}>Remove</button>
                  </td>
                )}
              </tr>
            ))}
            {billing.Status !== "Paid" && (
              <tr>
                <td><input type="text" value={desc} placeholder="Description" onChange={e => setDesc(e.target.value)} /></td>
                <td><input type="number" value={amount} placeholder="Amount" onChange={e => setAmount(Number(e.target.value))} /></td>
                <td><button onClick={handleAddAdjustment}>Add</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <h3>Adjustment Total: ₱{adjustmentTotal.toFixed(2)}</h3>
      </div>

      {/* GRAND TOTAL */}
      <div className="billing-total"><h2>Grand Total: ₱{grandTotal.toFixed(2)}</h2></div>

      {/* PAYMENTS */}
      <div className="billing-card">
        <h2>Payments</h2>
        <table className="billing-table">
          <thead>
            <tr><th>Date</th><th>Amount</th><th>Method</th>{billing.Status !== "Paid" && <th>Action</th>}</tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.PaymentID}>
                <td>{p.PaymentDate}</td>
                <td>₱{Number(p.Amount).toFixed(2)}</td>
                <td>{p.PaymentMethod}</td>
              </tr>
            ))}
            {billing.Status !== "Paid" && (
              <tr>
                <td><input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} /></td>
                <td><input type="number" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} /></td>
                <td>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gcash">Gcash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </td>
                <td><button onClick={handleAddPayment}>Pay</button></td>
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