import { Download, Sliders, ShieldCheck } from 'lucide-react';
import { useAIWorkspace } from '../../../context/AIWorkspaceContext';

export default function PreferenceSection() {
  const { showToast } = useAIWorkspace();

  const handleExport = (format) => {
    showToast(`Preparing conversation export in ${format} format...`, 'info');
  };

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Download size={18} color="var(--color-arctic-1)" />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Conversation Export & Data Privacy</h4>
      </div>

      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
        Export full conversation trajectories or clear cached AI workspace sessions.
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button className="btn-white-solid" onClick={() => handleExport('Markdown')} style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}>
          Export as Markdown (.md)
        </button>
        <button className="btn-white-outline" onClick={() => handleExport('JSON')} style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}>
          Export as JSON (.json)
        </button>
        <button className="btn-white-outline" onClick={() => handleExport('PDF')} style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}>
          Export as PDF (.pdf)
        </button>
      </div>

      <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.78rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={16} />
        <span>Privacy Notice: AI Workspace only processes your uploaded knowledge vault documents. No data is trained publicly.</span>
      </div>
    </div>
  );
}
