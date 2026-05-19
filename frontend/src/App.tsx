import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import CustomerInfo from "./pages/CustomerInfo";
import JobOrder from "./pages/JobOrder";
import Inventory from "./pages/Inventory";
import Billings from "./pages/Billings";
import FinancialRecords from "./pages/FinancialRecords";
import Vehicles from "./pages/Vehicles";
import JobOrderDetails from "./pages/JobOrderDetail";
import BillingDetail from "./pages/BillingDetail";
import "./style/dashboard.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — all routes share the Sidebar layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="dashboard">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/customers" element={<CustomerInfo />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/joborder/:id" element={<JobOrderDetails />} />
                    <Route path="/job-order" element={<JobOrder />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/billings/:id" element={<BillingDetail />} />
                    <Route path="/billings" element={<Billings />} />
                    <Route path="/financial-records" element={<FinancialRecords />} />
                    <Route path="*" element={<Navigate to="/customers" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;