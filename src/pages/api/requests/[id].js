import pool from '../../../lib/db';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
    body
  } = req;
  const conn = await pool.getConnection();
  try {
    if (method === 'DELETE') {
      await conn.query(`DELETE FROM leave_requests WHERE id = ?`, [id]);
      res.status(204).end();

    } else if (method === 'PATCH') {
      const { status } = body;
      // only pending
      const [[row]] = await conn.query(`SELECT status FROM leave_requests WHERE id = ?`, [id]);
      if (!row || row.status !== 'รอพิจารณา') {
        return res.status(400).json({ message: 'ไม่สามารถเปลี่ยนสถานะได้' });
      }
      await conn.query(`UPDATE leave_requests SET status = ? WHERE id = ?`, [status, id]);
      const [[updated]] = await conn.query(`SELECT * FROM leave_requests WHERE id = ?`, [id]);
      res.status(200).json(updated);

    } else if (method === 'GET') {
      const [[row]] = await conn.query(`SELECT * FROM leave_requests WHERE id = ?`, [id]);
      if (!row) return res.status(404).json({ message: 'Not Found' });
      res.status(200).json(row);

    } else {
      res.setHeader('Allow', ['GET','DELETE','PATCH']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    conn.release();
  }
}