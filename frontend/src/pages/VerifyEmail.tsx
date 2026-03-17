import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const useQuery = () => new URLSearchParams(useLocation().search);

const VerifyEmail: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = query.get('email') || '';
    setEmail(e);
    const sent = query.get('sent');
    const err = query.get('err');
    if (sent === '1') {
      setMessage('Verification email sent. Please check your inbox.');
    } else if (sent === '0' && err) {
      setError(`Could not send verification email: ${err}`);
    }
  }, [query]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email || !code.trim()) {
      setError('Please provide your email and the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyEmail(email, code.trim());
      if (!res.success) {
        setError(res.error || 'Verification failed');
        return;
      }
      setMessage('Email verified! Redirecting...');
      setTimeout(() => navigate('/'), 800);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError('Missing email. Go back to signup.');
      return;
    }
    const res = await resendVerification(email);
    if (!res.success) {
      setError(res.error || 'Unable to resend code');
      return;
    }
    if ((res as any).emailSent) {
      setMessage('Verification email re-sent. Please check your inbox.');
    } else {
      setError((res as any).sendError || 'Could not send verification email. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full space-y-6 rounded-3xl border border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">Enter the 6-digit code sent to your email.</p>
        </div>

        {error && (
          <div className="relative rounded-lg border border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-3 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="relative rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 p-3 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={onVerify} className="space-y-4 relative">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="6-digit code"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onResend}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Resend code
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
