import API from './axios';

export const executeSimilaritySearch = async (payload) => {
  const response = await API.post('/api/search/similarity', payload);
  return response.data;
};
