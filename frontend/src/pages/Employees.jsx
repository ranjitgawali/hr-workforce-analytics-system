import * as XLSX from 'xlsx';
import { useEffect, useState } from "react";
import {
  getEmployees,
  getDepartments,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/api";
import "./Employees.css";
import { Search, Plus, X, Trash2, Edit, Users, UserCheck, DollarSign, CreditCard, Filter } from "lucide-react";

function Employees() {
  // State variables for managing employee data, departments, loading, and error states
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State variables for search query, department filtering, and modal form visibility
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Track which employee ID is currently being edited
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Form data state for adding a new employee or updating an existing one
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    designation: "",
    department_id: "",
    joining_date: "",
    salary: "",
    employment_status: "Active",
  });

  // Fetch employees and departments data from the backend API on component mount
  const fetchData = async () => {
    try {
      const [employeeData, departmentData] = await Promise.all([
        getEmployees(),
        getDepartments(),
      ]);

      setEmployees(employeeData);
      setDepartments(departmentData);
      setError("");
    } catch (err) {
      console.error("Failed to load employee data:", err);
      setError("Failed to load employees or departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle text input changes in the employee form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Populate form fields with selected employee data when clicking the edit button
  const handleEditClick = (employee) => {
    setEditingEmployeeId(employee.employee_id);
    
    const formatDate = (dateString) => {
      if (!dateString) return "";
      return dateString.split("T")[0];
    };

    setFormData({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      gender: employee.gender || "",
      date_of_birth: formatDate(employee.date_of_birth),
      designation: employee.designation || "",
      department_id: employee.department_id || "",
      joining_date: formatDate(employee.joining_date),
      salary: employee.salary || "",
      employment_status: employee.employment_status || "Active",
    });

    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  // Handle form submission to create a new employee record or update an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const employeeData = {
        ...formData,
        department_id: Number(formData.department_id),
        salary: Number(formData.salary),
        phone: formData.phone || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
      };

      if (editingEmployeeId) {
        await updateEmployee(editingEmployeeId, employeeData);
        setSuccessMessage("Employee updated successfully!");
      } else {
        await createEmployee(employeeData);
        setSuccessMessage("Employee added successfully!");
      }

      await fetchData();

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "",
        date_of_birth: "",
        designation: "",
        department_id: "",
        joining_date: "",
        salary: "",
        employment_status: "Active",
      });
      setEditingEmployeeId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save employee:", err);
      setFormError(
        err.response?.data?.error || "Failed to save employee. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle employee record deletion with a browser confirmation prompt
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee: ${name}?`)) {
      return;
    }

    try {
      await deleteEmployee(id);
      setEmployees(employees.filter((emp) => emp.employee_id !== id));
      setSuccessMessage("Employee deleted successfully!");
    } catch (err) {
      console.error("Failed to delete employee:", err);
      setError("Failed to delete employee. Please try again.");
    }
  };

  // Filter employees based on search query input and selected department dropdown filter
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase().trim();
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      (employee.email || "").toLowerCase().includes(search) ||
      (employee.designation || "").toLowerCase().includes(search) ||
      (employee.department_name || "").toLowerCase().includes(search);

    const matchesDepartment =
      selectedDepartment === "" || String(employee.department_id) === String(selectedDepartment);

    return matchesSearch && matchesDepartment;
  });

  // Export the current filtered employee list into an Excel (.xlsx) file with formatted columns
  const handleExportExcel = () => {
    if (filteredEmployees.length === 0) {
      alert("No employee data available to export!");
      return;
    }

    const formattedData = filteredEmployees.map((emp) => ({
      "Employee ID": emp.employee_id,
      "Full Name": `${emp.first_name} ${emp.last_name}`.trim(),
      "Email": emp.email,
      "Phone": emp.phone || "N/A",
      "Gender": emp.gender || "N/A",
      "Designation": emp.designation,
      "Department": emp.department_name,
      "Joining Date": emp.joining_date ? emp.joining_date.split("T")[0] : "N/A",
      "Salary (₹)": emp.salary,
      "Employment Status": emp.employment_status
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "Employee_Analytics_Report.xlsx");
  };

  // Dynamic KPI Analytics Calculations based on current filtered employees data
  const totalEmployeesCount = filteredEmployees.length;
  const activeEmployeesCount = filteredEmployees.filter(emp => emp.employment_status === 'Active').length;
  const totalPayrollSum = filteredEmployees.reduce((acc, emp) => acc + (Number(emp.salary) || 0), 0);
  const averageSalaryValue = totalEmployeesCount > 0 ? totalPayrollSum / totalEmployeesCount : 0;

  // Render loading state view
  if (loading) {
    return (
      <div className="employees-page">
        <h2>Loading employees...</h2>
      </div>
    );
  }

  // Render error state view with a retry action button
  if (error) {
    return (
      <div className="employees-page">
        <h2>{error}</h2>
        <button className="add-employee-btn" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employees-page">
      {/* Header Section: Title, Add Employee button, and Excel Export button */}
      <div className="employees-header">
        <div>
          <h1>Employees</h1>
          <p>Manage and view your workforce information.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="add-employee-btn"
            onClick={() => {
              setEditingEmployeeId(null);
              setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                gender: "",
                date_of_birth: "",
                designation: "",
                department_id: "",
                joining_date: "",
                salary: "",
                employment_status: "Active",
              });
              setFormError("");
              setSuccessMessage("");
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            Add Employee
          </button>

          <button
            onClick={handleExportExcel}
            className="add-employee-btn"
            style={{ backgroundColor: "#107c41" }}
            title="Export data to Excel"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Top Dynamic KPI Metrics Cards Section */}
      <div className="kpi-metrics-grid">
        {/* Card 1: Total Headcount */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper blue">
            <Users size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Headcount (Filtered)</span>
            <h3 className="kpi-value">{totalEmployeesCount}</h3>
          </div>
        </div>

        {/* Card 2: Active Employees Count */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper green">
            <UserCheck size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Active Employees</span>
            <h3 className="kpi-value">{activeEmployeesCount}</h3>
          </div>
        </div>

        {/* Card 3: Average Salary Calculation */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper purple">
            <DollarSign size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Average Salary</span>
            <h3 className="kpi-value">₹{Math.round(averageSalaryValue).toLocaleString("en-IN")}</h3>
          </div>
        </div>

        {/* Card 4: Total Monthly Payroll Expenses */}
        <div className="kpi-card">
          <div className="kpi-icon-wrapper orange">
            <CreditCard size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Total Monthly Payroll</span>
            <h3 className="kpi-value">₹{totalPayrollSum.toLocaleString("en-IN")}</h3>
          </div>
        </div>
      </div>

      {/* Success notification banner message */}
      {successMessage && (
        <div className="employee-success">{successMessage}</div>
      )}

      {/* Search Input Bar and Department Filter Dropdown Section */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div className="employees-search" style={{ flex: 1, marginBottom: 0 }}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, designation, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="employees-search" style={{ width: "240px", marginBottom: 0 }}>
          <Filter size={18} style={{ color: "#64748b" }} />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", background: "transparent", fontSize: "14px", color: "#1e293b", cursor: "pointer" }}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal Form Overlay for Add / Edit Employee */}
      {showForm && (
        <div className="employee-form-overlay">
          <div className="employee-form-card">
            <div className="employee-form-heading">
              <div>
                <h2>{editingEmployeeId ? "Edit Employee" : "Add New Employee"}</h2>
                <p>Enter the employee details below.</p>
              </div>

              <button
                type="button"
                className="close-form-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingEmployeeId(null);
                }}
                aria-label="Close form"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employee-form-grid">
                <label>
                  First Name *
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Last Name *
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Email *
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Gender
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Date of Birth
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Designation *
                  <input
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Department *
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option
                        key={department.department_id}
                        value={department.department_id}
                      >
                        {department.department_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Joining Date *
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Salary (₹) *
                  <input
                    type="number"
                    name="salary"
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Employment Status *
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </label>
              </div>

              {formError && (
                <div className="employee-form-error">{formError}</div>
              )}

              <div className="employee-form-actions">
                <button
                  type="button"
                  className="cancel-employee-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployeeId(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-employee-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEmployeeId
                    ? "Update Employee"
                    : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees Data Table Container Section */}
      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="6" className="no-employees">
                  No employees found.
                </td>
              </tr>
            )}

            {filteredEmployees.map((employee) => (
              <tr key={employee.employee_id}>
                <td>
                  <div className="employee-name">
                    {employee.first_name} {employee.last_name}
                  </div>
                  <span className="employee-id">
                    ID: {employee.employee_id}
                  </span>
                </td>

                <td>{employee.email}</td>
                <td>{employee.designation}</td>
                <td>
                  <span className="department-badge">
                    {employee.department_name}
                  </span>
                </td>
                <td className="employee-salary">
                  ₹{Number(employee.salary).toLocaleString("en-IN")}
                </td>
                <td>
                  {/* Row Action Buttons: Edit and Delete */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="edit-employee-btn"
                      onClick={() => handleEditClick(employee)}
                      title="Edit Employee"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="delete-employee-btn"
                      onClick={() =>
                        handleDelete(
                          employee.employee_id,
                          `${employee.first_name} ${employee.last_name}`
                        )
                      }
                      title="Delete Employee"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;