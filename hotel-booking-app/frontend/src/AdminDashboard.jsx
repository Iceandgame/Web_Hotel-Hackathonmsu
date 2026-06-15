import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'ยืนยันแล้ว',    bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
  PENDING:     { label: 'รอดำเนินการ',   bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  CHECKED_IN:  { label: 'เช็คอินแล้ว',   bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  CHECKED_OUT: { label: 'เช็คเอาท์แล้ว', bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
  CANCELLED:   { label: 'ยกเลิกแล้ว',    bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.PENDING;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null); // id ที่กำลัง update

  useEffect(() => {
    axios.get('/api/admin/bookings')
      .then(r => setBookings(r.data))
      axios.get('https://web-hotel-hackathonmsu.onrender.com/api/admin/bookings')
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (booking, newStatus) => {
    const id = booking.id || booking.booking_id;
    setUpdating(id);
    try {
      await axios.patch(`https://web-hotel-hackathonmsu.onrender.com/api/admin/bookings/${id}`, { status: newStatus });
      setBookings(bookings.map(b =>
        (b.id || b.booking_id) === id ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('เปลี่ยนสถานะไม่สำเร็จ');
    } finally { setUpdating(null); }
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === 'ALL' || b.status?.toUpperCase() === filterStatus;
    const matchSearch = !search ||
      b.hotel_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // สรุปยอด
  const summary = STATUSES.reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status?.toUpperCase() === s).length;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        .admin-wrap { max-width: 1100px; margin: 32px auto; padding: 0 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
        @media (max-width: 768px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
        .summary-card { border-radius: 10px; padding: 14px 16px; border: 1px solid; cursor: pointer; transition: opacity 0.2s; }
        .summary-card:hover { opacity: 0.8; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .admin-table th { text-align: left; padding: 10px 12px; background: #f9fafb; color: #6b7280; font-size: 12px; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
        .admin-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; color: #111; vertical-align: middle; }
        .admin-table tr:hover td { background: #fafafa; }
        .status-select { padding: 6px 10px; border-radius: 7px; border: 1.5px solid #e5e7eb; font-size: 13px; font-weight: 600; cursor: pointer; background: #fff; outline: none; }
        .status-select:focus { border-color: #4f46e5; }
        .filter-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .search-inp { padding: 9px 14px; border-radius: 8px; border: 1.5px solid #e5e7eb; font-size: 14px; outline: none; width: 220px; }
        .search-inp:focus { border-color: #4f46e5; }
      `}</style>

      <div className="admin-wrap">
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>
          Admin — จัดการ Bookings
          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#9ca3af', fontWeight: '400' }}>
            ({bookings.length} รายการทั้งหมด)
          </span>
        </h2>

        {/* Summary cards */}
        <div className="summary-grid">
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="summary-card"
                style={{ background: cfg.bg, borderColor: cfg.border }}
                onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
              >
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: cfg.color, fontWeight: '600' }}>{cfg.label}</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: cfg.color }}>{summary[s] || 0}</p>
              </div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <input className="search-inp" placeholder="ค้นหาชื่อโรงแรม / ผู้จอง..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="status-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">ทุกสถานะ</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>แสดง {filtered.length} รายการ</span>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>กำลังโหลด...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>ไม่พบรายการ</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>โรงแรม</th>
                  <th>ผู้จอง</th>
                  <th>เช็คอิน</th>
                  <th>เช็คเอาท์</th>
                  <th>สถานะ</th>
                  <th>เปลี่ยนสถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const id = b.id || b.booking_id;
                  const isUpdating = updating === id;
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: '600' }}>{b.hotel_name}</td>
                      <td style={{ color: '#6b7280' }}>{b.user_name}</td>
                      <td>{b.booking_date || b.check_in || '-'}</td>
                      <td>{b.check_out || '-'}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <select
                          className="status-select"
                          value={b.status?.toUpperCase() || 'PENDING'}
                          disabled={isUpdating}
                          onChange={e => changeStatus(b, e.target.value)}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;