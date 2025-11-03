import React, { useState } from 'react';
import { api } from '../services/api';

interface VerificationPageProps {
  email: string;
  onVerified: (token: string) => void;
  onResend?: () => void;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ email, onVerified, onResend }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify', { email, code });
      if (response.data.token) {
        onVerified(response.data.token);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    setResending(true);
    setError('');
    try {
      await onResend();
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 350, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Verify Your Email</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Verification Code:</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              placeholder="000000"
              required
              maxLength={6}
              style={{
                width: '100%',
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '8px',
              }}
              disabled={loading}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || code.length !== 6}
            style={{ width: '100%' }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        {onResend && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button
              className="btn"
              onClick={handleResend}
              disabled={resending}
              style={{ width: '100%' }}
            >
              {resending ? 'Resending...' : "Didn't receive code? Resend"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;

