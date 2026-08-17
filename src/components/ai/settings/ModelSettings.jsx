import { useState } from 'react';
import { Cpu } from 'lucide-react';

export default function ModelSettings({ settings }) {
  const [temp, setTemp] = useState(() => {
    return parseFloat(localStorage.getItem('vaultonaut_temperature')) || settings?.temperature || 0.2;
  });
  const [maxTokens, setMaxTokens] = useState(() => {
    return parseInt(localStorage.getItem('vaultonaut_max_tokens')) || settings?.max_tokens || 2048;
  });

  const handleTempChange = (val) => {
    setTemp(val);
    localStorage.setItem('vaultonaut_temperature', val.toString());
  };

  const handleMaxTokensChange = (val) => {
    setMaxTokens(val);
    localStorage.setItem('vaultonaut_max_tokens', val.toString());
  };

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Cpu size={18} color="var(--color-arctic-1)" />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>LLM Generation Parameters</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem' }}>
        {/* Temperature Slider */}
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--input-bg)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temperature</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>{temp.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.1"
            value={temp}
            onChange={(e) => handleTempChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-arctic-1)', cursor: 'pointer' }}
          />
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Lower values are more factual, higher are creative.</div>
        </div>

        {/* Max Tokens Slider */}
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'var(--input-bg)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Tokens</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>{maxTokens} Tokens</span>
          </div>
          <input
            type="range"
            min="256"
            max="4096"
            step="128"
            value={maxTokens}
            onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
          />
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Maximum response length threshold limit.</div>
        </div>
      </div>
    </div>
  );
}
