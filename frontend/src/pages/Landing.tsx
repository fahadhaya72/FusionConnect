import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '💬',
      title: 'Instant Chats',
      description: 'Collaborate in real-time with teams and channels. Share messages, files, and stay connected.',
    },
    {
      icon: '📅',
      title: 'Organized Meetings',
      description: 'Schedule and join video meetings with your team. Keep track of your calendar and agendas.',
    },
    {
      icon: '📝',
      title: 'Shared Content',
      description: 'Post updates, images, and videos that everyone can see. Never miss important announcements.',
    },
    {
      icon: '👥',
      title: 'Team Contacts',
      description: 'Manage your professional network. Connect with colleagues and expand your team.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 dark:bg-black/20 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white dark:text-gray-100">FusionConnect</h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <div className="bg-white/20 dark:bg-gray-700 rounded-lg">
                  <ThemeToggle />
                </div>
                
                <button
                  onClick={() => navigate('/login')}
                  className="text-white/90 hover:text-white dark:text-gray-200 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-600 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-semibold transition"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white dark:text-gray-100 tracking-tight">
              One Platform for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 dark:from-yellow-400 dark:to-pink-400">
                Team Collaboration
              </span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-white/90 dark:text-gray-200 max-w-3xl mx-auto">
              Connect, chat, meet, and collaborate—all in one place. 
              Designed to keep your team productive and engaged, wherever they are.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:scale-105"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 px-8 py-4 rounded-xl font-bold text-lg border border-white/30 dark:border-gray-600 transition"
              >
                Sign In to Account
              </button>
            </div>

            <div className="mt-12 text-white/80 dark:text-gray-300">
              <p>✅ No credit card required • ✅ Free forever for small teams • ✅ 14-day trial</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/10 backdrop-blur-md border-t border-white/20 dark:bg-black/20 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-gray-100">
                Everything Your Team Needs
              </h2>
              <p className="mt-4 text-xl text-white/80 dark:text-gray-300">
                All the collaboration tools you need in one unified platform
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur border border-white/20 dark:bg-gray-800/50 dark:border-gray-700 rounded-2xl p-6 hover:bg-white/30 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-gray-800 dark:to-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-gray-100">
              Ready to Transform Your Team's Collaboration?
            </h2>
            <p className="mt-4 text-xl text-white/90 dark:text-gray-300">
              Join thousands of teams already using FusionConnect
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-8 bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:scale-105"
            >
              Get Started Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/20 dark:bg-black/30 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center text-white/60 dark:text-gray-400">
              <p>&copy; 2024 FusionConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>
    </div>
  );
};

export default Landing;
