import { useState, useCallback } from 'react';
import * as chatApi from '../services/chatApi';

export function useMessages() {
  const [messagesCache, setMessagesCache] = useState({});
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchThreadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    // Check in-memory cache first to avoid re-fetches
    if (messagesCache[conversationId]) {
      setMessages(messagesCache[conversationId]);
      return;
    }

    setLoadingMessages(true);
    try {
      const detail = await chatApi.fetchConversationDetail(conversationId);
      if (detail && Array.isArray(detail.messages)) {
        const formattedMsgs = detail.messages.map(m => ({
          ...m,
          status: 'completed'
        }));
        setMessages(formattedMsgs);
        setMessagesCache(prev => ({ ...prev, [conversationId]: formattedMsgs }));
      }
    } catch (err) {
      console.error('Failed to fetch conversation messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [messagesCache]);

  const updateThreadMessages = useCallback((conversationId, newMessages) => {
    setMessages(newMessages);
    if (conversationId) {
      setMessagesCache(prev => ({ ...prev, [conversationId]: newMessages }));
    }
  }, []);

  const clearMessagesCache = useCallback((conversationId = null) => {
    if (conversationId) {
      setMessagesCache(prev => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    } else {
      setMessagesCache({});
    }
  }, []);

  return {
    messages,
    loadingMessages,
    fetchThreadMessages,
    updateThreadMessages,
    clearMessagesCache,
    setMessages
  };
}
