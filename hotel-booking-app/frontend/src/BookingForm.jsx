import { useState } from 'react';
import axios from 'axios';

const VIP_DISCOUNT_RATE = 0.10;       // ลด 10%
const POINTS_PER_BAHT = 10;           // 10 point = 1 บาท

function BookingForm({ hotel, user, onClose, onSuccess }) {
  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]     = useState(1);
  const [step, setStep]         = useState('form');
  const [usePoints, setUsePoints] = useState(0); // จำนวน point ที่จะใช้

  const isVIP = user.role?.toUpperCase() === 'VIP';
  const availablePoints = user.loyalty_points || 0;

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;

  const basePrice      = nights * hotel.price_per_night;
  const vipDiscount    = isVIP ? Math.round(basePrice * VIP_DISCOUNT_RATE) : 0;
  const pointsDiscount = Math.round(usePoints / POINTS_PER_BAHT);
  const finalPrice     = Math.max(0, basePrice - vipDiscount - pointsDiscount);

  const maxUsablePoints = Math.min(availablePoints, (basePrice - vipDiscount) * POINTS_PER_BAHT);

  const today = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    if (!checkIn || !checkOut) return alert('กรุณาเลือกวันเช็คอินและเช็คเอาท์');
    if (nights <= 0) return alert('วันเช็คเอาท์ต้องมาหลังวันเช็คอิน');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      await axios.post('/api/bookings', {
        user: user.email,
        hotel_id: hotel.hotel_id,
        booking_date: checkIn,
        check_out: checkOut,
        guests,
        original_price: basePrice,
        vip_discount: vipDiscount,
        points_used: usePoints,
        points_discount: pointsDiscount,
        final_price: finalPrice,
      });
      alert(`จอง ${hotel.name} สำเร็จ!`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  // --- Styles ---
  const overlay   = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modal     = { background: '#fff', borderRadius: '12px', padding: '30px', width: '440px', maxWidth: '90vw', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' };
  const lbl       = { display: 'block', marginBottom: '4px', fontWeight: '600', color: '#444', fontSize: '13px' };
  const inp       = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' };
  const btnPrimary    = { background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' };
  const btnSecondary  = { background: '#e5e7eb', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {step === 'form' ? ' จองโรงแรม' : ' ยืนยันการจอง'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Hotel info */}
        <div style={{ background: '#f8f7ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
          <strong>{hotel.name}</strong>
          <span style={{ color: '#888', marginLeft: '8px' }}>{hotel.location}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ color: '#4f46e5', fontWeight: '600' }}>{hotel.price_per_night.toLocaleString()} บาท / คืน</span>
            {isVIP && (
              <span style={{ background: '#fefce8', border: '1px solid #fde68a', color: '#92400e', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px' }}>
                 VIP -10%
              </span>
            )}
          </div>
        </div>

        {/* STEP 1: Form */}
        {step === 'form' && (
          <>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>วันเช็คอิน</label>
                <input style={inp} type="date" min={today} value={checkIn}
                  onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>วันเช็คเอาท์</label>
                <input style={inp} type="date" min={checkIn || today} value={checkOut}
                  onChange={e => setCheckOut(e.target.value)} />
              </div>
            </div>

            <label style={lbl}>จำนวนผู้เข้าพัก</label>
            <input style={inp} type="number" min="1" max="10" value={guests}
              onChange={e => setGuests(Number(e.target.value))} />

            {/* Price breakdown */}
            {nights > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', margin: '4px 0 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                  <span style={{ color: '#555' }}>ราคาปกติ ({nights} คืน)</span>
                  <span>{basePrice.toLocaleString()} บาท</span>
                </div>

                {isVIP && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#d97706' }}>
                    <span> ส่วนลด VIP 10%</span>
                    <span>-{vipDiscount.toLocaleString()} บาท</span>
                  </div>
                )}

                {/* Loyalty points slider */}
                {isVIP && availablePoints > 0 && (
                  <div style={{ margin: '10px 0', padding: '10px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#92400e' }}> ใช้ Points</span>
                      <span style={{ color: '#92400e' }}>มี {availablePoints.toLocaleString()} point</span>
                    </div>
                    <input
                      type="range" min="0" max={maxUsablePoints}
                      step={POINTS_PER_BAHT}
                      value={usePoints}
                      onChange={e => setUsePoints(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#d97706' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
                      <span>ใช้ {usePoints.toLocaleString()} point</span>
                      <span>ลด {pointsDiscount.toLocaleString()} บาท</span>
                    </div>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#d97706' }}>
                    <span> ส่วนลด Points</span>
                    <span>-{pointsDiscount.toLocaleString()} บาท</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', color: '#111' }}>ราคารวม</span>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#16a34a' }}>{finalPrice.toLocaleString()} บาท</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={btnSecondary} onClick={onClose}>ยกเลิก</button>
              <button style={btnPrimary} onClick={handleNext}>ถัดไป →</button>
            </div>
          </>
        )}

        {/* STEP 2: Confirm */}
        {step === 'confirm' && (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
              {[
                ['ผู้จอง', user.name],
                ['เช็คอิน', checkIn],
                ['เช็คเอาท์', checkOut],
                ['จำนวนคืน', `${nights} คืน`],
                ['ผู้เข้าพัก', `${guests} คน`],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: '7px 0', color: '#666', width: '40%', fontSize: '14px' }}>{k}</td>
                  <td style={{ padding: '7px 0', fontWeight: '500', fontSize: '14px' }}>{v}</td>
                </tr>
              ))}
            </table>

            {/* Price summary */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', margin: '12px 0' }}>
              {isVIP && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                    <span>ราคาปกติ</span><span>{basePrice.toLocaleString()} บาท</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#d97706', marginBottom: '4px' }}>
                    <span> ส่วนลด VIP 10%</span><span>-{vipDiscount.toLocaleString()} บาท</span>
                  </div>
                </>
              )}
              {pointsDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#d97706', marginBottom: '4px' }}>
                  <span> ส่วนลด Points ({usePoints.toLocaleString()} pt)</span>
                  <span>-{pointsDiscount.toLocaleString()} บาท</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '8px', marginTop: '4px', textAlign: 'center' }}>
                <div style={{ color: '#555', fontSize: '13px', marginBottom: '4px' }}>ราคารวมทั้งหมด</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a' }}>{finalPrice.toLocaleString()} บาท</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={btnSecondary} onClick={() => setStep('form')}>← แก้ไข</button>
              <button style={{ ...btnPrimary, background: '#16a34a' }} onClick={handleConfirm}>
                ยืนยันการจอง ✓
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingForm;