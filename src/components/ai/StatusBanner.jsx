import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { Cpu, CheckCircle, AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

export default function StatusBanner() {
  const { connectionStatus, sending, isOnline } = useAIWorkspace();
  const topK = parseInt(localStorage.getItem('vaultonaut_top_k')) || 5;
  const threshold = parseFloat(localStorage.getItem('vaultonaut_similarity_threshold')) || 0.45;

  if (!isOnline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(239, 68, 68, 0.2)', borderBottom: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600 }}>
        <WifiOff size={14} />
        <span>You are currently offline. Prompts will be enabled when internet connection is restored.</span>
      </div>
    );
  }

  const getBadgeStyle = () => {
    switch (connectionStatus) {
      case 'AI Ready':
      case 'Connected':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle };
      case 'Thinking':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', icon: RefreshCw };
      case 'Error':
      case 'Offline':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)', icon: AlertTriangle };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#ccc', border: 'rgba(255, 255, 255, 0.15)', icon: Cpu };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 1rem', background: 'rgba(255, 255, 255, 0.015)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.3rem', 
            padding: '0.15rem 0.6rem', 
            borderRadius: '1rem', 
            background: style.bg, 
            color: style.text, 
            border: `1px solid ${style.border}`,
            fontWeight: 600
          }}
        >
          <Icon size={12} className={sending ? 'logo-icon' : ''} style={sending ? { animation: 'spin 1.5s linear infinite' } : {}} />
          {sending ? 'Thinking...' : connectionStatus}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>&bull; Google Gemini Grounded Model &bull; ChromaDB Store</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>Top-K: {topK}</span>
        <span>Threshold: {threshold.toFixed(2)}</span>
      </div>
    </div>
  );
}
