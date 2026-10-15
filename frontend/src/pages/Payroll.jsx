
import { useEffect, useState } from "react";
import { getPayroll } from "../services/api";
import "./Payroll.css";

function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const data = await getPayroll();
        setPayroll(data);
      } catch (err) {
        setError("Failed to load payroll data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  if (loading) {
    return <div className="payroll-page"><h2>Loading payroll...</h2></div>;
  }

  if (error) {
    return <div className="payroll-page"><h2>{error}</h2></div>;
  }

  return (
    <div className="payroll-page">
      <div className="payroll-header">
        <h1>Payroll Management</h1>
        <p>View employee salary details and payment status.</p>
      </div>

      <div className="payroll-count">
        Total Payroll Records: {payroll.length}
      </div>

      <div className="payroll-table-container">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Payment Status</th>
            </tr>
          </thead>

          <tbody>
            {payroll.map((record) => (
              <tr key={record.payroll_id}>
                <td>
                  <div className="payroll-employee-name">
                    {record.employee_name}
                  </div>
                  <span className="payroll-employee-id">
                    ID: {record.employee_id}
                  </span>
                </td>

                <td>{record.department_name}</td>
                <td>₹{Number(record.basic_salary).toLocaleString("en-IN")}</td>
                <td>₹{Number(record.allowances).toLocaleString("en-IN")}</td>
                <td>₹{Number(record.deductions).toLocaleString("en-IN")}</td>

                <td className="payroll-net-salary">
                  ₹{Number(record.net_salary).toLocaleString("en-IN")}
                </td>

                <td>
                  <span
                    className={`payroll-status payroll-status-${(record.payment_status || "").toLowerCase()}`}
                  >
                    {record.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payroll;