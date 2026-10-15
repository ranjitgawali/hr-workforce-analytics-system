
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end className="navbar-brand">
        HR Workforce
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/employees">Employees</NavLink>
        <NavLink to="/departments">Departments</NavLink>
        <NavLink to="/attendance">Attendance</NavLink>
        <NavLink to="/leave-requests">Leave Requests</NavLink>
        <NavLink to="/payroll">Payroll</NavLink>
        <NavLink to="/performance-reviews">Performance Reviews</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;