
import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Building2,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getDashboardSummary,
  getDepartments,
  getDepartmentSalaryAnalytics,
} from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [salaryAnalytics, setSalaryAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          summaryData,
          departmentsData,
          salaryData,
        ] = await Promise.all([
          getDashboardSummary(),
          getDepartments(),
          getDepartmentSalaryAnalytics(),
        ]);

        setSummary(summaryData);
        setDepartments(departmentsData);
        setSalaryAnalytics(salaryData);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">HR Workforce Dashboard</h1>

      <p className="dashboard-subtitle">
        Welcome to HR Workforce Management System
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon employees-icon">
            <Users size={24} />
          </div>
          <h2>Total Employees</h2>
          <h3>{summary.total_employees}</h3>
        </div>

        <div className="dashboard-card">
          <div className="card-icon active-icon">
            <UserCheck size={24} />
          </div>
          <h2>Active Employees</h2>
          <h3>{summary.active_employees}</h3>
        </div>

        <div className="dashboard-card">
          <div className="card-icon departments-icon">
            <Building2 size={24} />
          </div>
          <h2>Total Departments</h2>
          <h3>{summary.total_departments}</h3>
        </div>

        <div className="dashboard-card">
          <div className="card-icon salary-icon">
            <Wallet size={24} />
          </div>
          <h2>Average Salary</h2>
          <h3>₹{summary.average_salary}</h3>
        </div>

        <div className="dashboard-card">
          <div className="card-icon performance-icon">
            <span style={{ fontSize: "24px" }}>★</span>
          </div>
          <h2>Average Performance</h2>
          <h3>
            {Number(summary.average_performance_rating).toFixed(2)} / 5
          </h3>
        </div>
      </div>

      <section className="analytics-section">
        <h2>Department-wise Employee Analytics</h2>
        <p>Employee distribution across all departments</p>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={departments}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="department_name"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={65}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="employee_count"
                name="Employees"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="analytics-section">
        <h2>Department-wise Average Salary</h2>
        <p>Compare average employee salary across departments</p>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={salaryAnalytics}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="department_name"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={65}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  "Average Salary",
                ]}
              />
              <Bar
                dataKey="average_salary"
                name="Average Salary"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;