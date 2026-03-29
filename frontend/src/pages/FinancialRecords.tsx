import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/FinancialRecords.css";

const FinancialRecords: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get("http://localhost:8000/api/financial-records")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p>Loading financial data...</p>;

  return (
    <div className="financial-container">
      <h1>Financial Records</h1>

      <div className="financial-grid">

        <div className="card">
          <h3>Total Revenue</h3>
          <p>₱{Number(data.totalPayments).toFixed(2)}</p>
        </div>

        <div className="card">
          <h3>Total Expenses</h3>
          <p>₱{Number(data.totalExpenses).toFixed(2)}</p>
        </div>

        <div className="card">
          <h3>Outstanding Balance</h3>
          <p>₱{Number(data.totalBalance).toFixed(2)}</p>
        </div>

        <div className="card">
          <h3>Net Profit</h3>
          <p>₱{Number(data.netProfit).toFixed(2)}</p>
        </div>

      </div>
    </div>
  );
};

export default FinancialRecords;