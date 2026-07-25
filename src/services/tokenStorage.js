const TOKEN_KEY = 'vaultonaut_jwt';
const USER_KEY = 'vaultonaut_user_session';

export const tokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error reading token from storage:', e);
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Error setting token in storage:', e);
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error removing token from storage:', e);
    }
  },

  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading user from storage:', e);
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Error setting user in storage:', e);
    }
  },

  removeUser: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error removing user from storage:', e);
    }
  },

  clearSession: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing storage session:', e);
    }
  }
};
