import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useChatStatus } from '../hooks/useChatStatus';
import { useConversation } from '../hooks/useConversation';
import { useMessages } from '../hooks/useMessages';
import { useToast } from '../hooks/useToast';
import { useDrafts } from '../hooks/useDrafts';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useStreaming } from '../hooks/useStreaming';
import * as chatApi from '../services/chatApi';
import ToastContainer from '../components/ai/ToastContainer';

export const AIWorkspaceContext = createContext(null);

export const useAIWorkspace = () => {
  const context = useContext(AIWorkspaceContext);
  if (!context) {
    throw new Error('useAIWorkspace must be used within an AIWorkspaceProvider');
  }
  return context;
};

export const AIWorkspaceProvider = ({ children }) => {
  const { isOnline, connectionStatus, setConnectionStatus } = useChatStatus();
  const { toasts, showToast, removeToast } = useToast();
  const { saveDraft, getDraft, clearDraft } = useDrafts();
  const { isStreaming, startStreaming, stopStreaming } = useStreaming();

  const searchInputRef = useRef(null);
  const promptInputRef = useRef(null);

  const {
    conversations,
    filteredConversations,
    activeConversationId,
    activeConversation,
    loadingConversations,
    searchFilter,
    setSearchFilter,
    error: conversationError,
    setActiveConversationId,
    fetchConversations,
    createNewThread,
    renameThread,
    deleteThread
  } = useConversation();

  const {
    messages,
    loadingMessages,
    fetchThreadMessages,
    updateThreadMessages
  } = useMessages();

  const [sending, setSending] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync messages when active thread changes
  useEffect(() => {
    if (activeConversationId) {
      fetchThreadMessages(activeConversationId);
    } else {
      updateThreadMessages(null, []);
    }
  }, [activeConversationId, fetchThreadMessages, updateThreadMessages]);

  const sendPrompt = useCallback(async (text) => {
    if (!text || !text.trim() || sending) return;

    const userQuery = text.trim();
    setLastUserPrompt(userQuery);
    setSending(true);
    setConnectionStatus('Thinking');

    // Register AbortController signal
    const signal = startStreaming();

    // Clear draft for current thread
    if (activeConversationId) {
      clearDraft(activeConversationId);
    }

    const tempUserMsg = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: userQuery,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    const currentMsgs = [...messages, tempUserMsg];
    updateThreadMessages(activeConversationId, currentMsgs);

    try {
      const topK = parseInt(localStorage.getItem('vaultonaut_top_k')) || 5;
      const threshold = parseFloat(localStorage.getItem('vaultonaut_similarity_threshold')) || 0.45;

      const response = await chatApi.sendMessage({
        query: userQuery,
        conversation_id: activeConversationId,
        top_k: topK,
        similarity_threshold: threshold
      }, { signal });

      if (response) {
        const resolvedConvId = response.conversation_id || activeConversationId;

        const assistantMsg = {
          id: response.message_id,
          role: 'assistant',
          content: response.content,
          status: 'completed',
          grounded: response.grounded,
          retrieval_metadata: {
            citations: response.citations,
            retrieved_count: response.retrieved_count,
            model_name: response.model_name,
            total_latency_ms: response.latency_ms?.total_latency_ms || 0
          },
          created_at: new Date().toISOString()
        };

        updateThreadMessages(resolvedConvId, [...currentMsgs, assistantMsg]);
        
        if (resolvedConvId !== activeConversationId) {
          setActiveConversationId(resolvedConvId);
        }

        setConnectionStatus('AI Ready');
        fetchConversations();
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        showToast('AI response generation stopped by user.', 'info');
        setConnectionStatus('AI Ready');
      } else {
        console.error('API execution failed:', err);
        const errMsg = err.response?.data?.message || err.message || 'Unable to generate response.';
        showToast(errMsg, 'error');

        const failedAssistantMsg = {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `Unable to generate response. ${errMsg}`,
          status: 'failed',
          grounded: false,
          retrieval_metadata: {},
          created_at: new Date().toISOString()
        };

        updateThreadMessages(activeConversationId, [...currentMsgs, failedAssistantMsg]);
        setConnectionStatus('Error');
      }
    } finally {
      setSending(false);
      stopStreaming();
    }
  }, [activeConversationId, messages, sending, setConnectionStatus, updateThreadMessages, setActiveConversationId, fetchConversations, startStreaming, stopStreaming, clearDraft, showToast]);

  const retryLastPrompt = useCallback(() => {
    if (lastUserPrompt) {
      const cleanedMsgs = messages.filter(m => m.status !== 'failed');
      updateThreadMessages(activeConversationId, cleanedMsgs);
      sendPrompt(lastUserPrompt);
      showToast('Regenerating response...', 'info');
    }
  }, [lastUserPrompt, messages, activeConversationId, updateThreadMessages, sendPrompt, showToast]);

  const handleRenameThread = useCallback(async (convId, newTitle) => {
    await renameThread(convId, newTitle);
    showToast('Conversation renamed.', 'success');
  }, [renameThread, showToast]);

  const handleDeleteThread = useCallback(async (convId) => {
    await deleteThread(convId);
    showToast('Conversation deleted.', 'info');
  }, [deleteThread, showToast]);

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onFocusPrompt: () => promptInputRef.current?.focus(),
    onForceSend: () => sendPrompt(lastUserPrompt),
    onEscape: () => {
      if (sending) stopStreaming();
    }
  });

  const selectConversation = useCallback((convId) => {
    setActiveConversationId(convId);
    setSelectedCitation(null);
    setSidebarOpen(false);
  }, [setActiveConversationId]);

  const createNewChat = useCallback(async () => {
    setSelectedCitation(null);
    const newConv = await createNewThread();
    updateThreadMessages(newConv.id, []);
    setConnectionStatus('AI Ready');
    showToast('New conversation started.', 'info');
  }, [createNewThread, updateThreadMessages, setConnectionStatus, showToast]);

  return (
    <AIWorkspaceContext.Provider
      value={{
        isOnline,
        connectionStatus,
        conversations,
        filteredConversations,
        activeConversationId,
        activeConversation,
        messages,
        loading: loadingConversations || loadingMessages,
        sending,
        searchFilter,
        setSearchFilter,
        error: conversationError,
        selectedCitation,
        sidebarOpen,
        toasts,
        searchInputRef,
        promptInputRef,
        showToast,
        removeToast,
        saveDraft,
        getDraft,
        stopStreaming,
        selectConversation,
        createNewChat,
        sendPrompt,
        retryLastPrompt,
        renameChat: handleRenameThread,
        deleteChat: handleDeleteThread,
        setSelectedCitation,
        setSidebarOpen,
        retryLoad: fetchConversations
      }}
    >
      {children}
      <ToastContainer />
    </AIWorkspaceContext.Provider>
  );
};
