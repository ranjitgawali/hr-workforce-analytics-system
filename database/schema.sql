-- 1. Create Database
CREATE DATABASE IF NOT EXISTS hr_analytics_db;
USE hr_analytics_db;

-- Set Global Auto Increment Offset and Increment to 1 (Prevents ID Jumps like 3000, 6000)
SET @@auto_increment_increment = 1;
SET @@auto_increment_offset = 1;

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) DEFAULT 'Pune'
) AUTO_INCREMENT = 1;

-- 3. Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department_id INT UNSIGNED,
    job_role VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    joining_date DATE NOT NULL,
    employment_status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    job_satisfaction_score INT CHECK (job_satisfaction_score BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
) AUTO_INCREMENT = 1;

-- 4. Create Attrition Analytics Table
CREATE TABLE IF NOT EXISTS attrition_records (
    attrition_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED,
    exit_date DATE NOT NULL,
    reason_for_exit VARCHAR(255),
    tenure_years DECIMAL(4, 2),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) AUTO_INCREMENT = 1;