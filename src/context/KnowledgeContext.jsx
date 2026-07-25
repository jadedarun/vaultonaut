import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as knowledgeAPI from '../api/knowledge';

const KnowledgeContext = createContext(null);

export const KnowledgeProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all'); // all | favorite | pinned

  const fetchKnowledge = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        sort,
        order
      };

      if (query.trim()) params.query = query.trim();
      if (category && category !== 'All') params.category = category;
      if (filterType === 'favorite') params.favorite = true;
      if (filterType === 'pinned') params.pinned = true;

      const data = await knowledgeAPI.getKnowledgeList(params);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch knowledge:', err);
      setError(err.response?.data?.message || 'Failed to load knowledge items.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, order, query, category, filterType]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const createItem = async (payload) => {
    try {
      const newItem = await knowledgeAPI.createKnowledge(payload);
      await fetchKnowledge();
      return newItem;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create document.';
      throw new Error(msg);
    }
  };

  const updateItem = async (id, payload) => {
    try {
      const updated = await knowledgeAPI.updateKnowledge(id, payload);
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update document.';
      throw new Error(msg);
    }
  };

  const deleteItem = async (id) => {
    try {
      await knowledgeAPI.deleteKnowledge(id);
      setItems(prev => prev.filter(item => item.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete document.';
      throw new Error(msg);
    }
  };

  const toggleFav = async (id) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item));
      await knowledgeAPI.toggleFavorite(id);
    } catch (err) {
      await fetchKnowledge(); // Revert on failure
    }
  };

  const togglePin = async (id) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(item => item.id === id ? { ...item, pinned: !item.pinned } : item));
      await knowledgeAPI.togglePin(id);
    } catch (err) {
      await fetchKnowledge(); // Revert on failure
    }
  };

  return (
    <KnowledgeContext.Provider value={{
      items,
      total,
      page,
      pageSize,
      totalPages,
      loading,
      error,
      query,
      setQuery,
      category,
      setCategory,
      sort,
      setSort,
      order,
      setOrder,
      filterType,
      setFilterType,
      setPage,
      fetchKnowledge,
      createItem,
      updateItem,
      deleteItem,
      toggleFav,
      togglePin
    }}>
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return ctx;
};
