
import { useEffect, useState } from "react";
import { getDepartments } from "../services/api";
import "./Departments.css";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        setError("Failed to load departments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return <div className="departments-page"><h2>Loading departments...</h2></div>;
  }

  if (error) {
    return <div className="departments-page"><h2>{error}</h2></div>;
  }

  return (
    <div className="departments-page">
      <div className="departments-header">
        <h1>Departments</h1>
        <p>View departments and employee distribution across the organization.</p>
      </div>

      <div className="departments-grid">
        {departments.map((department) => (
          <div className="department-card" key={department.department_id}>
            <h3>{department.department_name}</h3>

            <p className="department-description">
              {department.description}
            </p>

            <span className="department-employee-count">
              Employees: {department.employee_count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Departments;