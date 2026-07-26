import SourceCard from './SourceCard';
import { Database } from 'lucide-react';

export default function SourceList({ citations = [] }) {
  if (!citations || citations.length === 0) {
    return (
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
        <Database size={13} />
        <span>No supporting documents available.</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Supporting Sources ({citations.length})
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.6rem' }}>
        {citations.map((cit, idx) => (
          <SourceCard key={idx} citation={cit} />
        ))}
      </div>
    </div>
  );
}
