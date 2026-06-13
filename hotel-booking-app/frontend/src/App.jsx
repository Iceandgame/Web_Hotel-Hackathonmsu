import { useState } from 'react';
import Hotellist from './Hotellist';
import Login from './Login';
import MyBookings from './MyBookings';
import AdminDashboard from './AdminDashboard'; 

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  console.log("ข้อมูล User ที่ได้รับหลัง Login:", user);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // แปลง role เป็นตัวพิมพ์ใหญ่เพื่อป้องกันปัญหาการพิมพ์ผิด
  const role = user.role ? user.role.toUpperCase() : '';

  return (
    <div className="App">
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setView('home')}>หน้าแรก</button>
        
        {/* เมนูสำหรับ MEMBER */}
        {(role === 'MEMBER' || role === 'VIP') && (
          <button onClick={() => setView('my-bookings')}>รายการจองของฉัน</button>
        )}
        
        {/* เมนูสำหรับ ADMIN */}
        {role === 'ADMIN' && (
          <button onClick={() => setView('admin-dashboard')}>Admin Panel</button>
        )}

        <button onClick={() => setUser(null)} style={{ marginLeft: '20px' }}>Logout</button>
      
      </nav>

     
      {view === 'home' && (
        <>
          <h1>Welcome, {user.name} ({role})</h1>
          {role === 'ADMIN' ? <AdminDashboard /> : <Hotellist user={user} />}
        </>
      )}
      
      {view === 'my-bookings' && (role === 'MEMBER' || role === 'VIP') && <MyBookings user={user} />}
      
      {view === 'admin-dashboard' && role === 'ADMIN' && <AdminDashboard />}
    </div>
  );
}

export default App;