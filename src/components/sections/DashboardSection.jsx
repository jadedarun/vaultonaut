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

export default function DashboardSection({ user, onNavigate }) {
  const { items, total } = useKnowledge();

  const totalWords = items.reduce((acc, cur) => acc + (cur.word_count || 0), 0);
  const totalFavs = items.filter(i => i.favorite).length;

  const stats = [
    { label: 'Total Knowledge Items', value: total || items.length, change: 'Authenticated Vault' },
    { label: 'Words Indexed', value: totalWords.toLocaleString(), change: 'Auto Word Count' },
    { label: 'Favorite Documents', value: totalFavs, change: 'Starred Items' },
    { label: 'Flashcards', value: '48', change: '85% mastery' },
    { label: 'Quizzes Taken', value: '12', change: '92% avg score' },
    { label: 'Storage Mode', value: 'PostgreSQL / SQLite', change: 'Active' }
  ];

  const quickActions = [
    { title: 'Knowledge Vault', desc: 'Create, search, filter and manage knowledge', icon: FileText, tabIndex: 1 },
    { title: 'Upload Center', desc: 'Add PDFs, Docs, URLs or YouTube transcripts', icon: Upload, tabIndex: 2 },
    { title: 'AI Workspace', desc: 'Ask questions with precise source citations', icon: Send, tabIndex: 3 },
    { title: 'Learning Studio', desc: 'Review flashcards & test quiz readiness', icon: GraduationCap, tabIndex: 4 }
  ];

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
        <span className="badge-tag">Milestone 4 &bull; Core Data Layer</span>
        <h1 className="hero-banner-title" style={{ marginTop: '0.6rem', marginBottom: '0.6rem' }}>
          Welcome back,{' '}
          <GradientText colors={['#ffffff', '#e4e4e7', '#a1a1aa', '#ffffff']} animationSpeed={5} showBorder={false}>
            {user?.displayName || user?.firstName || 'Vaultonaut'}
          </GradientText> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '1.05rem', lineHeight: '1.5', margin: '0 0 1.2rem 0' }}>
          Vaultonaut is your personal knowledge vault. Securely create, search, edit, tag, pin, and favorite your knowledge documents backed by PostgreSQL and JWT authentication.
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
            <Database size={20} className="logo-icon" /> Vault Knowledge Statistics
          </h2>
          <span className="badge-tag">JWT Protected</span>
        </div>

        <div className="stat-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-item" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                  justify: 'space-between',
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
              <FileText size={18} className="logo-icon" /> Recent Knowledge Items
            </h2>
            <button className="btn-white-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => onNavigate(1)}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
            {items.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No documents created yet.</p>
            ) : (
              items.slice(0, 4).map((f) => (
                <div 
                  key={f.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.7rem 0.9rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    fontSize: '0.85rem' 
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <FileText size={15} color="var(--color-arctic-4)" /> {f.title}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {f.category}
                  </span>
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
            {[
              { query: "How does RAG semantic chunking improve response accuracy?", time: "2h ago" },
              { query: "Summarize the key differences between PostgreSQL & ChromaDB", time: "4h ago" },
              { query: "Generate a 5-question quiz on FastAPI dependency injection", time: "1d ago" }
            ].map((c, i) => (
              <div 
                key={i}
                onClick={() => onNavigate(3)}
                style={{ 
                  padding: '0.7rem 0.9rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '0.5rem', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  cursor: 'pointer'
                }}
              >
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>"{c.query}"</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '0.3rem' }}>
                  {c.time} &bull; Grounded Answer
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
