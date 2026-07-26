import { ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

export default function ConfidenceIndicator({ similarityScore = 0.0 }) {
  const getBadgeStyle = (score) => {
    if (score >= 0.80) {
      return { label: 'High Confidence', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', icon: ShieldCheck };
    } else if (score >= 0.75) {
      return { label: 'Medium Confidence', bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', icon: Sparkles };
    } else {
      return { label: 'Low Confidence', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', icon: AlertTriangle };
    }
  };

  const style = getBadgeStyle(similarityScore);
  const Icon = style.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '1rem',
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        fontSize: '0.72rem',
        fontWeight: 600
      }}
    >
      <Icon size={12} />
      {style.label}
    </span>
  );
}
