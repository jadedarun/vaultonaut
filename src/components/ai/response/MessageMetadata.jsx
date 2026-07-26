import { Cpu, Clock, Layers } from 'lucide-react';

export default function MessageMetadata({ metadata = {} }) {
  const model = metadata.model_name || 'gemini-1.5-flash';
  const latency = metadata.total_latency_ms;
  const count = metadata.retrieved_count || 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.73rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Cpu size={11} color="var(--color-arctic-1)" /> {model}
      </span>
      {latency !== undefined && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={11} /> {latency}ms
        </span>
      )}
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Layers size={11} /> {count} vectors
      </span>
    </div>
  );
}
