import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    const result = await signup({ name, email, password });
    if (result && (result as any).verificationRequired) {
      // Navigate to verify page with email query and send status
      const sent = (result as any).emailSent ? '1' : '0';
      const err = (result as any).sendError ? `&err=${encodeURIComponent((result as any).sendError)}` : '';
      navigate(`/verify?email=${encodeURIComponent(email)}&sent=${sent}${err}`);
      return;
    }
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full space-y-8 rounded-3xl border border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_60%)]" />
        <div className="relative">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Start building your workspace with FusionConnect.
          </p>
        </div>

        {error && (
          <div className="relative rounded-lg border border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form className="relative mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-white/60 dark:bg-gray-900/60 p-5 border border-white/10 shadow-sm">
            <div className="space-y-4">
              <div>
                <label htmlFor="full-name" className="sr-only">
                  Full name
                </label>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  placeholder="Full name"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  placeholder="Password"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none rounded-xl block w-full px-4 py-3 border ${
                    password && confirmPassword && password !== confirmPassword
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-white/20 dark:border-white/10'
                  } bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500`}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (password !== confirmPassword && confirmPassword.length > 0)}
              className={`relative w-full flex justify-center items-center px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-lg transition ${
                loading || (password !== confirmPassword && confirmPassword.length > 0) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
