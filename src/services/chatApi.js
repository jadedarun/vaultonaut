import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = tokenStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function sendMessage(chatPayload, options = {}) {
  const response = await axios.post(`${API_BASE_URL}/chat`, chatPayload, {
    headers: getAuthHeaders(),
    signal: options.signal
  });
  return response.data;
}

export async function fetchConversations() {
  const response = await axios.get(`${API_BASE_URL}/chat/history`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function fetchConversationDetail(conversationId) {
  const response = await axios.get(`${API_BASE_URL}/chat/${conversationId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function createConversation(title = 'New Conversation') {
  const response = await axios.post(
    `${API_BASE_URL}/chat/new`,
    { title },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function renameConversation(conversationId, newTitle) {
  const response = await axios.patch(
    `${API_BASE_URL}/chat/${conversationId}`,
    { title: newTitle },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function deleteConversation(conversationId) {
  const response = await axios.delete(`${API_BASE_URL}/chat/${conversationId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function fetchMessageSources(messageId) {
  const response = await axios.get(`${API_BASE_URL}/chat/sources/${messageId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function fetchDocumentMetadata(documentId) {
  const response = await axios.get(`${API_BASE_URL}/documents/${documentId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getAISettings() {
  return {
    provider: 'Google Gemini',
    model: 'gemini-1.5-flash',
    embedding_model: 'all-MiniLM-L6-v2',
    top_k: 5,
    similarity_threshold: 0.75,
    temperature: 0.2,
    max_tokens: 2048,
    context_window: 1048576,
    status: 'Connected'
  };
}

export async function getUsage() {
  return {
    total_conversations: 12,
    total_messages: 84,
    questions_today: 9,
    documents_indexed: 18,
    avg_response_time_ms: 650,
    most_used_category: 'Research',
    active_provider: 'Google Gemini'
  };
}

export async function getHealth() {
  const response = await axios.get('http://localhost:8000/health');
  return response.data;
}
