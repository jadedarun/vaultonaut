import API from './axios';

/**
 * Fetches user-scoped personal learning and knowledge analytics.
 * @param {string} timeRange - '7d' | '30d' | 'all'
 * @returns {Promise<Object>} AnalyticsOverviewResponse
 */
export const getAnalyticsOverview = async (timeRange = '30d') => {
  const response = await API.get('/api/analytics/overview', {
    params: { time_range: timeRange }
  });
  return response.data;
};
