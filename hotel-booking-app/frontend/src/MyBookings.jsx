import { useState, useEffect } from 'react';
import axios from 'axios';

function MyBookings({ user }) {
  const [myBookings, setMyBookings] = useState([]);
  const [hotels, setHotels] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, hotelsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/bookings/${user.email}`),
          axios.get('http://localhost:5000/api/hotels')
        ]);
        
        setMyBookings(bookingsRes.data);
        setHotels(hotelsRes.data);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };
    fetchData();
  }, [user.email]);

  // ฟังก์ชันยกเลิกการจอง
  const cancelBooking = async (bookingDate) => {
    if (window.confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${bookingDate}`);
        
        setMyBookings(myBookings.filter(b => b.date !== bookingDate));
        alert("ยกเลิกการจองสำเร็จ");
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการยกเลิก");
      }
    }
  };

  const getHotelName = (id) => {
    const hotel = hotels.find(h => h.hotel_id === id); 
    return hotel ? hotel.name : "ไม่พบชื่อโรงแรม";
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>รายการจอง</h2>
      {myBookings.length === 0 ? <p>ยังไม่มีรายการจอง</p> : (
        <ul>
          {myBookings.map((b, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              โรงแรม: {getHotelName(b.hotel_id)} 
              | วันที่เข้าพัก: {b.booking_date || 'ไม่ระบุวันที่'} 
              | จองเมื่อ: {new Date(b.date).toLocaleDateString()}
              
              {/* ปุ่มยกเลิก */}
              <button 
                onClick={() => cancelBooking(b.date)} 
                style={{ marginLeft: '10px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyBookings;