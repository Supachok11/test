import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

const formStyle = {
  maxWidth: 400,
  margin: '40px auto',
  padding: 24,
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  fontFamily: 'inherit'
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  marginBottom: 16,
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 16,
  boxSizing: 'border-box'
};

const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, minHeight: 60, resize: 'vertical' };

const buttonStyle = {
  width: '100%',
  padding: '10px 0',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 18,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8
};

export default function RequestForm({ onSuccess }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', department: '', email: '',
    phone: '', leave_type: 'อื่นๆ', reason: '',
    start_date: new Date(), end_date: new Date()
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleDate = (name, d) => setForm({ ...form, [name]: d });

  const handleSubmit = async e => {
    e.preventDefault();
    // ฟังก์ชันแปลง Date เป็น yyyy-mm-dd แบบ local ที่ไม่โดน timezone shift
    const toLocalDateString = d => d
      ? `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
      : '';
    const payload = {
      ...form,
      start_date: toLocalDateString(form.start_date),
      end_date: toLocalDateString(form.end_date)
    };
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      Swal.fire('Error', data.message, 'error');
    } else {
      Swal.fire('Success','บันทึกข้อมูลเรียบร้อย','success');
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{textAlign:'center', marginBottom: 24, color:'#1976d2'}}>ฟอร์มขอลา</h2>
      <label style={labelStyle}>ชื่อ*</label>
      <input name="first_name" required placeholder="ชื่อ" value={form.first_name} onChange={handleChange} style={inputStyle} />
      <label style={labelStyle}>นามสกุล*</label>
      <input name="last_name" required placeholder="นามสกุล" value={form.last_name} onChange={handleChange} style={inputStyle} />
      <label style={labelStyle}>สังกัด/ตำแหน่ง</label>
      <input name="department" placeholder="สังกัด/ตำแหน่ง" value={form.department} onChange={handleChange} style={inputStyle} />
      <label style={labelStyle}>อีเมล์</label>
      <input name="email" placeholder="อีเมล์" value={form.email} onChange={handleChange} style={inputStyle} />
      <label style={labelStyle}>เบอร์โทรศัพท์*</label>
      <input name="phone" required placeholder="เบอร์โทรศัพท์" value={form.phone} onChange={handleChange} style={inputStyle} maxLength={10} />
      <label style={labelStyle}>ประเภทการลา*</label>
      <select name="leave_type" required value={form.leave_type} onChange={handleChange} style={selectStyle}>
        <option>ลาป่วย</option>
        <option>ลากิจ</option>
        <option>พักร้อน</option>
        <option>อื่นๆ</option>
      </select>
      <label style={labelStyle}>สาเหตุการลา*</label>
      <textarea name="reason" required placeholder="สาเหตุการลา" value={form.reason} onChange={handleChange} style={textareaStyle} />
      <div style={{display:'flex', gap:12, marginBottom:16}}>
        <div style={{flex:1}}>
          <label style={labelStyle}>จากวันที่:</label>
          <DatePicker
            selected={form.start_date}
            onChange={d => handleDate('start_date', d)}
            dateFormat="yyyy-MM-dd"
            style={inputStyle}
          />
        </div>
        <div style={{flex:1}}>
          <label style={labelStyle}>ถึงวันที่:</label>
          <DatePicker
            selected={form.end_date}
            onChange={d => handleDate('end_date', d)}
            dateFormat="yyyy-MM-dd"
            style={inputStyle}
          />
        </div>
      </div>
      <button type="submit" style={buttonStyle}>ส่งคำขอ</button>
    </form>
  );
}