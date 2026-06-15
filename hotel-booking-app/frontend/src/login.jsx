import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://web-hotel-hackathonmsu.onrender.com/api/login', { email });
      onLogin(response.data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError('ไม่พบอีเมลนี้ในระบบ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '360px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Title */}
        <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '700', color: '#111' }}>
          เข้าสู่ระบบ
        </h1>
        <p style={{ margin: '0 0 32px', color: '#9ca3af', fontSize: '14px' }}>
          Hotel Booking Portal
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            อีเมล
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: error ? '1.5px solid #f87171' : '1.5px solid #e5e7eb',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '8px',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = error ? '#f87171' : '#e5e7eb'}
          />

          {/* Error */}
          {error && (
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#ef4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              marginTop: '16px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? '#a5b4fc' : '#6366f1',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;