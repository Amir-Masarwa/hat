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
  const [errors, setErrors] = useState({ name: '', email: '', password: '', general: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);

  const validateName = (value: string) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Za-z]/.test(value)) return 'Password must contain letters';
    if (!/[0-9]/.test(value)) return 'Password must contain numbers';
    return '';
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (touched.name) {
      setErrors(prev => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'name') {
      setErrors(prev => ({ ...prev, name: validateName(name) }));
    } else if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched
    setTouched({ name: true, email: true, password: true });
    
    // Validate all
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (nameError || emailError || passwordError) {
      setErrors({ name: nameError, email: emailError, password: passwordError, general: '' });
      return;
    }

    setErrors({ name: '', email: '', password: '', general: '' });
    setLoading(true);
    try {
      await api.post('/auth/signup', { name, email, password });
      onVerificationSent(email, name);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErrors(prev => ({ ...prev, general: 'User already exists. Try logging in.' }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: err?.response?.data?.message || 'Registration failed.',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = errors.name || errors.email || errors.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-indigo-100">Start managing your tasks today</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 ${
                    errors.name && touched.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.password}
                  </p>
                )}
                {!errors.password && password && (
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs flex items-center gap-1 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      {password.length >= 6 ? '✓' : '○'} At least 6 characters
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[A-Za-z]/.test(password) ? '✓' : '○'} Contains letters
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(password) ? '✓' : '○'} Contains numbers
                    </p>
                  </div>
                )}
              </div>
              
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !email || !name || !password || !!hasErrors}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing up...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                Already have an account? Log in →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
