import { useState, useCallback } from 'react';

export function useDrafts() {
  const [drafts, setDrafts] = useState({});

  const saveDraft = useCallback((conversationId, text) => {
    if (!conversationId) return;
    setDrafts(prev => ({
      ...prev,
      [conversationId]: text
    }));
  }, []);

  const getDraft = useCallback((conversationId) => {
    if (!conversationId) return '';
    return drafts[conversationId] || '';
  }, [drafts]);

  const clearDraft = useCallback((conversationId) => {
    if (!conversationId) return;
    setDrafts(prev => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
  }, []);

  return {
    saveDraft,
    getDraft,
    clearDraft
  };
}
