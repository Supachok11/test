CREATE DATABASE IF NOT EXISTS leave_db;
USE leave_db;

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  leave_type ENUM('ลาป่วย','ลากิจ','พักร้อน','อื่นๆ') NOT NULL DEFAULT 'อื่นๆ',
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('รอพิจารณา','อนุมัติ','ไม่อนุมัติ') NOT NULL DEFAULT 'รอพิจารณา'
);