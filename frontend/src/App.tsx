import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RootState } from './redux/store';
import { useAppSelector, useAppDispatch } from './redux/store';
import { loginSuccess } from './redux/authSlice';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Chats from './pages/Chats';
import Meetings from './pages/Meetings';
import Contacts from './pages/Contacts';
import Posts from './pages/Posts';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';

// Protected Route Component
type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(loginSuccess(user));
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/verify" element={
          <PublicRoute>
            <VerifyEmail />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="chats" element={<Chats />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="posts" element={<Posts />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
