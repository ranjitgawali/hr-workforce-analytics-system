USE hr_analytics_db;

-- 1. Insert Departments
INSERT INTO departments (department_name, location) VALUES 
('HR Operations', 'Pune'),
('Data Analytics', 'Pune'),
('Software Engineering', 'Pune'),
('Finance', 'Pune');

-- 2. Insert Sample Employees (Sequentially from ID 1)
INSERT INTO employees (first_name, last_name, email, phone, department_id, job_role, salary, joining_date, employment_status, job_satisfaction_score) VALUES 
('Ranjit', 'Gawali', 'ranjit.gawali@company.com', '9823790677', 2, 'Data Analyst Specialist', 85000.00, '2022-04-01', 'Active', 5),
('Amit', 'Sharma', 'amit.sharma@company.com', '9876543210', 3, 'React Developer', 75000.00, '2021-06-15', 'Active', 4),
('Priya', 'Patil', 'priya.patil@company.com', '9876543211', 1, 'HR Operations Associate', 55000.00, '2020-03-10', 'Active', 3),
('Sneha', 'Kulkarni', 'sneha.k@company.com', '9876543212', 4, 'Financial Analyst', 68000.00, '2022-01-20', 'Active', 4),
('Rahul', 'Deshmukh', 'rahul.d@company.com', '9876543213', 3, 'Backend Developer', 80000.00, '2021-11-01', 'Inactive', 2),
('Neha', 'Verma', 'neha.v@company.com', '9876543214', 1, 'HR Recruiter', 50000.00, '2023-02-15', 'Active', 4),
('Vikas', 'Jadhav', 'vikas.j@company.com', '9876543215', 2, 'Data Engineer', 90000.00, '2021-08-10', 'Active', 5),
('Pooja', 'Pawar', 'pooja.p@company.com', '9876543216', 3, 'QA Engineer', 62000.00, '2022-09-01', 'Inactive', 1);

-- 3. Insert Attrition Records for Inactive Employees
INSERT INTO attrition_records (employee_id, exit_date, reason_for_exit, tenure_years) VALUES 
(5, '2024-01-15', 'Better Career Opportunity', 2.20),
(8, '2023-11-30', 'Work Satisfaction Issues', 1.25);