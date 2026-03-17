import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer, { AuthState } from './authSlice';

// Define the root state type
export interface RootState {
  auth: AuthState;
}

// Build preloaded auth state from Local Storage
const loadPreloadedAuth = (): AuthState => {
  try {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('currentUser');
    if (token && userRaw) {
      const parsed = JSON.parse(userRaw);
      // Only keep safe fields
      const user = parsed && typeof parsed === 'object'
        ? { id: parsed.id, name: parsed.name, email: parsed.email, avatar: parsed.avatar }
        : null;
      if (user && user.id && user.email) {
        return { user, isAuthenticated: true, loading: false, error: null };
      }
    }
  } catch (e) {
    // Ignore and fall back to defaults
  }
  return { user: null, isAuthenticated: false, loading: false, error: null };
};

// Create the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: loadPreloadedAuth(),
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they contain non-serializable values
        ignoredActions: ['auth/loginSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

// Define types for TypeScript
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
