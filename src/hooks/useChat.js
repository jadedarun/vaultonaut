import { useState, useCallback, useRef } from 'react';
import * as chatApi from '../services/chatApi';

export function useChat({ activeConversationId, messages, updateThreadMessages, setConnectionStatus, fetchConversations }) {
  const [sending, setSending] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  const sendPrompt = useCallback(async (text, overrideConvId = null) => {
    if (!text || !text.trim() || sending) return;

    const userQuery = text.trim();
    setLastUserPrompt(userQuery);
    setSending(true);
    setConnectionStatus('Thinking');

    const convId = overrideConvId || activeConversationId;

    // Optimistic user message with status 'sending' -> 'sent'
    const tempUserMsg = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: userQuery,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    const currentMsgs = [...messages, tempUserMsg];
    updateThreadMessages(convId, currentMsgs);

    try {
      const response = await chatApi.sendMessage({
        query: userQuery,
        conversation_id: convId,
        top_k: 5,
        similarity_threshold: 0.45
      });

      if (response) {
        const resolvedConvId = response.conversation_id || convId;

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

        const updatedTrajectory = [...messages, tempUserMsg, assistantMsg];
        updateThreadMessages(resolvedConvId, updatedTrajectory);
        setConnectionStatus('AI Ready');
        if (fetchConversations) fetchConversations();
      }
    } catch (err) {
      console.error('API execution failed:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unable to generate response. Please try again.';

      const failedAssistantMsg = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `Unable to generate response. ${errMsg}`,
        status: 'failed',
        grounded: false,
        retrieval_metadata: {},
        created_at: new Date().toISOString()
      };

      updateThreadMessages(convId, [...messages, tempUserMsg, failedAssistantMsg]);
      setConnectionStatus('Error');
    } finally {
      setSending(false);
    }
  }, [activeConversationId, messages, sending, setConnectionStatus, updateThreadMessages, fetchConversations]);

  const retryLastPrompt = useCallback(() => {
    if (lastUserPrompt) {
      // Remove failed message before retrying
      const cleanedMsgs = messages.filter(m => m.status !== 'failed');
      updateThreadMessages(activeConversationId, cleanedMsgs);
      sendPrompt(lastUserPrompt);
    }
  }, [lastUserPrompt, messages, activeConversationId, updateThreadMessages, sendPrompt]);

  return {
    sending,
    lastUserPrompt,
    sendPrompt,
    retryLastPrompt
  };
}
