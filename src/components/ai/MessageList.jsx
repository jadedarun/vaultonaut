import { useRef, useEffect, useState } from 'react';
import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import SystemMessage from './SystemMessage';
import TypingIndicator from './TypingIndicator';
import JumpToBottom from './JumpToBottom';
import MessageDivider from './MessageDivider';

export default function MessageList() {
  const { messages, sending } = useAIWorkspace();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUpward = scrollHeight - scrollTop - clientHeight > 150;
    setShowJumpToBottom(isUpward);
  };

  // Group messages chronologically for date dividers
  const renderMessagesWithDividers = () => {
    if (messages.length === 0) return null;

    const items = [];
    let currentGroup = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.created_at || Date.now());
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let groupLabel = 'Earlier';
      if (msgDate.toDateString() === today.toDateString()) {
        groupLabel = 'Today';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        groupLabel = 'Yesterday';
      }

      if (groupLabel !== currentGroup) {
        currentGroup = groupLabel;
        items.push(<MessageDivider key={`divider-${groupLabel}-${idx}`} label={groupLabel} />);
      }

      if (msg.role === 'user') {
        items.push(<UserMessage key={msg.id || idx} message={msg} />);
      } else if (msg.role === 'assistant') {
        items.push(<AssistantMessage key={msg.id || idx} message={msg} />);
      } else {
        items.push(<SystemMessage key={msg.id || idx} message={msg} />);
      }
    });

    return items;
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="chat-history" 
      aria-live="polite"
      aria-label="AI Workspace conversation message trajectory"
      style={{ 
        flex: 1, 
        padding: '1.2rem', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.2rem',
        position: 'relative'
      }}
    >
      {renderMessagesWithDividers()}

      {sending && <TypingIndicator />}

      <div ref={messagesEndRef} />

      <JumpToBottom visible={showJumpToBottom} onClick={() => scrollToBottom(true)} />
    </div>
  );
}
