import GradientText from '../GradientText';
import { HardDrive } from 'lucide-react';

export default function GradientLogo({
  iconSize = 36,
  textSize = 'text-4xl',
  showIcon = true,
  className = '',
  colors = ['#A6C8FF', '#7C3AED', '#FF9FFC', '#3B82F6', '#A855F7']
}) {
  return (
    <div
      className={`gradient-logo-container flex items-center justify-center gap-4 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 22px',
        borderRadius: '24px',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        boxShadow: '0 12px 32px -4px rgba(109, 40, 217, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      {showIcon && (
        <div
          className="gradient-logo-icon-wrapper"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(82, 39, 255, 0.2))',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
          }}
        >
          <HardDrive size={iconSize} color="#A855F7" strokeWidth={2.2} />
        </div>
      )}
      <span
        style={{
          fontFamily: "'Outfit', var(--font-sans, sans-serif)",
          fontWeight: 800,
          fontSize: textSize === 'text-4xl' ? '2.5rem' : textSize === 'text-3xl' ? '2rem' : '1.75rem',
          letterSpacing: '-0.03em',
          lineHeight: 1.1
        }}
      >
        <GradientText colors={colors} animationSpeed={5} showBorder={false}>
          Vaultonaut
        </GradientText>
      </span>
    </div>
  );
}
