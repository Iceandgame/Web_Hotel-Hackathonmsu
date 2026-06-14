import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'ยืนยันแล้ว',   bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
  PENDING:     { label: 'รอดำเนินการ',  bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  CHECKED_IN:  { label: 'เช็คอินแล้ว',  bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  CHECKED_OUT: { label: 'เช็คเอาท์แล้ว', bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
  CANCELLED:   { label: 'ยกเลิกแล้ว',   bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.PENDING;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
      fontSize: '12px', fontWeight: '600',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  );
}

function EditModal({ booking, onClose, onSave }) {
  const [checkIn, setCheckIn] = useState(booking.booking_date || '');
  const [checkOut, setCheckOut] = useState(booking.check_out || '');
  const [saving, setSaving] = useState(false);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;

  const handleSave = async () => {
    if (!checkIn || !checkOut) return alert('กรุณาเลือกวันให้ครบ');
    if (nights <= 0) return alert('วันเช็คเอาท์ต้องมาหลังเช็คอิน');
    setSaving(true);
    try {
      await axios.put(`/api/bookings/${booking.id || booking.booking_id}`, {
        booking_date: checkIn, check_out: checkOut,
      });
      onSave(booking.id || booking.booking_id, checkIn, checkOut);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setSaving(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modal = { background: '#fff', borderRadius: '12px', padding: '28px', width: '380px', maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' };
  const inp = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}> แก้ไขวันที่จอง</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>วันเช็คอิน</label>
        <input style={inp} type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />

        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>วันเช็คเอาท์</label>
        <input style={inp} type="date" min={checkIn} value={checkOut} onChange={e => setCheckOut(e.target.value)} />

        {nights > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
             {nights} คืน
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>ยกเลิก</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyBookings({ user }) {
  const [myBookings, setMyBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, hotelsRes] = await Promise.all([
          axios.get(`/api/bookings/${user.email}`),
          axios.get('/api/hotels'),
        ]);
        setMyBookings(bookingsRes.data);
        setHotels(hotelsRes.data);
      } catch (err) {
        console.error("Error loading data", err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user.email]);

  const cancelBooking = async (booking) => {
    const status = booking.status?.toUpperCase();
    if (status === 'CHECKED_IN' || status === 'CHECKED_OUT') {
      return alert('ไม่สามารถยกเลิก booking ที่เช็คอินแล้วได้');
    }
    if (!window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return;
    try {
      await axios.delete(`/api/bookings/${booking.id || booking.booking_id}`);
      setMyBookings(myBookings.filter(b => (b.id || b.booking_id) !== (booking.id || booking.booking_id)));
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการยกเลิก', err);
      alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  const handleSave = (bookingId, newCheckIn, newCheckOut) => {
    setMyBookings(myBookings.map(b =>
      (b.id || b.booking_id) === bookingId
        ? { ...b, booking_date: newCheckIn, check_out: newCheckOut }
        : b
    ));
  };

  const getHotelName = (id) => {
    const hotel = hotels.find(h => h.hotel_id === id);
    return hotel ? hotel.name : id;
  };

  const canEdit = (status) => {
    const s = status?.toUpperCase();
    return s !== 'CHECKED_IN' && s !== 'CHECKED_OUT' && s !== 'CANCELLED';
  };

  return (
    <>
      <style>{`
        .bookings-wrap { max-width: 760px; margin: 32px auto; padding: 0 20px; }
        .booking-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 14px; background: #fff; }
        .booking-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .booking-hotel { font-size: 16px; font-weight: 700; color: #111; margin: 0 0 10px; }
        .booking-row { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 12px; }
        .booking-detail { font-size: 13px; color: #6b7280; }
        .booking-detail span { color: #111; font-weight: 600; }
        .booking-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .btn-edit { padding: '8px 14px'; border-radius: 7px; border: '1.5px solid #4f46e5'; background: '#fff'; color: '#4f46e5'; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-cancel { padding: 8px 14px; border-radius: 7px; border: 1.5px solid #fca5a5; background: #fff; color: #ef4444; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-cancel:hover { background: #ef4444; color: #fff; }
      `}</style>

      <div className="bookings-wrap">
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>
          รายการจองของฉัน
          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#9ca3af', fontWeight: '400' }}>
            ({myBookings.length} รายการ)
          </span>
        </h2>

        {loading ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '60px' }}>กำลังโหลด...</p>
        ) : myBookings.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '60px' }}>ยังไม่มีรายการจอง</p>
        ) : (
          myBookings.map((b) => {
            const bookingKey = b.id || b.booking_id;
            return (
              <div key={bookingKey} className="booking-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <p className="booking-hotel"> {getHotelName(b.hotel_id)}</p>
                  <StatusBadge status={b.status} />
                </div>

                <div className="booking-row">
                  <p className="booking-detail"> เช็คอิน: <span>{b.booking_date || b.check_in || '-'}</span></p>
                  {(b.check_out) && (
                    <p className="booking-detail"> เช็คเอาท์: <span>{b.check_out}</span></p>
                  )}
                  {b.guests && (
                    <p className="booking-detail"> ผู้เข้าพัก: <span>{b.guests} คน</span></p>
                  )}
                </div>

                {canEdit(b.status) && (
                  <div className="booking-actions">
                    <button
                      onClick={() => setEditingBooking(b)}
                      style={{ padding: '8px 14px', borderRadius: '7px', border: '1.5px solid #4f46e5', background: '#fff', color: '#4f46e5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.target.style.background = '#eef2ff'; }}
                      onMouseLeave={e => { e.target.style.background = '#fff'; }}
                    >
                       แก้ไขวันที่
                    </button>
                    <button className="btn-cancel" onClick={() => cancelBooking(b)}>
                      ยกเลิกการจอง
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {editingBooking && (
        <EditModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

export default MyBookings;