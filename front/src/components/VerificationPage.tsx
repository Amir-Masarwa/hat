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
      setCode('');
      setError('');
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-7xl mb-6 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold text-green-600 mb-3">Email Verified!</h2>
            <p className="text-gray-600">Redirecting to login page...</p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-blue-100">
              We've sent a 6-digit code to
            </p>
            <p className="text-white font-semibold mt-1">{email}</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Verification Code
                </label>
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
                  disabled={loading}
                  className="w-full px-4 py-4 text-3xl text-center tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Code expires in 1 minute • 5 attempts allowed
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>
            
            {onResend && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {resending ? 'Resending...' : "Didn't receive code? Resend →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
