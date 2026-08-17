import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function HealthStatus({ health }) {
  const diagnostics = health?.diagnostics || {};
  const isPostgresHealthy = diagnostics.postgresql === 'healthy';
  const isChromaHealthy = diagnostics.chromadb === 'healthy';
  const isGeminiConfigured = diagnostics.gemini_api === 'configured';

  const services = [
    { 
      name: 'FastAPI Backend Core', 
      status: health?.status ? (health.status === 'healthy' ? 'Healthy' : 'Degraded') : 'Offline', 
      isHealthy: health?.status === 'healthy',
      detail: `Version ${health?.version || '1.0.0'}`
    },
    { 
      name: 'PostgreSQL Database', 
      status: isPostgresHealthy ? 'Healthy' : 'Unhealthy', 
      isHealthy: isPostgresHealthy,
      detail: isPostgresHealthy ? 'Connected' : diagnostics.postgresql || 'Connection error'
    },
    { 
      name: 'ChromaDB Vector Index', 
      status: isChromaHealthy ? 'Healthy' : 'Unhealthy', 
      isHealthy: isChromaHealthy,
      detail: isChromaHealthy ? 'Persistent Store Active' : diagnostics.chromadb || 'Index error'
    },
    { 
      name: 'Google Gemini API', 
      status: isGeminiConfigured ? 'Configured' : 'Missing Key', 
      isHealthy: isGeminiConfigured,
      detail: isGeminiConfigured ? 'API Key Active' : 'Provide GEMINI_API_KEY'
    }
  ];

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>System Health & Service Diagnostics</h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem' }}>
        {services.map((srv, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--input-bg)',
              border: `1px solid ${srv.isHealthy ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.2)'}`,
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-arctic-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{srv.name}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={srv.detail}>{srv.detail}</div>
            </div>

            <span 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '0.3rem', 
                background: srv.isHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                color: srv.isHealthy ? '#34d399' : '#f87171', 
                fontSize: '0.73rem', 
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              {srv.isHealthy ? <CheckCircle size={11} /> : <AlertTriangle size={11} />} 
              {srv.status}
            </span>
          </div>
        ))}
      </div>

      {/* Resource Utilization Metrics */}
      {health?.status && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>Memory Usage</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{diagnostics.memory_usage_percent || 0}%</span>
            </div>
            <div style={{ height: '5px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${diagnostics.memory_usage_percent || 0}%`, height: '100%', background: 'var(--color-arctic-1)' }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>Disk Space Used</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{diagnostics.disk_usage_percent || 0}%</span>
            </div>
            <div style={{ height: '5px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${diagnostics.disk_usage_percent || 0}%`, height: '100%', background: '#34d399' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
