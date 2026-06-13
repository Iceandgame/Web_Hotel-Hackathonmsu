import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email });
      onLogin(response.data.user); // Passes user object to App.jsx
    } catch (err) {
      console.error('Login error:', err.response ? {status: err.response.status, data: err.response.data} : err);
      alert("Invalid email or server error — check console for details.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login to Booking Portal</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
export default Login;