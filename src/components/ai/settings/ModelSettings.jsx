import { Cpu, Thermometer, Maximize, Shield } from 'lucide-react';

export default function ModelSettings({ settings }) {
  const temp = settings?.temperature || 0.2;
  const maxTokens = settings?.max_tokens || 2048;

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Cpu size={18} color="var(--color-arctic-1)" />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>LLM Generation Parameters</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temperature</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{temp} (Factual / Precise)</div>
        </div>

        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Generation Tokens</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{maxTokens} Tokens</div>
        </div>
      </div>
    </div>
  );
}
