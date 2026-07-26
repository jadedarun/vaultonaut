export default function AnalyticsCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div
      style={{
        padding: '1.1rem',
        borderRadius: '0.65rem',
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ padding: '0.4rem', borderRadius: '0.4rem', background: 'rgba(0, 212, 255, 0.1)', color: 'var(--color-arctic-1)' }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>{subtitle}</span>
        {trend && (
          <span style={{ color: '#34d399', fontWeight: 600 }}>{trend}</span>
        )}
      </div>
    </div>
  );
}
