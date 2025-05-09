import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API } from '../../app.json';
import { DecodedUser, AuthContextType } from '../utils/AuthTypes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const refresh = await AsyncStorage.getItem('refreshToken');
        const userId = await AsyncStorage.getItem('userId');

        if (token && refresh) {
          const decoded = jwtDecode<DecodedUser>(token);
          if (decoded.exp * 1000 < Date.now()) {
            await refreshAccessToken(refresh);
          } else {
            setAccessToken(token);
            setUser(decoded);
          }
        }
      } catch (err) {
        console.error("Error during auth init:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      const { accessToken, refreshToken } = data;
      const userId = data.user.userId;
      if (!accessToken || !refreshToken) {
        throw new Error("Tokens not found in response.");
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('userId', userId);

      setAccessToken(accessToken);
      setUser(jwtDecode<DecodedUser>(accessToken));
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const res = await fetch(`${API}auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();

      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('userId', data.userId);

      setAccessToken(data.accessToken);
      setUser(jwtDecode<DecodedUser>(data.accessToken));
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userId');
    setAccessToken(null);
    setUser(null);
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = await AsyncStorage.getItem('accessToken');
    const refresh = await AsyncStorage.getItem('refreshToken');
    const userId = await AsyncStorage.getItem('userId');

    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401 && refresh) {
      await refreshAccessToken(refresh);
      const newToken = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');

      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return res;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authFetch, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
