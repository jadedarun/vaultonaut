import { Cpu, CheckCircle, Sparkles } from 'lucide-react';

export default function ProviderCard({ settings }) {
  const provider = settings?.provider || 'Google Gemini';
  const model = settings?.model || 'gemini-3.5-flash';
  const status = settings?.status || 'Connected';

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 212, 255, 0.15)', border: '1px solid rgba(0, 212, 255, 0.3)', color: 'var(--color-arctic-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>{provider}</h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active AI Generation Engine</span>
          </div>
        </div>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.7rem', borderRadius: '1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.78rem', fontWeight: 600 }}>
          <CheckCircle size={13} /> {status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', padding: '0.8rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          <div>Model Name</div>
          <div style={{ color: 'var(--color-arctic-1)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{model}</div>
        </div>
        <div>
          <div>Context Window</div>
          <div style={{ color: 'var(--color-arctic-1)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1.0M Tokens</div>
        </div>
        <div>
          <div>Embedding Store</div>
          <div style={{ color: 'var(--color-arctic-1)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>ChromaDB (384d)</div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Sparkles size={12} color="var(--color-arctic-1)" />
        <span>Future Provider Architecture Placeholders: OpenAI, Claude, Ollama, Llama 3, Mistral</span>
      </div>
    </div>
  );
}
