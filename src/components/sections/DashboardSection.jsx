import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Upload, 
  Send, 
  FileText, 
  Folder, 
  Layers, 
  GraduationCap, 
  HardDrive, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Zap, 
  Database,
  ChevronRight
} from 'lucide-react';
import GradientText from '../GradientText';
import { useKnowledge } from '../../context/KnowledgeContext';
import { useDocuments } from '../../context/DocumentContext';
import * as chatApi from '../../services/chatApi';

export default function DashboardSection({ user, onNavigate }) {
  const { items } = useKnowledge();
  const { documents, stats: docStats } = useDocuments();
  const [recentConversations, setRecentConversations] = useState([]);

  useEffect(() => {
    async function loadRecent() {
      try {
        const history = await chatApi.fetchConversations();
        if (Array.isArray(history)) {
          setRecentConversations(history.slice(0, 4));
        }
      } catch (err) {
        console.warn('Failed to load recent conversations:', err);
      }
    }
    loadRecent();
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  const stats = [
    { label: 'Documents', value: `${docStats.total_documents || documents.length} Files`, change: 'Your knowledge library' },
    { label: 'Ready to Use', value: `${docStats.ai_ready_count || docStats.completed_count || 0} Ready`, change: 'Available for AI questions' },
    { label: 'Storage', value: `${docStats.total_storage_mb || 0} MB`, change: 'Documents stored' },
    { label: 'Conversations', value: `${docStats.total_conversations || 0} Threads`, change: 'AI study sessions' },
    { label: 'Study Cards', value: `${docStats.total_flashcards || 0} Cards`, change: 'Ready for review' }
  ];

  const quickActions = [
    { title: 'Knowledge Vault', desc: 'Browse and manage your saved knowledge', icon: FileText, tabIndex: 1 },
    { title: 'Upload Center', desc: 'Upload PDFs and other learning materials', icon: Upload, tabIndex: 2 },
    { title: 'AI Workspace', desc: 'Ask questions and get answers from your documents', icon: Send, tabIndex: 3 },
    { title: 'Learning Studio', desc: 'Turn your knowledge into flashcards, quizzes and study material', icon: GraduationCap, tabIndex: 4 }
  ];

  const handleConversationClick = (convId) => {
    localStorage.setItem('active_conversation_id', convId);
    onNavigate(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}
    >
      {/* Hero Welcome Banner Card */}
      <div className="glass-card hero-banner">
        <span className="badge-tag">Vaultonaut &bull; AI Study Assistant</span>
        <h1 className="hero-banner-title" style={{ marginTop: '0.6rem', marginBottom: '0.6rem' }}>
          Welcome back,{' '}
          <GradientText colors={['#ffffff', '#e4e4e7', '#a1a1aa', '#ffffff']} animationSpeed={5} showBorder={false}>
            {user?.displayName || user?.firstName || 'Vaultonaut'}
          </GradientText>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '1.05rem', lineHeight: '1.5', margin: '0 0 1.2rem 0' }}>
          Vaultonaut is your personal AI-powered study assistant. Securely upload learning materials, ask questions with precise source citations, and convert documents into interactive flashcards and quizzes.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn-action" onClick={() => onNavigate(1)}>
            <FileText size={16} /> Open Knowledge Vault
          </button>
          <button className="btn-white-outline" onClick={() => onNavigate(3)}>
            <Send size={16} /> Ask AI Assistant
          </button>
          <button className="btn-white-outline" onClick={() => onNavigate(4)}>
            <GraduationCap size={16} /> Learning Studio
          </button>
        </div>
      </div>

      {/* Knowledge Statistics Grid */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1.2rem' }}>
          <h2 className="card-title">
            <Database size={20} className="logo-icon" /> Workspace Overview
          </h2>
          <span className="badge-tag">AI Powered</span>
        </div>

        <div className="stat-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-item" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-arctic-1)' }}>{stat.value}</div>
              <div className="stat-lbl" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{stat.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{stat.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} className="logo-icon" /> Quick Workspace Actions
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                className="glass-card"
                onClick={() => onNavigate(action.tabIndex)}
                style={{
                  padding: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '130px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <Icon size={20} color="var(--color-arctic-1)" />
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginBottom: '0.3rem' }}>{action.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Column: Recent Ingests & AI Chats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Knowledge Items Card */}
        <div className="glass-card">
          <div className="card-header-row">
            <h2 className="card-title">
              <FileText size={18} className="logo-icon" /> Recent Documents
            </h2>
            <button className="btn-white-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => onNavigate(1)}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
            {documents.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No documents uploaded yet.</p>
            ) : (
              documents.slice(0, 4).map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => onNavigate(1)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.7rem 0.9rem', 
                    background: 'var(--input-bg)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      <FileText size={15} color="var(--color-arctic-4)" /> {doc.original_filename}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.file_extension.replace('.', '').toUpperCase()} &bull; {formatFileSize(doc.file_size)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: doc.status === 'completed' ? '#10b981' : '#f59e0b',
                      fontWeight: 600
                    }}>
                      {doc.status === 'completed' ? 'AI Ready' : 'Processing'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatRelativeTime(doc.uploaded_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent AI Conversations Preview Card */}
        <div className="glass-card">
          <div className="card-header-row">
            <h2 className="card-title">
              <MessageSquare size={18} className="logo-icon" /> Recent AI Conversations
            </h2>
            <button className="btn-white-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => onNavigate(3)}>
              Open Chat
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
            {recentConversations.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No conversations started yet.</p>
            ) : (
              recentConversations.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => handleConversationClick(c.id)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '0.7rem 0.9rem', 
                    background: 'var(--input-bg)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    cursor: 'pointer'
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>"{c.title || 'Untitled Conversation'}"</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '0.3rem' }}>
                    {formatRelativeTime(c.updated_at)} &bull; Answered
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
