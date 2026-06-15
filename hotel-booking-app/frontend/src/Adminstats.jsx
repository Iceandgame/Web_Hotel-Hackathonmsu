import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://web-hotel-hackathonmsu.onrender.com';

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'ยืนยันแล้ว',  color: '#16a34a', bg: '#dcfce7' },
  PENDING:     { label: 'รอดำเนินการ', color: '#ca8a04', bg: '#fefce8' },
  CHECKED_IN:  { label: 'เช็คอินแล้ว', color: '#1d4ed8', bg: '#dbeafe' },
  CHECKED_OUT: { label: 'เช็คเอาท์แล้ว', color: '#6b7280', bg: '#f3f4f6' },
  CANCELLED:   { label: 'ยกเลิกแล้ว',  color: '#dc2626', bg: '#fee2e2' },
};

function AdminStats() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/admin/bookings`)
      .then(r => setBookings(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>กำลังโหลด...</p>;

  // 1. ยอดจองแต่ละสถานะ
  const statusCount = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status?.toUpperCase() === s).length;
    return acc;
  }, {});

  // 2. โรงแรมที่ถูกจองมากสุด
  const hotelCount = {};
  bookings.forEach(b => {
    const name = b.hotel_name || b.hotel_id;
    hotelCount[name] = (hotelCount[name] || 0) + 1;
  });
  const topHotels = Object.entries(hotelCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxHotelCount = topHotels[0]?.[1] || 1;

  // 3. รายได้รวม
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.final_price || b.total_price || 0), 0);
  const confirmedRevenue = bookings.filter(b => ['CONFIRMED','CHECKED_IN','CHECKED_OUT'].includes(b.status?.toUpperCase())).reduce((sum, b) => sum + (b.final_price || b.total_price || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: '0 0 24px' }}>สถิติภาพรวม</h2>

      {/* รายได้รวม */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'การจองทั้งหมด', value: bookings.length + ' รายการ', color: '#4f46e5', bg: '#eef2ff' },
          { label: 'รายได้รวมทั้งหมด', value: totalRevenue.toLocaleString() + ' บาท', color: '#16a34a', bg: '#dcfce7' },
          { label: 'รายได้ที่ยืนยันแล้ว', value: confirmedRevenue.toLocaleString() + ' บาท', color: '#d97706', bg: '#fefce8' },
        ].map(item => (
          <div key={item.label} style={{ background: item.bg, borderRadius: '12px', padding: '20px', border: `1px solid ${item.color}22` }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* ยอดจองแต่ละสถานะ */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#111' }}>ยอดจองแต่ละสถานะ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ textAlign: 'center', background: cfg.bg, borderRadius: '10px', padding: '16px 8px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', color: cfg.color }}>{statusCount[key] || 0}</p>
              <p style={{ margin: 0, fontSize: '12px', color: cfg.color, fontWeight: '600' }}>{cfg.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* โรงแรมที่ถูกจองมากสุด */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#111' }}>โรงแรมที่ถูกจองมากสุด Top 5</h3>
        {topHotels.map(([name, count], i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? '#4f46e5' : '#e0e7ff', color: i === 0 ? '#fff' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{name}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{count} ครั้ง</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '99px', background: '#4f46e5', width: `${(count / maxHotelCount) * 100}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminStats;