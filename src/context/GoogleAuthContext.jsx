import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleAuthContext = createContext(null);

export function GoogleAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle'); // idle | signing_in | authenticating | loading_workspace | authenticated | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  // Restore active session on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('vaultonaut_user_session');
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession);
        setUser(parsedUser);
        setAuthStatus('authenticated');
      }
    } catch (err) {
      console.error('Failed to parse saved user session:', err);
      localStorage.removeItem('vaultonaut_user_session');
    }
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const processGoogleProfile = useCallback(async (accessToken) => {
    try {
      setAuthStatus('authenticating');
      
      // Fetch user profile from Google OAuth API
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`Google API error status ${res.status}`);
      }

      const profile = await res.json();
      const now = new Date().toISOString();

      // Extract details
      const uid = profile.sub || 'google-user-' + Date.now();
      const email = profile.email || 'user@gmail.com';
      const displayName = profile.name || 'Google User';
      const firstName = profile.given_name || profile.name?.split(' ')[0] || 'Vaultonaut User';
      const lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '';
      const photoURL = profile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`;
      const emailVerified = profile.email_verified ?? true;

      // Database persistence simulation
      let usersDb = {};
      try {
        usersDb = JSON.parse(localStorage.getItem('vaultonaut_users_db') || '{}');
      } catch (e) {
        usersDb = {};
      }

      let userRecord = usersDb[email];
      if (userRecord) {
        // Returning User
        userRecord = {
          ...userRecord,
          displayName,
          photoURL,
          lastLogin: now,
          lastActive: now,
        };
      } else {
        // First Time User
        userRecord = {
          uid,
          firstName,
          lastName,
          displayName,
          email,
          photoURL,
          emailVerified,
          provider: 'Google',
          createdAt: now,
          lastLogin: now,
          lastActive: now,
        };
      }

      // Save user to DB & current session
      usersDb[email] = userRecord;
      localStorage.setItem('vaultonaut_users_db', JSON.stringify(usersDb));
      localStorage.setItem('vaultonaut_user_session', JSON.stringify(userRecord));

      setUser(userRecord);
      setAuthStatus('loading_workspace');
    } catch (err) {
      console.error('OAuth profile fetch error:', err);
      setAuthStatus('error');
      setErrorMessage('Failed to retrieve profile from Google. Please try again.');
      setToast({
        type: 'error',
        title: 'Authentication Error',
        message: 'Could not fetch Google account details.',
        onRetry: () => loginWithGoogle(),
      });
    }
  }, []);

  // Google OAuth Hook
  const googleLoginTrigger = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        processGoogleProfile(tokenResponse.access_token);
      } else {
        // Fallback for demo mode
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

  // Fallback / Demo Login Handler
  const processDemoLogin = useCallback((customName) => {
    setAuthStatus('authenticating');
    setTimeout(() => {
      const nameToUse = customName || 'Arun';
      const now = new Date().toISOString();
      const demoUser = {
        uid: 'google-uid-demo-12345',
        firstName: nameToUse,
        lastName: 'Developer',
        displayName: `${nameToUse} Developer`,
        email: `${nameToUse.toLowerCase()}@gmail.com`,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameToUse)}`,
        emailVerified: true,
        provider: 'Google',
        createdAt: now,
        lastLogin: now,
        lastActive: now,
      };

      localStorage.setItem('vaultonaut_user_session', JSON.stringify(demoUser));
      setUser(demoUser);
      setAuthStatus('loading_workspace');
    }, 600);
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

  const logout = useCallback(() => {
    localStorage.removeItem('vaultonaut_user_session');
    setUser(null);
    setAuthStatus('idle');
    setErrorMessage(null);
    setToast(null);
  }, []);

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        authStatus,
        setAuthStatus,
        errorMessage,
        toast,
        clearToast,
        loginWithGoogle,
        processDemoLogin,
        logout,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
}
