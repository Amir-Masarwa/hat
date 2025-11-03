import React, { useState } from 'react';
import { api } from '../services/api';

interface VerificationPageProps {
  email: string;
  onVerified: () => void;
  onResend?: () => void;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ email, onVerified, onResend }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify', { email, code });
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onVerified();
      }, 2000);
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

  if (success) {
    return (
      <div className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: 12 }}>✅</div>
            <h2 style={{ color: '#28a745', marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: '#666' }}>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>📧</div>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Verify Your Email</h2>
          <p style={{ color: '#666', margin: 0, marginBottom: 20 }}>
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>
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

