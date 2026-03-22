import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, UserGroupIcon, PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const { isAuthenticated, signOut, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Chats', path: '/home/chats', icon: ChatBubbleLeftRightIcon },
    { name: 'Meetings', path: '/home/meetings', icon: VideoCameraIcon },
    { name: 'Contacts', path: '/home/contacts', icon: UserGroupIcon },
    { name: 'Posts', path: '/home/posts', icon: PhotoIcon },
    { name: 'Profile', path: '/home/profile', icon: UserCircleIcon },
  ];

  return (
    <nav className="flex flex-col h-full bg-white/60 dark:bg-gray-900/60 w-20 md:w-64 border-r border-white/10 backdrop-blur">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-16 px-4">
          <h1 className="text-xl font-bold text-indigo-600 hidden md:block">FusionConnect</h1>
          <div className="md:hidden text-indigo-600">FC</div>
        </div>
        
        <div className="px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path || 
                           (item.name === 'Home' && location.pathname === '/home') ||
                           (item.name !== 'Home' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl mx-2 transition ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-inner'
                    : 'text-gray-700 hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/10'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img
                className="h-9 w-9 rounded-full ring-2 ring-white/40"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`}
                alt={user?.name || 'User'}
              />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
              <button
                onClick={signOut}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl hover:from-indigo-600 hover:to-emerald-600 shadow-sm"
            >
              Sign in
            </Link>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 hover:underline dark:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
