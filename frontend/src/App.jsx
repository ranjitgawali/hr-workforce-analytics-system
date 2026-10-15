import { BrowserRouter, Routes, Route } from "react-router-dom";
import Employees from "./pages/Employees";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import LeaveRequests from "./pages/LeaveRequests";
import Payroll from "./pages/Payroll";
import PerformanceReviews from "./pages/PerformanceReviews";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Navbar />
      </nav>

      <Routes>  
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave-requests" element={<LeaveRequests />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/performance-reviews" element={<PerformanceReviews />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;