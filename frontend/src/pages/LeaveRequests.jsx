
import { useEffect, useState } from "react";
import { getLeaveRequests } from "../services/api";
import "./LeaveRequests.css";

function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const data = await getLeaveRequests();
        setLeaveRequests(data);
      } catch (err) {
        setError("Failed to load leave requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  if (loading) {
    return <div className="leave-page"><h2>Loading leave requests...</h2></div>;
  }

  if (error) {
    return <div className="leave-page"><h2>{error}</h2></div>;
  }

  return (
    <div className="leave-page">
      <div className="leave-header">
        <h1>Leave Management</h1>
        <p>View and track employee leave requests and approval status.</p>
      </div>

      <div className="leave-count">
        Total Leave Requests: {leaveRequests.length}
      </div>

      <div className="leave-table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave.leave_id}>
                <td>
                  <div className="leave-employee-name">
                    {leave.employee_name}
                  </div>
                  <span className="leave-employee-id">
                    ID: {leave.employee_id}
                  </span>
                </td>

                <td>{leave.department_name}</td>
                <td>{leave.leave_type}</td>
                <td>{leave.start_date}</td>
                <td>{leave.end_date}</td>

                <td>
                  <span
                    className={`leave-status status-${(leave.status || "").toLowerCase()}`}
                  >
                    {leave.status}
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

export default LeaveRequests;