"""
Project Name: HR Workforce Management & Analytics System
Module: Flask Backend API
Author: Ranjit Gawali
Description: This backend API handles database connections to TiDB Cloud (MySQL compatible),
             fetches employee records, calculates HR analytics KPIs (Headcount, Attrition, Salary),
             and supports CRUD operations for the React.js frontend.
"""

from multiprocessing import context

from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import os
from dotenv import load_dotenv
import ssl

# Load environment variables from the .env file (Database credentials)
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) to allow React frontend communication
CORS(app)

def get_db_connection():
    """
    Function to establish a secure connection with the TiDB Cloud MySQL database
    using credentials stored in environment variables.
    """
    ssl_context = ssl.create_default_context()
    connection = pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 4000)),
        cursorclass=pymysql.cursors.DictCursor,
        ssl=ssl_context
    )
    return connection

# ==========================================
# 1. HEALTH CHECK & HOME ROUTE
# ==========================================
@app.route("/", methods=["GET"])
def home():
    """Simple health check route to verify if the API server is running."""
    return jsonify({"message": "HR Workforce Analytics API is running successfully!"}), 200


# ==========================================
# 2. GET ALL EMPLOYEES (GET API)
# ==========================================
@app.route("/api/employees", methods=["GET"])
def get_employees():
    """
    Fetches all active and inactive employee records along with their department names
    using a SQL JOIN query, sorted by newest first.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL Query with JOIN to combine employees and departments tables
        query = """
            SELECT e.*, d.department_name 
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.department_id
            ORDER BY e.employee_id DESC;
        """
        cursor.execute(query)
        employees = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(employees), 200
        
    except Exception as e:
        print("🔴 ERROR OCCURRED:", str(e))
        return jsonify({"error": str(e)}), 500


# ==========================================
# 3. ADD NEW EMPLOYEE (POST API)
# ==========================================
@app.route("/api/employees", methods=["POST"])
def add_employee():
    """
    Receives JSON data from the React 'Add Employee' form and inserts a new 
    employee record into the TiDB Cloud database.
    """
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO employees (first_name, last_name, email, phone, department_id, job_role, salary, joining_date, employment_status, job_satisfaction_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get("first_name"),
            data.get("last_name"),
            data.get("email"),
            data.get("phone"),
            data.get("department_id"),
            data.get("job_role"),
            data.get("salary"),
            data.get("joining_date"),
            data.get("employment_status", "Active"),
            data.get("job_satisfaction_score", 3)
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        new_employee_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Employee added successfully!", "employee_id": new_employee_id}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# 4. HR ANALYTICS KPIS DASHBOARD API (GET)
# ==========================================
@app.route("/api/analytics/kpis", methods=["GET"])
def get_analytics_kpis():
    """
    Calculates core workforce analytics metrics for the dashboard:
    - Total Active Headcount
    - Overall Attrition Rate (%)
    - Average Monthly Salary of Active Employees
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Metric 1: Total Active Headcount
        cursor.execute("SELECT COUNT(*) AS total_employees FROM employees WHERE employment_status = 'Active';")
        total_headcount = cursor.fetchone()["total_employees"]
        
        # Metric 2: Attrition Rate Calculation (%)
        cursor.execute("SELECT COUNT(*) AS total_inactive FROM employees WHERE employment_status = 'Inactive';")
        inactive_count = cursor.fetchone()["total_inactive"]
        
        cursor.execute("SELECT COUNT(*) AS total_ever FROM employees;")
        total_ever = cursor.fetchone()["total_ever"]
        
        attrition_rate = (inactive_count / total_ever * 100) if total_ever > 0 else 0.0
        
        # Metric 3: Average Salary
        cursor.execute("SELECT AVG(salary) AS avg_salary FROM employees WHERE employment_status = 'Active';")
        avg_salary = cursor.fetchone()["avg_salary"] or 0.0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "total_headcount": total_headcount,
            "attrition_rate": round(attrition_rate, 2),
            "average_salary": round(float(avg_salary), 2)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# RUN FLASK APPLICATION
# ==========================================
if __name__ == "__main__":
    app.run(debug=True, port=5000)