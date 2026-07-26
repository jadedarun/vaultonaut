import API from './axios';

export const sendChatMessage = async (payload) => {
  const response = await API.post('/api/chat', payload);
  return response.data;
};

export const createNewConversation = async () => {
  const response = await API.post('/api/chat/new');
  return response.data;
};

export const getConversationHistory = async () => {
  const response = await API.get('/api/chat/history');
  return response.data;
};

export const getConversationDetail = async (conversationId) => {
  const response = await API.get(`/api/chat/${conversationId}`);
  return response.data;
};

export const renameConversation = async (conversationId, title) => {
  const response = await API.patch(`/api/chat/${conversationId}`, { title });
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await API.delete(`/api/chat/${conversationId}`);
  return response.data;
};

export const getMessageSources = async (messageId) => {
  const response = await API.get(`/api/chat/sources/${messageId}`);
  return response.data;
};
