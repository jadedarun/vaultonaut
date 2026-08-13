import { Terminal, Code, Eye, Sparkles } from 'lucide-react';

export default function DeveloperPanel({ developerMode, onToggle }) {
  const threshold = parseFloat(localStorage.getItem('vaultonaut_similarity_threshold')) || 0.45;
  const topK = parseInt(localStorage.getItem('vaultonaut_top_k')) || 5;

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} color="var(--color-arctic-1)" />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Developer Mode & Prompt Inspector</h4>
        </div>

        {/* Toggle Switch */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.82rem', color: '#fff' }}>
          <span>{developerMode ? 'Enabled' : 'Disabled'}</span>
          <input
            type="checkbox"
            checked={developerMode}
            onChange={onToggle}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-arctic-1)' }}
          />
        </label>
      </div>

      {developerMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.9rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div style={{ color: '#34d399', fontWeight: 600 }}>[Developer Telemetry Inspector Active]</div>
          <div>Embedding Model: all-MiniLM-L6-v2 (384-dimensional dense vectors)</div>
          <div>Vector Database: ChromaDB Persistent Store (storage/chroma_db)</div>
          <div>Similarity Threshold: {threshold.toFixed(2)} Cosine Similarity</div>
          <div>Top-K Vector Chunks Retrieved: {topK}</div>
          <div>System Prompt Guarding: Anti-Hallucination & Refusal Grounding Active</div>
        </div>
      ) : (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Enable Developer Mode to view raw vector IDs, cosine similarity metrics, latency breakdowns, and system prompt payloads during chat sessions.
        </div>
      )}

      {/* Prompt Inspector Placeholder */}
      <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Code size={14} color="var(--color-arctic-1)" />
        <span>Prompt Inspector Placeholder (View system prompt injection defenses & raw Gemini payloads)</span>
      </div>
    </div>
  );
}
