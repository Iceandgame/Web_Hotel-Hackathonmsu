import { useEffect, useState } from 'react';
import BookingForm from './BookingForm';
import HotelSearchAI from './Hotelsearchai';

function Hotellist({ user }) {
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/hotels`)
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(err => console.error('Error fetching hotels:', err));
  }, []);

  const filteredHotels = hotels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        .hotel-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 0;
          list-style: none;
          margin: 0;
        }
        @media (max-width: 1024px) { .hotel-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  { .hotel-grid { grid-template-columns: 1fr; } }
        .hotel-card {
          border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;
          background: #fff; display: flex; flex-direction: column; gap: 6px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .hotel-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .hotel-name { font-size: 16px; font-weight: 700; color: #111; margin: 0 0 4px; }
        .hotel-meta { font-size: 13px; color: #6b7280; margin: 0; }
        .hotel-price { font-size: 15px; font-weight: 600; color: #4f46e5; margin: 4px 0 0; }
        .amenity-tag { display: inline-block; background: #f3f4f6; border-radius: 99px; padding: 3px 10px; font-size: 12px; color: #374151; margin: 2px 2px 0 0; }
        .book-btn { margin-top: auto; padding-top: 14px; }
        .book-btn button { width: 100%; padding: 9px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .book-btn button:hover { background: #4338ca; }
        .search-input { width: 320px; max-width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border 0.2s; box-sizing: border-box; }
        .search-input:focus { border-color: #4f46e5; }
        .rating-badge { display: inline-flex; align-items: center; gap: 4px; background: #fefce8; border: 1px solid #fde68a; border-radius: 99px; padding: 2px 8px; font-size: 12px; font-weight: 600; color: #92400e; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
      `}</style>

      <div style={{ padding: '24px 20px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* AI Search */}
        <HotelSearchAI hotels={hotels} onSelectHotel={setSelectedHotel} />

        <hr className="divider" />

        {/* Header + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#111' }}>โรงแรมทั้งหมด</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>{filteredHotels.length} แห่ง</p>
          </div>
          <input className="search-input" type="text" placeholder="ค้นหาชื่อหรือสถานที่..."
            value={search} onChange={e => setSearch(e.target.value)} aria-label="ค้นหาโรงแรม" />
        </div>

        {/* Grid */}
        {filteredHotels.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '60px' }}>ไม่พบโรงแรมที่ค้นหา</p>
        ) : (
          <ul className="hotel-grid">
            {filteredHotels.map(hotel => (
              <li key={hotel.hotel_id} className="hotel-card">
                <h3 className="hotel-name">Hotel: {hotel.name}</h3>
                <p className="hotel-meta"> Location: {hotel.location}</p>
                <span className="rating-badge">Rating: {hotel.rating}</span>
                <p className="hotel-price">{hotel.price_per_night.toLocaleString()} บาท / คืน</p>
                <div style={{ marginTop: '8px' }}>
                  {hotel.amenities?.map(a => <span key={a} className="amenity-tag">{a}</span>)}
                </div>
                <div className="book-btn">
                  <button onClick={() => setSelectedHotel(hotel)}>จองเลย</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedHotel && (
        <BookingForm
          hotel={selectedHotel}
          user={user}
          onClose={() => setSelectedHotel(null)}
          onSuccess={() => setSelectedHotel(null)}
        />
      )}
    </>
  );
}

export default Hotellist;