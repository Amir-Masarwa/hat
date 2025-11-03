import React, { useState } from 'react';
import { api } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      onLogin();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>🔐</div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Welcome Back</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Sign in to manage your tasks
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
              disabled={loading}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading || !email || !password} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button className="btn" onClick={onSwitchToSignUp} style={{ width: '100%' }}>
            New user? Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
