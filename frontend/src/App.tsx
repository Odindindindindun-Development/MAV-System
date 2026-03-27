import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CustomerInfo from "./pages/CustomerInfo";
import JobOrder from "./pages/JobOrder";
import Inventory from "./pages/Inventory";
import Billings from "./pages/Billings";
import FinancialRecords from "./pages/FinancialRecords";
import Vehicles from './pages/Vehicles';

import "./style/dashboard.css"

function App() {
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return (
    <Router>
      <div className="dashboard">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/customers" element={<CustomerInfo />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/job-order" element={<JobOrder />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/billings" element={<Billings />} />
            <Route path="/financial-records" element={<FinancialRecords />} />
            <Route path="*" element={<CustomerInfo />} /> {/* default */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
