import { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState('');

  // ดึงข้อมูลโรงแรม
  const fetchHotels = async (query = '') => {
    const res = await axios.get(`http://localhost:5000/api/hotels?search=${query}`);
    setHotels(res.data);
  };

  useEffect(() => {
  const loadHotels = async () => {
    await fetchHotels();
  };
  loadHotels();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>ค้นหาโรงแรม</h1>
      <input 
        type="text" 
        placeholder="ค้นหาชื่อโรงแรมหรือสถานที่..." 
        onChange={(e) => setSearch(e.target.value)} 
      />
      <button onClick={() => fetchHotels(search)}>ค้นหา</button>

      <div style={{ marginTop: '20px' }}>
        {hotels.map(h => (
          <div key={h.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{h.name}</h3>
            <p>สถานที่: {h.location} | ราคา: {h.price} บาท</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;