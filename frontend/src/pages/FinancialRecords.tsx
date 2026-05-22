import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
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

interface ChartPoint {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

type DateRange = "7d" | "30d" | "365d" | "all";

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Past 7 Days" },
  { value: "30d", label: "Past 30 Days" },
  { value: "365d", label: "This Year" },
  { value: "all", label: "All Time" },
];

// Format X-axis tick labels nicely
const formatPeriod = (period: string, range: DateRange) => {
  if (range === "365d" || range === "all") {
    // "2024-03" → "Mar 2024"
    const [year, month] = period.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-PH", {
      month: "short", year: "numeric",
    });
  }
  // "2024-03-15" → "Mar 15"
  return new Date(period).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
};

const formatPeso = (value: number) => `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const FinancialRecords: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "history">("overview");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    Category: "", Amount: "", ExpenseDate: "", Description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAll = (range: DateRange = dateRange) => {
    const q = range !== "all" ? `?range=${range}` : "";

    axios.get(`https://mav-backend-system.onrender.com/api/financial-records${q}`)
      .then(res => setData(res.data)).catch(console.error);

    axios.get(`https://mav-backend-system.onrender.com/api/payments${q}`)
      .then(res => setPayments(res.data)).catch(console.error);

    axios.get(`https://mav-backend-system.onrender.com/api/expenses${q}`)
      .then(res => setExpenses(res.data)).catch(console.error);

    // Always pass range for chart (default to 30d)
    axios.get(`https://mav-backend-system.onrender.com/api/financial-records/chart?range=${range === "all" ? "all" : range}`)
      .then(res => setChartData(res.data)).catch(console.error);
  };

  useEffect(() => { fetchAll(dateRange); }, [dateRange]);

  const FilterBar = () => (
    <div className="filter-bar">
      {RANGE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`filter-btn ${dateRange === opt.value ? "active" : ""}`}
          onClick={() => setDateRange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const handleExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setExpenseForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const today = new Date();
    const selectedDate = new Date(expenseForm.ExpenseDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    const minDate = new Date("2000-01-01");

    if (!expenseForm.Description?.trim()) {
      alert("Description cannot be empty."); setSubmitting(false); return;
    }
    if (!expenseForm.Amount || Number(expenseForm.Amount) <= 0) {
      alert("Amount must be greater than 0."); setSubmitting(false); return;
    }
    if (selectedDate > today) {
      alert("Expense date cannot be in the future."); setSubmitting(false); return;
    }
    if (selectedDate < minDate) {
      alert("Expense date is too old."); setSubmitting(false); return;
    }

    try {
      await axios.post("https://mav-backend-system.onrender.com/api/expenses", expenseForm);
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
      await axios.delete(`https://mav-backend-system.onrender.com/api/expenses/${id}`);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const statusClass = (status?: string) => {
    if (status === "Paid") return "badge badge-success";
    if (status === "Partial") return "badge badge-warning";
    return "badge badge-pending";
  };

  if (!data) return <p>Loading financial data...</p>;

  const selectedLabel = RANGE_OPTIONS.find(o => o.value === dateRange)?.label ?? "";

  return (
    <div className="financial-container">
      <h1>Financial Records</h1>

      <FilterBar />

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

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <>
          <div className="financial-grid">
            <div className="card"><h3>Total Revenue</h3><p>₱{Number(data.totalPayments).toFixed(2)}</p></div>
            <div className="card"><h3>Total Expenses</h3><p>₱{Number(data.totalExpenses).toFixed(2)}</p></div>
            <div className="card"><h3>Outstanding Balance</h3><p>₱{Number(data.totalBalance).toFixed(2)}</p></div>
            <div className="card net-profit"><h3>Net Profit</h3><p>₱{Number(data.netProfit).toFixed(2)}</p></div>
          </div>

          {/* Line chart */}
          <div className="chart-card">
            <h2>Trends <span className="range-label">— {selectedLabel}</span></h2>
            {chartData.length === 0 ? (
              <p className="no-data">No data available for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="period"
                    tickFormatter={p => formatPeriod(p, dateRange)}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatPeso(Number(value)),
                      name === "netProfit" ? "Net Profit" : String(name).charAt(0).toUpperCase() + String(name).slice(1),
                    ]}
                    labelFormatter={p => formatPeriod(p, dateRange)}
                    contentStyle={{ borderRadius: "8px", fontSize: "0.85rem" }}
                  />
                  <Legend
                    formatter={name =>
                      name === "netProfit" ? "Net Profit"
                        : name.charAt(0).toUpperCase() + name.slice(1)
                    }
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="netProfit" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 5 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {/* ── Expenses ── */}
      {activeTab === "expenses" && (
        <>
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
                  <input type="number" name="Amount" min="0.01" step="0.01" placeholder="0.00"
                    value={expenseForm.Amount} onChange={handleExpenseChange} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="ExpenseDate" value={expenseForm.ExpenseDate}
                    onChange={handleExpenseChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="Description" rows={3} placeholder="Brief description…"
                  value={expenseForm.Description} onChange={handleExpenseChange} />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save Expense"}
              </button>
            </form>
          </div>

          <div className="table-card" style={{ marginTop: "1.5rem" }}>
            <h2>Expense Records <span className="range-label">— {selectedLabel}</span></h2>
            {expenses.length === 0 ? (
              <p>No expenses found for this period.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.ExpenseID}>
                      <td>#{exp.ExpenseID}</td>
                      <td>{new Date(exp.ExpenseDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</td>
                      <td><span className="badge badge-pending">{exp.Category}</span></td>
                      <td>{exp.Description || "—"}</td>
                      <td>₱{Number(exp.Amount).toFixed(2)}</td>
                      <td><button className="btn-delete" onClick={() => handleDeleteExpense(exp.ExpenseID)}>Delete</button></td>
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

      {/* ── Payment History ── */}
      {activeTab === "history" && (
        <div className="table-card">
          <h2>Payment History <span className="range-label">— {selectedLabel}</span></h2>
          {payments.length === 0 ? (
            <p>No payments found for this period.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Billing ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.PaymentID}>
                    <td>#{p.BillingID}</td>
                    <td>{p.billing?.customer ? `${p.billing.customer.FirstName} ${p.billing.customer.LastName}` : "—"}</td>
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