"""
Project Name: HR Workforce Management & Analytics System
Module: Flask Backend API (Exact React Frontend Key Matching Fix)
Author: Ranjit Gawali
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
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

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "HR Workforce Analytics API is running successfully!"}), 200

# 1. Get All Employees (Sorted)
@app.route("/api/employees", methods=["GET"])
def get_employees():
    try:
        conn = get_db_connection()
        
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        query = """
            SELECT e.employee_id, e.first_name, e.last_name, e.email, 
                   e.job_role, 
                   e.salary, e.department_id, d.department_name 
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.department_id
            ORDER BY e.employee_id ASC;
        """
        
        cursor.execute(query)
        employees = cursor.fetchall()
        
        # प्रत्येक employee मध्ये 'designation' ही नवीन की जोडून त्यात job_role ची व्हॅल्यू टाकू
        for emp in employees:
            emp['designation'] = emp.get('job_role')

        cursor.close()
        conn.close()
        
        return jsonify(employees), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/employees", methods=["POST"])
def add_employee():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT IFNULL(MAX(employee_id), 0) + 1 AS next_id FROM employees;")
        result = cursor.fetchone()
        next_id = int(result["next_id"]) if isinstance(result, dict) else int(result[0])
        
        job_role = data.get("job_role") or data.get("designation") or "Associate"
        
        query = """
            INSERT INTO employees (employee_id, first_name, last_name, email, phone, department_id, job_role, salary, joining_date, employment_status, job_satisfaction_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            next_id,
            data.get("first_name"),
            data.get("last_name"),
            data.get("email"),
            data.get("phone"),
            data.get("department_id"),
            job_role,
            data.get("salary"),
            data.get("joining_date"),
            data.get("employment_status", "Active"),
            data.get("job_satisfaction_score", 3)
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Employee added successfully!", "employee_id": next_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/employees/<int:id>", methods=["PUT"])
def update_employee(id):
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        job_role = data.get("job_role") or data.get("designation") or "Associate"
        
        query = """
            UPDATE employees 
            SET first_name=%s, last_name=%s, email=%s, phone=%s, department_id=%s, job_role=%s, salary=%s, employment_status=%s, job_satisfaction_score=%s
            WHERE employee_id=%s
        """
        values = (
            data.get("first_name"),
            data.get("last_name"),
            data.get("email"),
            data.get("phone"),
            data.get("department_id"),
            job_role,
            data.get("salary"),
            data.get("employment_status"),
            data.get("job_satisfaction_score"),
            id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Employee updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM employees WHERE employee_id = %s;", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Employee deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/departments", methods=["GET"])
def get_departments():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT d.department_id, d.department_name, d.location, 
                   COUNT(e.employee_id) AS employee_count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id, d.department_name, d.location;
        """
        cursor.execute(query)
        departments = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(departments), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Dashboard Summary & KPIs (Matched EXACTLY with React Dashboard.jsx keys)
@app.route("/api/dashboard/summary", methods=["GET"])
@app.route("/api/analytics/kpis", methods=["GET"])
def get_dashboard_summary():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) AS total FROM employees;")
        total_ever = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS total FROM employees WHERE employment_status = 'Active';")
        active_count = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS total FROM departments;")
        total_depts = cursor.fetchone()["total"]
        
        cursor.execute("SELECT AVG(salary) AS avg_sal FROM employees WHERE employment_status = 'Active';")
        avg_salary = cursor.fetchone()["avg_sal"] or 0.0

        cursor.execute("SELECT IFNULL(AVG(job_satisfaction_score), 4.0) AS avg_perf FROM employees;")
        avg_perf = cursor.fetchone()["avg_perf"]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "total_employees": total_ever,
            "active_employees": active_count,
            "total_departments": total_depts,
            "average_salary": round(float(avg_salary), 2),
            "average_performance_rating": round(float(avg_perf), 2)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. Department Salary Analytics (Matched EXACTLY with Dashboard.jsx dataKey="average_salary")
@app.route("/api/analytics/department-salaries", methods=["GET"])
def get_department_salaries():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT d.department_name, AVG(e.salary) AS average_salary, COUNT(e.employee_id) AS employee_count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id, d.department_name;
        """
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/attendance", methods=["GET"])
def get_attendance():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT employee_id, first_name, last_name, 'Present' AS status, CURDATE() AS date FROM employees;")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/leave-requests", methods=["GET"])
def get_leave_requests():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT employee_id, first_name, last_name, 'Casual Leave' AS leave_type, 'Approved' AS status FROM employees LIMIT 5;")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/payroll", methods=["GET"])
def get_payroll():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT employee_id, first_name, last_name, salary AS basic_salary, 
                   (salary * 0.10) AS allowances, (salary * 0.05) AS deductions, 
                   (salary + (salary * 0.10) - (salary * 0.05)) AS net_salary, 
                   'Processed' AS status 
            FROM employees WHERE employment_status = 'Active';
        """
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/performance-reviews", methods=["GET"])
def get_performance_reviews():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT employee_id, first_name, last_name, job_satisfaction_score AS rating, 
                   '2026 Q1' AS review_period, '95%' AS goals_achieved, 'Excellent Performance' AS comments 
            FROM employees;
        """
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)