import { useState, useCallback, useEffect } from 'react';
import * as chatApi from '../services/chatApi';

export function useConversation() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError(null);
    try {
      const history = await chatApi.fetchConversations();
      if (Array.isArray(history)) {
        setConversations(history);
        if (history.length > 0 && !activeConversationId) {
          setActiveConversationId(history[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to list conversations:', err);
      setError('Connection failed. Unable to load AI Workspace.');
    } finally {
      setLoadingConversations(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const createNewThread = useCallback(async () => {
    try {
      const newConv = await chatApi.createConversation();
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      return newConv;
    } catch (err) {
      console.error('Failed to create new conversation session:', err);
      throw err;
    }
  }, []);

  const renameThread = useCallback(async (convId, newTitle) => {
    const originalTitle = conversations.find(c => c.id === convId)?.title;
    
    // Optimistic update
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, title: newTitle, updated_at: new Date().toISOString() } : c
    ));

    try {
      const updated = await chatApi.renameConversation(convId, newTitle);
      setConversations(prev => prev.map(c => 
        c.id === convId ? { ...c, title: updated.title } : c
      ));
    } catch (err) {
      console.error('Rename failed, rolling back:', err);
      // Rollback on failure
      if (originalTitle) {
        setConversations(prev => prev.map(c => 
          c.id === convId ? { ...c, title: originalTitle } : c
        ));
      }
    }
  }, [conversations]);

  const deleteThread = useCallback(async (convId) => {
    try {
      await chatApi.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        const remaining = conversations.filter(c => c.id !== convId);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  }, [activeConversationId, conversations]);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return {
    conversations,
    filteredConversations,
    activeConversationId,
    activeConversation,
    loadingConversations,
    searchFilter,
    setSearchFilter,
    error,
    setActiveConversationId,
    fetchConversations,
    createNewThread,
    renameThread,
    deleteThread
  };
}
