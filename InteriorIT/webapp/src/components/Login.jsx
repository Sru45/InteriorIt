import React, { useState } from 'react';

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('auth_token', 'dummy_jwt_token_123');
      localStorage.setItem('user_name', 'Babu Suthar');
      setAuth(true);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-red)' }}>Interior IT Login</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="input-field" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
}
