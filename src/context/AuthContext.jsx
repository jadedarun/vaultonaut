import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { authApi } from '../api/auth';
import { tokenStorage } from '../services/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => tokenStorage.getToken());
  const [authStatus, setAuthStatus] = useState('idle'); // idle | signing_in | authenticating | loading_workspace | authenticated | error
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  const clearToast = useCallback(() => setToast(null), []);

  const formatUserData = (backendUser) => ({
    uid: backendUser.google_id || backendUser.id || 'user-' + Date.now(),
    id: backendUser.id,
    firstName: backendUser.first_name || 'Vaultonaut',
    lastName: backendUser.last_name || 'User',
    displayName: backendUser.full_name || backendUser.first_name || 'Vaultonaut User',
    email: backendUser.email,
    photoURL: backendUser.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.full_name || backendUser.first_name || 'U')}&background=1e293b&color=ffffff&bold=true&size=128`,
    emailVerified: backendUser.email_verified ?? true,
    provider: 'Google',
    createdAt: backendUser.created_at,
    lastLogin: backendUser.last_login,
  });

  // Restore active session on mount
  useEffect(() => {
    async function restoreSession() {
      setLoading(true);
      try {
        const savedToken = tokenStorage.getToken();
        if (savedToken) {
          try {
            const backendUser = await authApi.getCurrentUser();
            const formattedUser = formatUserData(backendUser);
            
            setUser(formattedUser);
            setToken(savedToken);
            tokenStorage.setUser(formattedUser);
            setAuthStatus('authenticated');
            setLoading(false);
            return;
          } catch (apiErr) {
            console.warn('JWT verification with backend failed, clearing session:', apiErr);
            tokenStorage.clearSession();
            setToken(null);
          }
        }

        const savedUser = tokenStorage.getUser();
        if (savedUser) {
          setUser(savedUser);
          setAuthStatus('authenticated');
        } else {
          setUser(null);
          setAuthStatus('idle');
        }
      } catch (err) {
        console.error('Failed restoring session:', err);
        tokenStorage.clearSession();
        setUser(null);
        setToken(null);
        setAuthStatus('idle');
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Process Google Login response with FastAPI backend
  const processGoogleProfile = useCallback(async (accessToken) => {
    setAuthStatus('authenticating');
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Send token to FastAPI backend
      const authResponse = await authApi.loginWithGoogle(accessToken);
      
      const jwtToken = authResponse.access_token;
      const backendUser = authResponse.user;
      const formattedUser = formatUserData(backendUser);

      // 2. Persist token and user in storage
      tokenStorage.setToken(jwtToken);
      tokenStorage.setUser(formattedUser);

      setToken(jwtToken);
      setUser(formattedUser);
      setAuthStatus('authenticated');
    } catch (err) {
      console.error('Backend Google OAuth authentication error:', err);
      
      const serverMsg = err.response?.data?.message || 'Authentication with backend failed. Please check backend server.';
      setAuthStatus('error');
      setErrorMessage(serverMsg);
      setToast({
        type: 'error',
        title: 'Authentication Failed',
        message: serverMsg,
        onRetry: () => loginWithGoogle(),
      });

      tokenStorage.clearSession();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth Hook
  const googleLoginTrigger = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        processGoogleProfile(tokenResponse.access_token);
      } else {
        processDemoLogin();
      }
    },
    onError: (errorResponse) => {
      console.warn('Google Login Popup Error:', errorResponse);
      setAuthStatus('error');
      let msg = 'Google Sign-In failed or popup was closed.';
      if (errorResponse?.error === 'popup_closed_by_user') {
        msg = 'Sign-in cancelled. Popup closed by user.';
      }
      setErrorMessage(msg);
      setToast({
        type: 'error',
        title: 'Sign-In Cancelled',
        message: msg,
        onRetry: () => loginWithGoogle(),
      });
    },
    flow: 'implicit',
  });

  // Fallback / Demo Login Handler for offline dev
  const processDemoLogin = useCallback(async () => {
    setAuthStatus('authenticating');
    setLoading(true);
    setErrorMessage(null);
    try {
      const authResponse = await authApi.loginWithDemo();
      const jwtToken = authResponse.access_token;
      const backendUser = authResponse.user;
      const formattedUser = formatUserData(backendUser);

      // Persist token and user in storage
      tokenStorage.setToken(jwtToken);
      tokenStorage.setUser(formattedUser);

      setToken(jwtToken);
      setUser(formattedUser);
      setAuthStatus('authenticated');
    } catch (err) {
      console.error('Offline/Demo login failed on backend:', err);
      const serverMsg = err.response?.data?.detail || err.response?.data?.message || 'Demo authentication failed. Please check backend server.';
      setAuthStatus('error');
      setErrorMessage(serverMsg);
      setToast({
        type: 'error',
        title: 'Demo Sign-In Failed',
        message: serverMsg,
        onRetry: () => processDemoLogin(),
      });
      tokenStorage.clearSession();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    setErrorMessage(null);
    setToast(null);
    setAuthStatus('signing_in');
    
    try {
      googleLoginTrigger();
    } catch (e) {
      console.warn('Google OAuth trigger fallback:', e);
      processDemoLogin();
    }
  }, [googleLoginTrigger, processDemoLogin]);

  const refreshUser = useCallback(async () => {
    try {
      const backendUser = await authApi.refreshUser();
      const formattedUser = formatUserData(backendUser);
      setUser(formattedUser);
      tokenStorage.setUser(formattedUser);
      return formattedUser;
    } catch (err) {
      console.error('Failed refreshing user profile:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Backend logout call notice:', e);
    } finally {
      tokenStorage.clearSession();
      setUser(null);
      setToken(null);
      setAuthStatus('idle');
      setErrorMessage(null);
      setToast(null);
    }
  }, []);

  const isAuthenticated = Boolean(user && (token || authStatus === 'authenticated'));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        authStatus,
        setAuthStatus,
        errorMessage,
        toast,
        clearToast,
        loginWithGoogle,
        processDemoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Backwards compatibility alias
export const useGoogleAuth = useAuth;
