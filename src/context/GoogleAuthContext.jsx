import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleAuthContext = createContext(null);

export function GoogleAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle'); // idle | signing_in | authenticating | loading_workspace | authenticated | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  // Restore active session on mount & verify JWT with backend
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedJwt = localStorage.getItem('vaultonaut_jwt');
        if (savedJwt) {
          try {
            const res = await fetch('http://localhost:8000/users/me', {
              headers: { Authorization: `Bearer ${savedJwt}` },
            });
            if (res.ok) {
              const backendUser = await res.json();
              const mappedUser = {
                uid: backendUser.google_id || backendUser.id,
                firstName: backendUser.first_name || 'User',
                lastName: backendUser.last_name || '',
                displayName: backendUser.full_name || backendUser.first_name || 'Vaultonaut User',
                email: backendUser.email,
                photoURL: backendUser.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.email)}`,
                emailVerified: backendUser.email_verified,
                provider: 'Google',
                createdAt: backendUser.created_at,
                lastLogin: backendUser.last_login,
              };
              setUser(mappedUser);
              setAuthStatus('authenticated');
              return;
            }
          } catch (e) {
            console.warn('Backend API /users/me check failed. Falling back to cached local session:', e);
          }
        }

        const savedSession = localStorage.getItem('vaultonaut_user_session');
        if (savedSession) {
          const parsedUser = JSON.parse(savedSession);
          setUser(parsedUser);
          setAuthStatus('authenticated');
        }
      } catch (err) {
        console.error('Failed to parse saved user session:', err);
        localStorage.removeItem('vaultonaut_user_session');
        localStorage.removeItem('vaultonaut_jwt');
      }
    }
    restoreSession();
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const processGoogleProfile = useCallback(async (accessToken) => {
    try {
      setAuthStatus('authenticating');
      
      // First attempt: Connect to FastAPI backend
      try {
        const backendRes = await fetch('http://localhost:8000/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        });

        if (backendRes.ok) {
          const authData = await backendRes.json();
          const backendUser = authData.user;
          const jwtToken = authData.access_token;

          const userRecord = {
            uid: backendUser.google_id || backendUser.id,
            firstName: backendUser.first_name || 'User',
            lastName: backendUser.last_name || '',
            displayName: backendUser.full_name || backendUser.first_name || 'Vaultonaut User',
            email: backendUser.email,
            photoURL: backendUser.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.email)}`,
            emailVerified: backendUser.email_verified,
            provider: 'Google',
            createdAt: backendUser.created_at,
            lastLogin: backendUser.last_login,
          };

          localStorage.setItem('vaultonaut_jwt', jwtToken);
          localStorage.setItem('vaultonaut_user_session', JSON.stringify(userRecord));

          setUser(userRecord);
          setAuthStatus('loading_workspace');
          return;
        }
      } catch (backendErr) {
        console.warn('FastAPI backend connection warning, proceeding with client-side fallback:', backendErr);
      }

      // Client-side fallback if backend is offline
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`Google API error status ${res.status}`);
      }

      const profile = await res.json();
      const now = new Date().toISOString();

      const uid = profile.sub || 'google-user-' + Date.now();
      const email = profile.email || 'user@gmail.com';
      const displayName = profile.name || 'Google User';
      const firstName = profile.given_name || profile.name?.split(' ')[0] || 'Vaultonaut User';
      const lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '';
      const photoURL = profile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`;
      const emailVerified = profile.email_verified ?? true;

      const userRecord = {
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

  const logout = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Backend logout request notice:', e);
    }
    localStorage.removeItem('vaultonaut_user_session');
    localStorage.removeItem('vaultonaut_jwt');
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
