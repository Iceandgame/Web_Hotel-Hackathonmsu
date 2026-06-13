import { useEffect, useState } from 'react';
import axios from 'axios';

function Hotellist({ user }) {
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState('');
  const [dates, setDates] = useState({}); 

  useEffect(() => {
    fetch('http://localhost:5000/api/hotels')
      .then(response => response.json())
      .then(data => setHotels(data))
      .catch(error => console.error('Error fetching hotels:', error));
  }, []);

  const handleDateChange = (hotelId, date) => {
    setDates(prev => ({ ...prev, [hotelId]: date }));
  };

  const handleBooking = async (hotel) => {
    const selectedDate = dates[hotel.hotel_id];
    
    if (!selectedDate) {
      alert("กรุณาเลือกวันที่ก่อนจอง");
      return;
    }

    try {
      const bookingData = {
        user: user.email,
        hotel_id: hotel.hotel_id,
        booking_date: selectedDate, 
        date: new Date().toISOString()
      };

      await axios.post('http://localhost:5000/api/bookings', bookingData);
      alert(`จอง ${hotel.name} สำเร็จสำหรับวันที่ ${selectedDate}`);
    } catch (error) {
        console.error('Booking failed:', error);
        alert('Booking failed. Please try again.');
    }
  };

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) || 
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>Hotel List</h2>
      <input 
        type="text" 
        placeholder="Search by name or location..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)} 
        style={{ marginBottom: '20px', padding: '8px', width: '300px' }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredHotels.map(hotel => (
          <li key={hotel.hotel_id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
            <h3>{hotel.name}</h3>
            <p>Location: {hotel.location} | Rating: {hotel.rating} stars</p>
            <p>Price: {hotel.price_per_night} THB/night</p>
            <p>Amenities: {hotel.amenities?.join(', ') || 'No information'}</p>
            
            <input 
              type="date" 
              onChange={(e) => handleDateChange(hotel.hotel_id, e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <button onClick={() => handleBooking(hotel)}>
              Book Now
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Hotellist;