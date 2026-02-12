import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('wisnotech_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('wisnotech_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('wisnotech_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('wisnotech_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  

const loginWithGoogle = useGoogleLogin({
  flow: 'implicit', 
  onSuccess: async (tokenResponse) => {
    try {
      console.log("1. Google responded:", tokenResponse); 
      
      // Attempting to send the access token
      const res = await api.post('/auth/google', {
        token: tokenResponse.access_token 
      });

      console.log("2. Backend responded:", res);
      
      localStorage.setItem('wisnotech_token', res.data.token);
      setUser(res.data.user);
      window.location.href = '/dashboard';

    } catch (err) {
      // THIS WILL TELL US WHAT IS WRONG
      console.error("LOGIN ERROR:", err);
      alert("Login Error: " + (err.response?.data?.message || err.message));
    }
  },
  onError: () => {
    alert('Google Popup Failed to Open or Closed');
  }
});


  const processGoogleSession = async (sessionId) => {
    const res = await api.post('/auth/google-session', { session_id: sessionId });
    localStorage.setItem('wisnotech_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('wisnotech_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, processGoogleSession, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
