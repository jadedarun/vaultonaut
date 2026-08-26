import apiClient from './axios';

export const authApi = {
  /**
   * Authenticates Google OAuth token with FastAPI backend
   * @param {string} token - Google ID Token or Access Token
   */
  loginWithGoogle: async (token) => {
    const response = await apiClient.post('/auth/google', {
      access_token: token,
      credential: token,
    });
    return response.data;
  },

  /**
   * Authenticates developer bypass locally
   */
  loginWithDemo: async () => {
    const response = await apiClient.post('/auth/demo');
    return response.data;
  },

  /**
   * Fetches current authenticated user profile
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Refresh current user profile details
   */
  refreshUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Triggers logout endpoint on FastAPI backend
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.warn('Backend logout call notice:', error);
      return { success: true, message: 'Logged out locally' };
    }
  },

  /**
   * Request elevated developer authorization
   */
  authorizeDeveloper: async (password) => {
    const response = await apiClient.post('/auth/developer/authorize', {
      password
    });
    return response.data;
  },
};
