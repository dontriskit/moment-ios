import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import config from '../config';
import { clearAuthTokenCache } from '../api/trpc';

WebBrowser.maybeCompleteAuthSession();

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
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your actual Web Client ID
    // Add your web client ID for the redirect URI
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'ulepszenia',
      useProxy: true,
    }),
  });

  // Initialize auth state from secure storage
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      
      if (token && userData) {
        // Verify token is still valid
        try {
          const response = await fetch(`${config.apiUrl}/api/mobile/auth/session`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token is invalid, clear auth data
            await clearAuthData();
          }
        } catch (error) {
          console.error('Failed to verify session:', error);
          await clearAuthData();
        }
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
    try {
      const response = await fetch(`${config.apiUrl}/api/mobile/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid credentials');
      }

      const data = await response.json();
      await saveAuthData(data.token, data.refreshToken, data.user);
      clearAuthTokenCache();
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };
  
  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success' && response.params?.id_token) {
      handleGoogleSignIn(response.params);
    } else if (response?.type === 'error') {
      console.error('Google OAuth error:', response.error);
    }
  }, [response]);
  
  const handleGoogleSignIn = async (params: any) => {
    try {
      const { id_token, access_token } = params;
      
      // Decode the ID token to get user info
      const payload = JSON.parse(atob(id_token.split('.')[1]));
      
      // Send to our backend
      const response = await fetch(`${config.apiUrl}/api/mobile/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: id_token,
          accessToken: access_token,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to authenticate with Google');
      }

      const data = await response.json();
      await saveAuthData(data.token, data.refreshToken, data.user);
      clearAuthTokenCache();
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/mobile/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      await saveAuthData(data.token, data.refreshToken, data.user);
      clearAuthTokenCache();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await clearAuthData();
  };

  const refreshToken = async () => {
    try {
      const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!token) throw new Error('No refresh token');

      const response = await fetch(`${config.apiUrl}/api/mobile/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      await saveAuthData(data.token, data.refreshToken, data.user);
      clearAuthTokenCache();
    } catch (error) {
      await logout();
      throw error;
    }
  };
  
  const getAuthToken = async () => {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
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
        getAuthToken,
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