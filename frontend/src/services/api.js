import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "https://hr-workforce-backend.onrender.com"}/api`,
});

export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await api.post("/employees", employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await api.put(`/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};


export const getAttendance = async () => {
  const response = await api.get("/attendance");
  return response.data;
};


export const getLeaveRequests = async () => {
  const response = await api.get("/leave-requests");
  return response.data;
};  

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const getPayroll = async () => {
  const response = await api.get("/payroll");
  return response.data;
};

export const getPerformanceReviews = async () => {
  const response = await api.get("/performance-reviews");
  return response.data;
};


export const getDepartmentSalaryAnalytics = async () => {
  const response = await api.get("/analytics/department-salaries");
  return response.data;
};

export default api;