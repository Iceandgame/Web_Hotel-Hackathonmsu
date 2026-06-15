import { useState } from 'react';
import Hotellist from './Hotellist';
import Login from './login';
import MyBookings from './MyBookings';
import AdminDashboard from './AdminDashboard';
import AdminHome from './AdminHome';
import AdminStats from './AdminStats';
import Profile from './Profile';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  if (!user) return <Login onLogin={setUser} />;

  const role = user.role ? user.role.toUpperCase() : '';

  const navBtn = (label, targetView) => {
    const isActive = view === targetView;
    return (
      <button
        onClick={() => setView(targetView)}
        style={{
          padding: '8px 18px', borderRadius: '8px', border: 'none',
          background: isActive ? '#4f46e5' : 'transparent',
          color: isActive ? '#fff' : '#4f46e5',
          fontWeight: '600', fontSize: '14px', cursor: 'pointer',
          transition: 'all 0.2s',
          outline: isActive ? 'none' : '1.5px solid #4f46e5',
        }}
        onMouseEnter={e => { if (!isActive) e.target.style.background = '#eef2ff'; }}
        onMouseLeave={e => { if (!isActive) e.target.style.background = 'transparent'; }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="App">
      <nav style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
        {navBtn('หน้าแรก', 'home')}
        {(role === 'MEMBER' || role === 'VIP') && navBtn('รายการจองของฉัน', 'my-bookings')}
        {(role === 'MEMBER' || role === 'VIP') && navBtn('โปรไฟล์', 'profile')}
        {role === 'ADMIN' && navBtn('Admin Panel', 'admin-dashboard')}
        {role === 'ADMIN' && navBtn('สถิติ', 'admin-stats')}

        <button
          onClick={() => { setUser(null); setView('home'); }}
          style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
          onMouseEnter={e => { e.target.style.background = '#f9fafb'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        >
          Logout
        </button>
      </nav>

      {view === 'home' && role === 'ADMIN' && <AdminHome user={user} onNavigate={setView} />}
      {view === 'home' && role !== 'ADMIN' && (
        <>
          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', margin: '24px 0 8px', color: '#111' }}>
            Welcome, {user.name} <span style={{ color: '#4f46e5' }}>({role})</span>
          </h1>
          <Hotellist user={user} />
        </>
      )}
      {view === 'my-bookings' && (role === 'MEMBER' || role === 'VIP') && <MyBookings user={user} />}
      {view === 'profile' && (role === 'MEMBER' || role === 'VIP') && <Profile user={user} />}
      {view === 'admin-dashboard' && role === 'ADMIN' && <AdminDashboard />}
      {view === 'admin-stats' && role === 'ADMIN' && <AdminStats />}
    </div>
  );
}

export default App;