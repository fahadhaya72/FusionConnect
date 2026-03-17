import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Call backend password reset endpoint
      // const response = await api.post('/auth/forgot-password', { email });
      
      // For now, show success message
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full space-y-8 rounded-3xl border border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_60%)]" />
        
        <div className="relative">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {submitted 
              ? "Check your email for reset instructions" 
              : "Enter your email and we'll send you instructions to reset your password."}
          </p>
        </div>

        {!submitted ? (
          <>
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
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex justify-center items-center px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-lg transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="relative mt-6 space-y-6">
            <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-5 border border-green-200 dark:border-green-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">Email sent successfully!</p>
                  <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                    We've sent password reset instructions to <strong>{email}</strong>. Please check your inbox and follow the steps.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-lg transition"
            >
              Back to login
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
