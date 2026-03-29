import React from "react";
import { NavLink } from "react-router-dom";
import "../style/dashboard.css"
import logo from '../assets/logo.png';


const Sidebar = () => {
  const menuItems = [
    { name: "Customer Info", path: "/customers" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Inventory", path: "/inventory" },
    { name: "Job Order", path: "/job-order" },
    { name: "Billings", path: "/billings" },
    { name: "Financial Records", path: "/financial-records" },
  ];

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
    </aside>
  );
};

export default Sidebar;