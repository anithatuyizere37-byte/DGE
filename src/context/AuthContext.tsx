import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export type UserRole = 'client' | 'owner';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: User | null }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; isLoading: boolean };

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isAuthenticated: !!action.token,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from AsyncStorage on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@dg_auth_token');
        const storedUser = await AsyncStorage.getItem('@dg_auth_user');

        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser);
          dispatch({ type: 'RESTORE_TOKEN', token: storedToken, user });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('@dg_auth_token', token);
      await AsyncStorage.setItem('@dg_auth_user', JSON.stringify(user));

      dispatch({ type: 'SIGN_IN', token, user });
      return true;
    } catch (err: any) {
      dispatch({
        type: 'SET_ERROR',
        error: err.message || 'Login failed. Please check your credentials.',
      });
      return false;
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, user } = response.data;

      await AsyncStorage.setItem('@dg_auth_token', token);
      await AsyncStorage.setItem('@dg_auth_user', JSON.stringify(user));

      dispatch({ type: 'SIGN_IN', token, user });
      return true;
    } catch (err: any) {
      dispatch({
        type: 'SET_ERROR',
        error: err.message || 'Registration failed. Email might already be taken.',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@dg_auth_token');
      await AsyncStorage.removeItem('@dg_auth_user');
      const { clearUserSpecificCache } = require('../api/queryClient');
      await clearUserSpecificCache();
    } catch (e) {
      console.warn('Error clearing auth storage', e);
    }
    dispatch({ type: 'SIGN_OUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const isOwner = state.user?.role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        isOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
