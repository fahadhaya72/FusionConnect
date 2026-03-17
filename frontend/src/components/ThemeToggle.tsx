import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const nextLabel = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      aria-label={`Theme: ${theme}. Resolved: ${resolvedTheme}. Switch to ${nextLabel}`}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
