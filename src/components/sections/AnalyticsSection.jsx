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

export default function AnalyticsSection() {
  const metrics = [
    { label: 'Knowledge Growth', value: '+42%', desc: 'Indexed vector tokens' },
    { label: 'Documents Uploaded', value: '14', desc: '45.8 MB total storage' },
    { label: 'Questions Asked', value: '142', desc: '98.4% grounded accuracy' },
    { label: 'Study Time', value: '18.5 hrs', desc: 'This month' },
    { label: 'Quiz Accuracy', value: '92%', desc: 'Top percentile' },
    { label: 'Learning Streak', value: '14 Days', desc: 'Personal record' }
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
            <div key={i} className="stat-item" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.05)' }}>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Ingestion & Vector Indexing Growth</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { category: 'AI Engineering & System Design', progress: 85, count: '6 Docs' },
              { category: 'Machine Learning Fundamentals', progress: 65, count: '4 Docs' },
              { category: 'Deep Learning Research Papers', progress: 40, count: '3 Docs' },
              { category: 'Personal Revision Notes', progress: 90, count: '1 Doc' }
            ].map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{cat.category}</span>
                  <span style={{ color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cat.count}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.progress}%`, height: '100%', background: 'var(--color-arctic-1)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Study Suite Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-arctic-1)', display: 'block' }}>92%</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quiz Accuracy</span>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-arctic-1)', display: 'block' }}>48</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Flashcards Mastered</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
