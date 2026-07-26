import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function ChunkNavigator({ currentIndex = 0, totalChunks = 1, onPrev, onNext }) {
  if (totalChunks <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.8rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.4rem', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.78rem' }}>
      <button
        onClick={onPrev}
        style={{ background: 'none', border: 'none', color: 'var(--color-arctic-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem' }}
        title="Previous retrieved chunk"
      >
        <ChevronLeft size={14} /> Previous Chunk
      </button>

      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        Chunk {currentIndex + 1} of {totalChunks}
      </span>

      <button
        onClick={onNext}
        style={{ background: 'none', border: 'none', color: 'var(--color-arctic-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem' }}
        title="Next retrieved chunk"
      >
        Next Chunk <ChevronRight size={14} />
      </button>
    </div>
  );
}
