import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/FinancialRecords.css";

interface Payment {
  PaymentID: number;
  BillingID: number;
  Amount: number;
  PaymentDate: string;
  PaymentMethod: string;
  billing?: {
    Status: string;
    customer?: {
      CustomerID: number;
      FirstName: string;
      LastName: string;
    };
  };
}

interface Expense {
  ExpenseID: number;
  Category: string;
  Amount: number;
  ExpenseDate: string;
  Description: string;
}

interface ExpenseForm {
  Category: string;
  Amount: string;
  ExpenseDate: string;
  Description: string;
}





const FinancialRecords: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "history">("overview");
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    Category: "",
    Amount: "",
    ExpenseDate: "",
    Description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAll = () => {
    axios.get("http://localhost:8000/api/financial-records")
      .then(res => setData(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:8000/api/payments")
      .then(res => setPayments(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:8000/api/expenses")
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setExpenseForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post("http://localhost:8000/api/expenses", expenseForm);
      setSuccess("Expense recorded successfully.");
      setExpenseForm({ Category: "", Amount: "", ExpenseDate: "", Description: "" });
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/expenses/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const statusClass = (status?: string) => {
    if (status === "Paid") return "badge badge-success";
    if (status === "Partial") return "badge badge-warning";
    return "badge badge-pending";
  };

  if (!data) return <p>Loading financial data...</p>;

  return (
    <div className="financial-container">
      <h1>Financial Records</h1>

      {/* Tabs */}
      <div className="tabs">
        {(["overview", "expenses", "history"] as const).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "Overview" : tab === "expenses" ? "Expenses" : "Payment History"}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="financial-grid">
          <div className="card"><h3>Total Revenue</h3><p>₱{Number(data.totalPayments).toFixed(2)}</p></div>
          <div className="card"><h3>Total Expenses</h3><p>₱{Number(data.totalExpenses).toFixed(2)}</p></div>
          <div className="card"><h3>Outstanding Balance</h3><p>₱{Number(data.totalBalance).toFixed(2)}</p></div>
          <div className="card net-profit"><h3>Net Profit</h3><p>₱{Number(data.netProfit).toFixed(2)}</p></div>
        </div>
      )}

      {/* Expenses: Form + List */}
      {activeTab === "expenses" && (
        <>
          {/* Form */}
          <div className="form-card">
            <h2>Record New Expense</h2>
            {error && <p className="alert alert-error">{error}</p>}
            {success && <p className="alert alert-success">{success}</p>}
            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select name="Category" value={expenseForm.Category} onChange={handleExpenseChange} required>
                  <option value="">Select category</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Labor">Labor</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₱)</label>
                  <input
                    type="number"
                    name="Amount"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseForm.Amount}
                    onChange={handleExpenseChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="ExpenseDate"
                    value={expenseForm.ExpenseDate}
                    onChange={handleExpenseChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="Description"
                  rows={3}
                  placeholder="Brief description…"
                  value={expenseForm.Description}
                  onChange={handleExpenseChange}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save Expense"}
              </button>
            </form>
          </div>

          {/* Expense List */}
          <div className="table-card" style={{ marginTop: "1.5rem" }}>
            <h2>Expense Records</h2>
            {expenses.length === 0 ? (
              <p>No expenses recorded yet.</p>
            ) : (
              <table className="data-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Date</th>
      <th>Category</th>
      <th>Description</th>
      <th>Amount</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {expenses.map(exp => (
      <tr key={exp.ExpenseID}>
        <td>#{exp.ExpenseID}</td>
        <td>{new Date(exp.ExpenseDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</td>
        <td><span className="badge badge-pending">{exp.Category}</span></td>
        <td>{exp.Description || "—"}</td>
        <td>₱{Number(exp.Amount).toFixed(2)}</td>
        <td>
          <button
            className="btn-delete"
            onClick={() => handleDeleteExpense(exp.ExpenseID)}
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <td colSpan={4}><strong>Total</strong></td>
      <td><strong>₱{expenses.reduce((sum, e) => sum + Number(e.Amount), 0).toFixed(2)}</strong></td>
      <td />
    </tr>
  </tfoot>
</table>
            )}
          </div>
        </>
      )}

      {/* Payment History */}
      {activeTab === "history" && (
        <div className="table-card">
          <h2>Payment History</h2>
          {payments.length === 0 ? (
            <p>No payments found.</p>
          ) : (
            <table className="data-table">
  <thead>
    <tr>
      <th>Billing ID</th>
      <th>Customer</th>
      <th>Amount</th>
      <th>Method</th>
      <th>Date</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {payments.map(p => (
      <tr key={p.PaymentID}>
        <td>#{p.BillingID}</td>
<td>
  {p.billing?.customer
    ? `${p.billing.customer.FirstName} ${p.billing.customer.LastName}`
    : "—"}
</td>
        <td>₱{Number(p.Amount).toFixed(2)}</td>
        <td>{p.PaymentMethod}</td>
        <td>{new Date(p.PaymentDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</td>
        <td><span className={statusClass(p.billing?.Status)}>{p.billing?.Status ?? "—"}</span></td>
      </tr>
    ))}
  </tbody>
</table>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialRecords;