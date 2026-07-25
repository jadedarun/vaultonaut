import API from './axios';

export const getKnowledgeList = async (params = {}) => {
  const response = await API.get('/api/knowledge', { params });
  return response.data;
};

export const getKnowledgeById = async (id) => {
  const response = await API.get(`/api/knowledge/${id}`);
  return response.data;
};

export const createKnowledge = async (data) => {
  const response = await API.post('/api/knowledge', data);
  return response.data;
};

export const updateKnowledge = async (id, data) => {
  const response = await API.put(`/api/knowledge/${id}`, data);
  return response.data;
};

export const deleteKnowledge = async (id) => {
  const response = await API.delete(`/api/knowledge/${id}`);
  return response.data;
};

export const toggleFavorite = async (id) => {
  const response = await API.patch(`/api/knowledge/${id}/favorite`);
  return response.data;
};

export const togglePin = async (id) => {
  const response = await API.patch(`/api/knowledge/${id}/pin`);
  return response.data;
};

export const toggleArchive = async (id) => {
  const response = await API.patch(`/api/knowledge/${id}/archive`);
  return response.data;
};
