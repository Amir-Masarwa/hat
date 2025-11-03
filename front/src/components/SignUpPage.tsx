import React, { useState } from 'react';
import { api } from '../services/api';

interface SignUpPageProps {
  onLogin: () => void;
  onSwitchToLogin: () => void;
  onVerificationSent: (email: string, name: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onLogin, onSwitchToLogin, onVerificationSent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Sign up and send verification code
      await api.post('/auth/signup', { name, email, password });
      // Show verification page
      onVerificationSent(email, name);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError('User already exists. Try logging in.');
      } else {
        setError(err?.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>🚀</div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Create Account</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Start managing your tasks today
          </p>
        </div>
        <form onSubmit={handleRegister}>
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
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <button className="btn btn-primary" type="submit" disabled={loading || !email || !name || !password} style={{ width: '100%' }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button className="btn" onClick={onSwitchToLogin} style={{ width: '100%' }}>
            Already registered? Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
