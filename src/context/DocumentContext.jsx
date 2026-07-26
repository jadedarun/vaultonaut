import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as documentAPI from '../api/documents';
import { useKnowledge } from './KnowledgeContext';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
  const { fetchKnowledge } = useKnowledge();
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_documents: 0,
    completed_count: 0,
    failed_count: 0,
    processing_count: 0,
    total_storage_bytes: 0,
    total_storage_mb: 0,
    file_types: {}
  });

  const [uploadQueue, setUploadQueue] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [extensionFilter, setExtensionFilter] = useState('');
  const [query, setQuery] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = await documentAPI.getDocumentStatistics();
      if (data) setStats(data);
    } catch (err) {
      console.warn('Failed to fetch document stats:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize };
      if (statusFilter) params.status = statusFilter;
      if (extensionFilter) params.extension = extensionFilter;
      if (query.trim()) params.query = query.trim();

      const data = await documentAPI.getDocumentsList(params);
      if (data && Array.isArray(data.items)) {
        setDocuments(data.items);
        setTotal(data.total || data.items.length);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.warn('Failed to fetch documents list:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, extensionFilter, query]);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  const uploadFile = async (file) => {
    const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = {
      id: taskId,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      progress: 25,
      stage: 'Uploading file...',
      status: 'uploading',
      error: null
    };

    setUploadQueue(prev => [newTask, ...prev]);

    try {
      setUploadQueue(prev => prev.map(t => t.id === taskId ? { ...t, progress: 50, stage: 'Extracting text & metadata...' } : t));
      
      const doc = await documentAPI.uploadDocument(file);

      setUploadQueue(prev => prev.map(t => t.id === taskId ? {
        ...t,
        progress: 100,
        stage: 'Completed & Indexed in Knowledge Vault',
        status: 'completed',
        docId: doc.id,
        knowledgeId: doc.knowledge_id
      } : t));

      setDocuments(prev => [doc, ...prev]);
      setTotal(prev => prev + 1);
      fetchStats();
      // Sync Knowledge Vault state automatically!
      fetchKnowledge();
      return doc;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Upload failed';
      setUploadQueue(prev => prev.map(t => t.id === taskId ? {
        ...t,
        progress: 100,
        stage: `Failed: ${errMsg}`,
        status: 'failed',
        error: errMsg
      } : t));
      throw new Error(errMsg);
    }
  };

  const uploadBatch = async (filesList) => {
    const filesArray = Array.from(filesList);
    const results = [];
    const errors = [];

    for (const file of filesArray) {
      try {
        const res = await uploadFile(file);
        results.push(res);
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }
    return { results, errors };
  };

  const removeDocument = async (id) => {
    try {
      await documentAPI.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      fetchStats();
    } catch (err) {
      console.warn('Failed to delete document:', err);
    }
  };

  const downloadFile = async (id, filename) => {
    try {
      await documentAPI.downloadDocument(id, filename);
    } catch (err) {
      console.warn('Failed to download document:', err);
    }
  };

  const cancelTask = (taskId) => {
    setUploadQueue(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      total,
      page,
      pageSize,
      totalPages,
      loading,
      error,
      stats,
      uploadQueue,
      statusFilter,
      setStatusFilter,
      extensionFilter,
      setExtensionFilter,
      query,
      setQuery,
      setPage,
      fetchDocuments,
      fetchStats,
      uploadFile,
      uploadBatch,
      removeDocument,
      downloadFile,
      cancelTask
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return ctx;
};
