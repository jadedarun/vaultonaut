import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  Award, 
  Zap, 
  FileText, 
  MessageSquare 
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';

export default function AnalyticsSection() {
  const { stats } = useDocuments();

  const metrics = [
    { label: 'Documents Uploaded', value: `${stats?.total_documents || 0} Files`, desc: `${stats?.total_storage_mb || 0} MB total storage` },
    { label: 'Conversations Started', value: `${stats?.total_conversations || 0} Threads`, desc: 'AI Grounded sessions' },
    { label: 'Questions Asked', value: `${stats?.total_questions || 0}`, desc: 'Grounded prompts' },
    { label: 'Flashcards Generated', value: `${stats?.total_flashcards || 0}`, desc: `In ${stats?.total_flashcard_decks || 0} study decks` },
    { label: 'Quiz Questions', value: `${(stats?.total_quizzes || 0) * 4}`, desc: `In ${stats?.total_quizzes || 0} completed quizzes` },
    { label: 'Study Materials', value: `${stats?.total_study_materials || 0} Decks`, desc: 'Quiz & Flashcard guides' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}
    >
      {/* Metrics Counters */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1.2rem' }}>
          <h2 className="card-title"><BarChart2 size={20} className="logo-icon" /> Knowledge & Learning Analytics</h2>
          <span className="badge-tag">Real-Time Insights</span>
        </div>

        <div className="stat-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {metrics.map((m, i) => (
            <div key={i} className="stat-item" style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-arctic-1)' }}>{m.value}</div>
              <div className="stat-lbl" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Ingestion & Format Distribution</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.file_types && Object.keys(stats.file_types).length > 0 ? (
              Object.entries(stats.file_types).map(([ext, count], idx) => {
                const total = stats.total_documents || 1;
                const progress = Math.round((count / total) * 100);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{ext} Format Documents</span>
                      <span style={{ color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count} Files</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-arctic-1)' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No document data yet.</div>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Study Suite Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-arctic-1)', display: 'block' }}>{stats?.total_quizzes || 0}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quizzes Generated</span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-arctic-1)', display: 'block' }}>{stats?.total_flashcards || 0}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Flashcards Generated</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
