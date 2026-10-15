
import { useEffect, useState } from "react";
import { getAttendance } from "../services/api";
import "./Attendance.css";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getAttendance();
        setAttendance(data);
      } catch (err) {
        setError("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="attendance-page">
        <h2>Loading attendance...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-page">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1>Attendance Management</h1>
        <p>View employee attendance records and daily status.</p>
      </div>

      <div className="attendance-count">
        Total Attendance Records: {attendance.length}
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((record, index) => {
              const status = (record.status || "").toLowerCase();

              return (
                <tr key={record.attendance_id ?? index}>
                  <td>EMP-{String(record.employee_id).padStart(3, "0")}</td>

                  <td>
                    {record.attendance_date
                      ? String(record.attendance_date).slice(0, 10)
                      : "-"}
                  </td>

                  <td>
                    <span className={`attendance-status status-${status}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;