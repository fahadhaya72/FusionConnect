import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if ((result as any)?.verificationRequired) {
      navigate(`/verify?email=${encodeURIComponent(email)}`);
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
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Sign in to continue to FusionConnect.
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  placeholder="Password"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`relative w-full flex justify-center items-center px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-lg transition ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="relative space-y-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?
          </p>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="w-full flex justify-center items-center px-4 py-3 rounded-2xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500/50 hover:border-indigo-500 hover:bg-indigo-500/10 transition duration-200"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
