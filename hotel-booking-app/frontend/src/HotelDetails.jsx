import { useState } from 'react';
import axios from 'axios';

function HotelDetails({ hotel, user }) {
  const [booking, setBooking] = useState({
    check_in: '',
    check_out: '',
    guests: 1
  });

  const handleBooking = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/bookings', {
        user: user.email, 
        hotel_id: hotel.id,
        booking_date: booking.check_in,
        check_out: booking.check_out,
        guests: parseInt(booking.guests)
      });
      
      if (response.data.success) alert('จองสำเร็จ!');
    } catch (err) {
      alert('จองไม่สำเร็จ: ' + err.message);
    }
  };

  return (
    <div>
      <h1>{hotel.name}</h1>
      <input type="date" onChange={(e) => setBooking({...booking, check_in: e.target.value})} />
      <input type="date" onChange={(e) => setBooking({...booking, check_out: e.target.value})} />
      <input type="number" onChange={(e) => setBooking({...booking, guests: e.target.value})} />
      <button onClick={handleBooking}>ยืนยันการจอง</button>
    </div>
  );
}

export default HotelDetails;