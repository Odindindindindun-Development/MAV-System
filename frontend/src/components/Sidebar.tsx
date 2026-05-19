import React from "react";
import { NavLink } from "react-router-dom";
import "../style/dashboard.css"
import logo from '../assets/logo.png';
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";


const Sidebar = () => {
  const menuItems = [
    { name: "Customer Info", path: "/customers" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Inventory", path: "/inventory" },
    { name: "Job Order", path: "/job-order" },
    { name: "Billings", path: "/billings" },
    { name: "Financial Records", path: "/financial-records" },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="logo-container">
        <img src={logo} alt="logo" className="logo" />
        <p> Davao MAV Auto Corporation</p>
      </div>

      <div className="separator"></div>

      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;