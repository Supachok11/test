import pool from '../../../lib/db';

function isBusinessDaysOnly(start, end) {
  // ตรวจเฉพาะวันธรรมดา (จันทร์-ศุกร์)
  let cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    const day = cur.getDay();
    if (day === 0 || day === 6) {
      return false;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

export default async function handler(req, res) {
  const conn = await pool.getConnection();
  try {
    if (req.method === 'GET') {
      const { search = '', date = '', sort = 'DESC' } = req.query;
      let sql = `SELECT * FROM leave_requests WHERE 1=1`;
      const params = [];
      if (search) {
        sql += ` AND (first_name LIKE ? OR last_name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (date) {
        sql += ` AND ? BETWEEN start_date AND end_date`;
        params.push(date);
      }
      sql += ` ORDER BY created_at ${sort === 'ASC' ? 'ASC' : 'DESC'}`;
      const [rows] = await conn.query(sql, params);
      res.status(200).json(rows);

    } else if (req.method === 'POST') {
      const {
        first_name, last_name, department,
        email, phone, leave_type,
        reason, start_date, end_date
      } = req.body;
      const today = new Date();
      const sd = new Date(start_date);
      const ed = new Date(end_date);

      // Validation: no back date
      if (sd < today.setHours(0,0,0,0)) {
        return res.status(400).json({ message: 'ห้ามระบุวันลาย้อนหลัง' });
      }
      // Business days only
      if (!isBusinessDaysOnly(sd, ed)) {
        return res.status(400).json({ message: 'ระบุเฉพาะวันทำการ (จันทร์-ศุกร์)' });
      }
      // Vacation rules
      if (leave_type === 'พักร้อน') {
        const diffMs = ed - sd;
        const diffDays = diffMs / (1000*60*60*24) + 1;
        // ลาล่วงหน้า >=3 วัน
        const minStart = new Date();
        minStart.setDate(minStart.getDate() + 3);
        if (sd < minStart) {
          return res.status(400).json({ message: 'พักร้อนต้องลาล่วงหน้าอย่างน้อย 3 วัน' });
        }
        // ต่อเนื่องไม่เกิน 2 วัน
        if (diffDays > 2) {
          return res.status(400).json({ message: 'พักร้อนไม่เกิน 2 วันต่อครั้ง' });
        }
      }
      // Insert
      const [result] = await conn.query(
        `INSERT INTO leave_requests
        (first_name, last_name, department, email, phone, leave_type, reason, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, department, email, phone, leave_type, reason, start_date, end_date]
      );
      const [newRow] = await conn.query(`SELECT * FROM leave_requests WHERE id = ?`, [result.insertId]);
      res.status(201).json(newRow[0]);

    } else {
      res.setHeader('Allow', ['GET','POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}