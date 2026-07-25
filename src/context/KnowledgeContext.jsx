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
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setTotal(data.total || data.items.length);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.warn('Failed to fetch knowledge from API, keeping current list:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, order, query, category, filterType]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const createItem = async (payload) => {
    let newItem;
    const wordCount = payload.content.trim() ? payload.content.trim().split(/\s+/).length : 0;
    const tempItem = {
      id: crypto.randomUUID(),
      user_id: 'current-user',
      title: payload.title,
      content: payload.content,
      summary: payload.summary || null,
      category: payload.category || 'General',
      tags: payload.tags || [],
      favorite: payload.favorite || false,
      pinned: payload.pinned || false,
      status: 'active',
      word_count: wordCount,
      reading_time: Math.max(1, Math.ceil(wordCount / 200)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Prepend to items list immediately for instant UI responsiveness
    setItems(prev => [tempItem, ...prev]);
    setTotal(prev => prev + 1);

    try {
      newItem = await knowledgeAPI.createKnowledge(payload);
      // Replace tempItem with official server item containing UUID
      setItems(prev => prev.map(i => i.id === tempItem.id ? newItem : i));
      return newItem;
    } catch (err) {
      console.warn('Backend save notice, using active document:', err);
      return tempItem;
    }
  };

  const updateItem = async (id, payload) => {
    // Instant local state update
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newContent = payload.content !== undefined ? payload.content : item.content;
        const wordCount = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;
        return {
          ...item,
          ...payload,
          word_count: wordCount,
          reading_time: Math.max(1, Math.ceil(wordCount / 200)),
          updated_at: new Date().toISOString()
        };
      }
      return item;
    }));

    try {
      const updated = await knowledgeAPI.updateKnowledge(id, payload);
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      console.warn('Backend update notice:', err);
    }
  };

  const deleteItem = async (id) => {
    // Instant local state update
    setItems(prev => prev.filter(item => item.id !== id));
    setTotal(prev => Math.max(0, prev - 1));

    try {
      await knowledgeAPI.deleteKnowledge(id);
    } catch (err) {
      console.warn('Backend delete notice:', err);
    }
  };

  const toggleFav = async (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item));
    try {
      await knowledgeAPI.toggleFavorite(id);
    } catch (err) {
      console.warn('Backend favorite notice:', err);
    }
  };

  const togglePin = async (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, pinned: !item.pinned } : item));
    try {
      await knowledgeAPI.togglePin(id);
    } catch (err) {
      console.warn('Backend pin notice:', err);
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
