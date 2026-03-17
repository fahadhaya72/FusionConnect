import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { loginStart, loginSuccess, loginFailure, logout } from '../redux/authSlice';
import api from '../services/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData extends LoginCredentials {
  name: string;
}

const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      dispatch(loginStart());
      try {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.success) {
          const { user, token, refreshToken } = response.data.data;

          // Store tokens and user in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('currentUser', JSON.stringify(user));

          dispatch(loginSuccess(user));
          return { success: true };
        } else {
          dispatch(loginFailure(response.data.error || 'Login failed'));
          return { success: false, error: response.data.error };
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const signup = useCallback(
    async ({ name, email, password }: SignupData) => {
      dispatch(loginStart());
      try {
        const response = await api.post('/auth/register', { name, email, password });

        if (response.data.success) {
          dispatch(loginFailure('')); // Clear any previous errors
          return {
            success: true,
            verificationRequired: true,
            email,
            message: response.data.data.message
          } as const;
        } else {
          dispatch(loginFailure(response.data.error || 'Signup failed'));
          return { success: false, error: response.data.error };
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Signup failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout errors
    }

    // Clear tokens and user info
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');

    // Update the auth state
    dispatch(logout());
  }, [dispatch]);

  // Verify email with OTP and auto-login
  const verifyEmail = useCallback(async (email: string, code: string) => {
    try {
      const response = await api.post('/auth/verify', { email, code });

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;

        // Store tokens and user
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(user));

        dispatch(loginSuccess(user));
        return { success: true as const };
      } else {
        return { success: false as const, error: response.data.error };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Verification failed';
      return { success: false as const, error: errorMessage };
    }
  }, [dispatch]);

  // Resend verification code
  const resendVerification = useCallback(async (email: string) => {
    try {
      const response = await api.post('/auth/resend', { email });

      if (response.data.success) {
        return {
          success: true as const,
          email,
          message: response.data.message || 'Verification code sent successfully'
        };
      } else {
        return { success: false as const, error: response.data.error };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to resend verification code';
      return { success: false as const, error: errorMessage };
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    signOut,
    verifyEmail,
    resendVerification,
  };
};

export default useAuth;
