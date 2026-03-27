import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css"; 
import { FaPen, FaTrash } from "react-icons/fa";

interface Customer {
  CustomerID: number;
  FirstName: string;
  LastName: string;
}

interface Vehicle {
  VehicleID: number;
  Manufacturer: string;
  Model: string;
  Year: number;
  CustomerID: number;
  customer?: Customer;
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchCustomerText, setSearchCustomerText] = useState(""); // 🔹 for searchable customer

  const [formData, setFormData] = useState({
    Manufacturer: "",
    Model: "",
    Year: "",
    CustomerID: "",
  });

  // Fetch vehicles
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/vehicles")
      .then(res => { setVehicles(res.data); setLoading(false); })
      .catch(err => { console.error(err); setError("Failed to fetch vehicles"); setLoading(false); });
    
    // Fetch customers
    axios.get("http://127.0.0.1:8000/api/customers")
      .then(res => setCustomers(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Update CustomerID based on search selection
  useEffect(() => {
    const matchedCustomer = customers.find(c => String(c.CustomerID) === searchCustomerText);
    if (matchedCustomer) {
      setFormData(prev => ({ ...prev, CustomerID: String(matchedCustomer.CustomerID) }));
    } else {
      setFormData(prev => ({ ...prev, CustomerID: "" }));
    }
  }, [searchCustomerText, customers]);

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      Manufacturer: vehicle.Manufacturer,
      Model: vehicle.Model,
      Year: vehicle.Year.toString(),
      CustomerID: vehicle.CustomerID.toString(),
    });
    setSearchCustomerText(vehicle.CustomerID.toString());
    setShowModal(true);
  };

  const handleDelete = (vehicleID: number) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      axios.delete(`http://127.0.0.1:8000/api/vehicles/${vehicleID}`)
        .then(() => setVehicles(prev => prev.filter(v => v.VehicleID !== vehicleID)))
        .catch(err => { console.error(err); alert("Failed to delete vehicle"); });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/api/vehicles", formData)
      .then(res => {
        setVehicles(prev => [...prev, res.data]);
        setShowModal(false);
        setFormData({ Manufacturer: "", Model: "", Year: "", CustomerID: "" });
        setSearchCustomerText("");
      })
      .catch(err => { console.error(err); alert("Failed to add vehicle"); });
  };

  // Filter customers dynamically by id or name
  const filteredCustomers = customers.filter(c => {
    const name = `${c.FirstName} ${c.LastName}`;
    return name.toLowerCase().includes(searchCustomerText.toLowerCase()) || 
           String(c.CustomerID).includes(searchCustomerText);
  });

  // Selected customer for display
  const selectedCustomer = customers.find(c => String(c.CustomerID) === formData.CustomerID);

  return (
    <div>
      {/* Header */}
      <div className="upper-customerinfo-container">
        <div className="customerinfo-left">
          <h1>Vehicles</h1>
          <p>Track and manage all vehicles in the system.</p>
        </div>
        <div className="customerinfo-right">
          <button className="add-customer-btn" onClick={() => setShowModal(true)}>
            + Add Vehicle
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Vehicle</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="Manufacturer">Manufacturer</label>
                <input
                  id="Manufacturer"
                  type="text"
                  name="Manufacturer"
                  value={formData.Manufacturer}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="Model">Model</label>
                <input
                  id="Model"
                  type="text"
                  name="Model"
                  value={formData.Model}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="Year">Year</label>
                <input
                  id="Year"
                  type="number"
                  name="Year"
                  value={formData.Year}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 🔹 Searchable Customer */}
              <div className="form-group">
                <label>Customer</label>
                <input
                  type="text"
                  placeholder="Type Customer ID or Name..."
                  value={searchCustomerText}
                  onChange={(e) => setSearchCustomerText(e.target.value)}
                  list="customer-options"
                  required
                />
                <datalist id="customer-options">
                  {filteredCustomers.map(c => (
                    <option key={c.CustomerID} value={c.CustomerID}>
                      {c.FirstName} {c.LastName} (ID: {c.CustomerID})
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Show selected customer name */}
              {selectedCustomer && (
                <div className="form-group">
                  <label>Selected Customer</label>
                  <input
                    type="text"
                    value={`${selectedCustomer.FirstName} ${selectedCustomer.LastName}`}
                    disabled
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Year</th>
                <th>Customer</th>
                <th className="action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.VehicleID}>
                  <td>{v.VehicleID}</td>
                  <td>{v.Manufacturer}</td>
                  <td>{v.Model}</td>
                  <td>{v.Year}</td>
                  <td>{v.customer ? `${v.customer.FirstName} ${v.customer.LastName}` : v.CustomerID}</td>
                  <td className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(v)} title="Edit Vehicle"><FaPen /></button>
                    <button className="delete-btn" onClick={() => handleDelete(v.VehicleID)} title="Delete Vehicle"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Vehicles;