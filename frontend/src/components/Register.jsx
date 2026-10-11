import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Input from './ui/Input';
import Button from './ui/Button';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Password strength
  const getPasswordStrength = (password) => {
    if (!password) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: '25%', text: 'text-rose-600' };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', width: '55%', text: 'text-amber-600' };
    if (score <= 4) return { label: 'Good', color: 'bg-emerald-500', width: '80%', text: 'text-emerald-600' };
    return { label: 'Strong', color: 'bg-emerald-600', width: '100%', text: 'text-emerald-700' };
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!agreeTerms) {
      return setError('Please agree to the Terms & Conditions');
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── Left: Brand panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        ></div>
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <span className="text-6xl mb-6">🚀</span>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Start your journey
            <br />
            with us today.
          </h1>
          <p className="text-lg text-brand-100 max-w-md">
            Join thousands of customers and providers across Ethiopia. Book services or grow your
            business — all in one platform.
          </p>

          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 text-brand-100">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✓
              </span>
              <span>Book services in seconds</span>
            </div>
            <div className="flex items-center gap-3 text-brand-100">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✓
              </span>
              <span>Verified providers only</span>
            </div>
            <div className="flex items-center gap-3 text-brand-100">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✓
              </span>
              <span>Real reviews, real people</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Form ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🚀</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">Service Booking</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
            <p className="text-slate-500 mt-2">It only takes a minute</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 animate-fade-in">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Abebe Bekele"
              required
              autoComplete="name"
              icon="👤"
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
              icon="✉️"
            />

            {/* ─── Role Selector ─── */}
            <div>
              <label className="label">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    formData.role === 'customer'
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {formData.role === 'customer' && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
                      ✓
                    </span>
                  )}
                  <span className="text-3xl block mb-2">👤</span>
                  <p
                    className={`font-semibold text-sm ${
                      formData.role === 'customer' ? 'text-brand-700' : 'text-slate-800'
                    }`}
                  >
                    Book Services
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">I'm a customer</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'provider' })}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    formData.role === 'provider'
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {formData.role === 'provider' && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
                      ✓
                    </span>
                  )}
                  <span className="text-3xl block mb-2">🔧</span>
                  <p
                    className={`font-semibold text-sm ${
                      formData.role === 'provider' ? 'text-brand-700' : 'text-slate-800'
                    }`}
                  >
                    Offer Services
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">I'm a provider</p>
                </button>
              </div>
            </div>

            {/* ─── Password with strength ─── */}
            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                minLength="6"
                autoComplete="new-password"
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Password strength</span>
                    <span className={`text-xs font-semibold ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Confirm password ─── */}
            <div>
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
              {formData.confirmPassword && (
                <p
                  className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${
                    passwordsMatch ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <span>✅</span> Passwords match
                    </>
                  ) : (
                    <>
                      <span>❌</span> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            {/* ─── Terms checkbox ─── */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600 leading-snug">
                I agree to the{' '}
                <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* ─── Submit ─── */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-slate-600 mt-8 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;