import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { clearAuthTokenCache } from '../api/trpc';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

// Demo users for testing
const DEMO_USERS = {
  'demo@example.com': {
    password: 'demo123',
    user: {
      id: 'demo-user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'USER' as const,
      onboardingCompleted: true,
    },
  },
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: 'admin-user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
      onboardingCompleted: true,
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (token: string, refreshToken: string, userData: User) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
    clearAuthTokenCache();
    setUser(userData);
  };

  const clearAuthData = async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
    clearAuthTokenCache();
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check demo users
    const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
    
    if (demoUser && demoUser.password === password) {
      // Generate fake tokens
      const token = `demo-token-${Date.now()}`;
      const refreshToken = `demo-refresh-${Date.now()}`;
      
      await saveAuthData(token, refreshToken, demoUser.user);
      return;
    }

    throw new Error('Invalid email or password. Try demo@example.com / demo123');
  };

  const loginWithGoogle = async () => {
    // Simulate Google login with demo account
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const googleDemoUser: User = {
      id: 'google-demo-user',
      email: 'google.user@example.com',
      name: 'Google Demo User',
      role: 'USER',
      onboardingCompleted: true,
    };
    
    const token = `google-token-${Date.now()}`;
    const refreshToken = `google-refresh-${Date.now()}`;
    
    await saveAuthData(token, refreshToken, googleDemoUser);
  };

  const register = async (email: string, password: string, name: string) => {
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'USER',
      onboardingCompleted: false,
    };
    
    const token = `new-token-${Date.now()}`;
    const refreshToken = `new-refresh-${Date.now()}`;
    
    await saveAuthData(token, refreshToken, newUser);
  };

  const logout = async () => {
    await clearAuthData();
  };

  const refreshToken = async () => {
    // Simulate token refresh
    const currentToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (!currentToken) throw new Error('No token to refresh');
    
    const newToken = `refreshed-token-${Date.now()}`;
    const newRefreshToken = `refreshed-refresh-${Date.now()}`;
    
    if (user) {
      await saveAuthData(newToken, newRefreshToken, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}