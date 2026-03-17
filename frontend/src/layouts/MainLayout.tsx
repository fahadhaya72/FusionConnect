import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ThemeToggle from '../components/ThemeToggle';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (minimal) */}
        <header className="bg-white/60 dark:bg-gray-800/60 backdrop-blur shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-200">FC</span>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">Dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
