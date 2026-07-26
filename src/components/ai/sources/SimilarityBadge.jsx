export default function SimilarityBadge({ similarityScore = 0.0 }) {
  const matchPct = Math.min(Math.max((similarityScore * 100).toFixed(1), 0), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Semantic Match:</span>
        <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
          {matchPct}% Match
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${matchPct}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--color-arctic-1), #34d399)',
            transition: 'width 0.3s ease' 
          }} 
        />
      </div>
    </div>
  );
}
