import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const containerStyle = {
    maxWidth: 900,
    margin: '40px auto',
    padding: 24,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    fontFamily: 'inherit'
};

const filterRowStyle = {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
    alignItems: 'center'
};

const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 16,
    minWidth: 120
};

const selectStyle = { ...inputStyle, minWidth: 140 };

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 12
};

const thStyle = {
    background: '#1976d2',
    color: '#fff',
    padding: '10px 8px',
    fontWeight: 600,
    fontSize: 16
};

const tdStyle = {
    padding: '8px 8px',
    borderBottom: '1px solid #eee',
    fontSize: 15
};

const buttonStyle = {
    padding: '6px 14px',
    marginRight: 6,
    border: 'none',
    borderRadius: 5,
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: 15
};

const deleteBtn = {
    ...buttonStyle,
    background: '#e53935',
    color: '#fff'
};

const statusBtn = {
    ...buttonStyle,
    background: '#43a047',
    color: '#fff'
};

export default function RequestList() {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [date, setDate] = useState('');
    const [sort, setSort] = useState('DESC');

    const fetchData = async () => {
        const qs = new URLSearchParams({ search, date, sort });
        const res = await fetch('/api/requests?' + qs);
        const data = await res.json();
        setRequests(data);
    };

    useEffect(() => { fetchData() }, [search, date, sort]);

    const formatDate = d => {
        // ถ้า r.start_date คือ string '2025-05-30' หรือ Date object
        const dateObj = typeof d === 'string' ? new Date(d) : d;
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleDelete = id => {
        Swal.fire({
            title: 'ยืนยันลบ?', icon: 'warning', showCancelButton: true
        }).then(async r => {
            if (r.isConfirmed) {
                await fetch('/api/requests/' + id, { method: 'DELETE' });
                fetchData();
            }
        });
    };

    const handleStatus = (id) => {
        Swal.fire({
            title: 'เปลี่ยนสถานะเป็น',
            input: 'select',
            inputOptions: { 'อนุมัติ': 'อนุมัติ', 'ไม่อนุมัติ': 'ไม่อนุมัติ' },
            showCancelButton: true
        }).then(async res => {
            if (res.value) {
                await fetch('/api/requests/' + id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: res.value })
                });
                fetchData();
            }
        });
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 24 }}>รายการคำขอลา</h2>
            <div style={filterRowStyle}>
                <input
                    placeholder="ค้นหาชื่อ"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="date"
                    placeholder="วันที่"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={inputStyle}
                />
                <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
                    <option value="DESC">ใหม่สุดก่อน</option>
                    <option value="ASC">เก่าสุดก่อน</option>
                </select>
            </div>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>ชื่อ</th>
                        <th style={thStyle}>สกุล</th>
                        <th style={thStyle}>วันที่ลา</th>
                        <th style={thStyle}>สถานะ</th>
                        <th style={thStyle}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(r => (
                        <tr key={r.id}>
                            <td style={tdStyle}>{r.first_name}</td>
                            <td style={tdStyle}>{r.last_name}</td>
                            <td style={tdStyle}>
                                {formatDate(r.start_date)} – {formatDate(r.end_date)}
                            </td>
                            <td style={tdStyle}>{r.status}</td>
                            <td style={tdStyle}>
                                <button style={deleteBtn} onClick={() => handleDelete(r.id)}>ลบ</button>
                                {r.status === 'รอพิจารณา' &&
                                    <button style={statusBtn} onClick={() => handleStatus(r.id)}>พิจารณา</button>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {requests.length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>ไม่พบข้อมูล</div>
            )}
        </div>
    );
}