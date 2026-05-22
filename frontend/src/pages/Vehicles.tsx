import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/customerinfo.css";
import { FaPen, FaTrash, FaRecycle } from "react-icons/fa";

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
  IsArchived: number;
  customer?: Customer;
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVehicleID, setCurrentVehicleID] = useState<number | null>(null);

  const [searchCustomerText, setSearchCustomerText] = useState("");

  const [formData, setFormData] = useState({
    Manufacturer: "",
    Model: "",
    Year: "",
    CustomerID: "",
  });

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // FETCH
  useEffect(() => {
    setLoading(true);

    const endpoint =
      activeTab === "active"
        ? "http://127.0.0.1:8000/api/vehicles"
        : "http://127.0.0.1:8000/api/vehicles-archived";

    axios.get(endpoint)
      .then(res => {
        setVehicles(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    axios.get("http://127.0.0.1:8000/api/customers")
      .then(res => setCustomers(res.data));
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSearch = (value: string) => {
    setSearchCustomerText(value);

    const matched = customers.find(c => {
      const fullName = `${c.FirstName} ${c.LastName}`.toLowerCase();
      return (
        String(c.CustomerID) === value ||
        fullName === value.toLowerCase()
      );
    });

    if (matched) {
      setFormData(prev => ({
        ...prev,
        CustomerID: String(matched.CustomerID)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        CustomerID: ""
      }));
    }
  };

  const handleEdit = (v: Vehicle) => {
    setFormData({
      Manufacturer: v.Manufacturer,
      Model: v.Model,
      Year: v.Year.toString(),
      CustomerID: v.CustomerID.toString(),
    });

    setSearchCustomerText(
      v.customer
        ? `${v.customer.FirstName} ${v.customer.LastName}`
        : v.CustomerID.toString()
    );

    setCurrentVehicleID(v.VehicleID);
    setIsEditing(true);
    setShowModal(true);
  };

 const handleArchive = (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to archive this vehicle?");
    if (!confirmDelete) return;

    axios.delete(`http://127.0.0.1:8000/api/vehicles/${id}`)
        .then(() => {
            setVehicles(prev => prev.filter(v => v.VehicleID !== id));
            alert("Vehicle archived successfully.");
        })
        .catch(err => {
            const message = err.response?.data?.message || "Failed to archive vehicle.";
            alert(message);
        });
};

const handleRestore = (id: number) => {
    const confirmRestore = window.confirm("Do you want to restore this vehicle?");

    if (!confirmRestore) return;

    axios.patch(`http://127.0.0.1:8000/api/vehicles/${id}/restore`)
        .then(() => {
            setVehicles(prev => prev.filter(v => v.VehicleID !== id));
            alert("Vehicle restored successfully.");
        })
        .catch(() => {
            alert("Failed to restore vehicle.");
        });
};

  const resetForm = () => {
    setFormData({
      Manufacturer: "",
      Model: "",
      Year: "",
      CustomerID: "",
    });
    setSearchCustomerText("");
    setIsEditing(false);
    setCurrentVehicleID(null);
  };

  // =========================
  // SUBMIT (WITH YEAR VALIDATION)
  // =========================
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!formData.CustomerID) {
      alert("Please select a valid customer");
      return;
    }

    const duplicateVehicle = vehicles.some(v =>
      v.VehicleID !== currentVehicleID &&
      v.Manufacturer.toLowerCase().trim() === formData.Manufacturer.toLowerCase().trim() &&
      v.Model.toLowerCase().trim() === formData.Model.toLowerCase().trim() &&
      String(v.Year) === String(formData.Year) &&
      String(v.CustomerID) === String(formData.CustomerID)
    );

    if (duplicateVehicle) {
      alert("Already have an existing record.");
      return;
    }

    // 🔥 YEAR VALIDATION
    const year = Number(formData.Year);
    const currentYear = new Date().getFullYear();

    if (!year || isNaN(year)) {
      alert("Please enter a valid year.");
      return;
    }

    if (year < 1900) {
      alert("Year is not valid. Please enter a realistic vehicle year (1900 and above).");
      return;
    }

    if (year > currentYear) {
      alert(`Year cannot be greater than ${currentYear}.`);
      return;
    }

    if (isEditing && currentVehicleID) {
      axios.put(`http://127.0.0.1:8000/api/vehicles/${currentVehicleID}`, formData)
        .then(res => {
          setVehicles(prev =>
            prev.map(v =>
              v.VehicleID === currentVehicleID ? res.data : v
            )
          );
          setShowModal(false);
          resetForm();
        });
    } else {
      axios.post("http://127.0.0.1:8000/api/vehicles", formData)
        .then(res => {
          setVehicles(prev => [...prev, res.data]);
          setShowModal(false);
          resetForm();
        });
    }
  };

  const filteredCustomers = customers.filter(c => {
    const name = `${c.FirstName} ${c.LastName}`;
    return (
      name.toLowerCase().includes(searchCustomerText.toLowerCase()) ||
      String(c.CustomerID).includes(searchCustomerText)
    );
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(vehicles.length / rowsPerPage);

  return (
    <div>

      {/* HEADER */}
      <div className="upper-customerinfo-container">
        <div className="customerinfo-left">
          <h1>Vehicles</h1>
          <p>Manage vehicles</p>
        </div>

        <div className="tabs-container">
          <button
            className={activeTab === "active" ? "tab active" : "tab"}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>

          <button
            className={activeTab === "archived" ? "tab active" : "tab"}
            onClick={() => setActiveTab("archived")}
          >
            Archived
          </button>

          <button
            className="add-customer-btn"
            disabled={activeTab === "archived"}
            onClick={() => {
              setShowModal(true);
              setIsEditing(false);
               resetForm();
            }}
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? "Edit Vehicle" : "Add Vehicle"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Manufacturer</label>
                <input name="Manufacturer" value={formData.Manufacturer} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Model</label>
                <input name="Model" value={formData.Model} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input type="number" name="Year" value={formData.Year} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Customer</label>
                <input
                  value={searchCustomerText}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  list="customers"
                  required
                />

                <datalist id="customers">
                  {filteredCustomers.map(c => (
                    <option
                      key={c.CustomerID}
                      value={`${c.FirstName} ${c.LastName}`}
                    />
                  ))}
                </datalist>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  {isEditing ? "Update" : "Submit"}
                </button>

                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Year</th>
                <th>Customer</th>
                <th>Status</th>
                <th className="action">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentVehicles.map(v => (
                <tr key={v.VehicleID}>
                  <td>{v.VehicleID}</td>
                  <td>{v.Manufacturer}</td>
                  <td>{v.Model}</td>
                  <td>{v.Year}</td>
                  <td>
                    {v.customer
                      ? `${v.customer.FirstName} ${v.customer.LastName}`
                      : v.CustomerID}
                  </td>
                  <td>
                    <span className={v.IsArchived ? "status archived" : "status active"}>
                      {v.IsArchived ? "Archived" : "Active"}
                    </span>
                  </td>

                  <td className="action-buttons">
                    {activeTab === "active" ? (
                      <>
                        <button className="edit-btn" onClick={() => handleEdit(v)}>
                          <FaPen />
                        </button>

                        <button className="delete-btn" onClick={() => handleArchive(v.VehicleID)}>
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <button className="restore-btn" onClick={() => handleRestore(v.VehicleID)}>
                        <FaRecycle />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active-page" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
              Next
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Vehicles;