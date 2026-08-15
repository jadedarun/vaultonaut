import API from './axios';

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await API.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5 mins timeout for ingestion
  });
  return response.data;
};

export const uploadMultipleDocuments = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });
  const response = await API.post('/api/documents/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 600000, // 10 mins timeout for batch ingestion
  });
  return response.data;
};

export const getDocumentsList = async (params = {}) => {
  const response = await API.get('/api/documents', { params });
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await API.get(`/api/documents/${id}`);
  return response.data;
};

export const getDocumentStatus = async (id) => {
  const response = await API.get(`/api/documents/${id}/status`);
  return response.data;
};

export const getDocumentStatistics = async () => {
  const response = await API.get('/api/documents/statistics');
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await API.delete(`/api/documents/${id}`);
  return response.data;
};

export const downloadDocument = async (id, filename) => {
  const response = await API.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'document');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getDocumentFlashcards = async (id) => {
  const response = await API.get(`/api/documents/${id}/flashcards`);
  return response.data;
};

export const generateDocumentFlashcards = async (id) => {
  const response = await API.post(`/api/documents/${id}/flashcards/generate`);
  return response.data;
};

export const getDocumentQuiz = async (id) => {
  const response = await API.get(`/api/documents/${id}/quiz`);
  return response.data;
};
