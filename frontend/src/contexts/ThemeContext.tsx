import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme | null) || 'system';
    setTheme(savedTheme);
  }, []);

  // Compute resolved theme and apply class
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const calcResolved = (): 'light' | 'dark' =>
      theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;

    const apply = () => {
      const rt = calcResolved();
      setResolvedTheme(rt);
      if (rt === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    apply();

    // When following system, listen to changes
    if (theme === 'system') {
      const listener = () => apply();
      mq.addEventListener ? mq.addEventListener('change', listener) : mq.addListener(listener);
      return () => {
        mq.removeEventListener ? mq.removeEventListener('change', listener) : mq.removeListener(listener as any);
      };
    }

    // Persist chosen mode
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
