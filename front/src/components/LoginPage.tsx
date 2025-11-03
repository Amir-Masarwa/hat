import React, { useState } from 'react';
import { api } from '../services/api';

interface LoginPageProps {
  onLogin: (token: string) => void;
  onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email });
      const token = response.data.token;
      if (token) {
        onLogin(token);
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError('Login failed. Are you registered?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 350, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Login</h2>
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
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading || !email} style={{ width: '100%' }}>
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
