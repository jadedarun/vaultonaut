import GradientText from '../GradientText';
import { HardDrive } from 'lucide-react';

export default function GradientLogo({
  iconSize = 36,
  textSize = 'text-4xl',
  showIcon = true,
  className = '',
  colors = ['#6D28D9', '#7C3AED', '#A855F7', '#3B82F6']
}) {
  return (
    <div
      className={`gradient-logo-container flex items-center justify-center gap-3 ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}
    >
      {showIcon && (
        <div
          className="gradient-logo-icon-wrapper flex items-center justify-center p-2 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.1), rgba(124, 58, 237, 0.05))',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: '16px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.12)'
          }}
        >
          <HardDrive size={iconSize} color="#7C3AED" strokeWidth={2} />
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
        <GradientText colors={colors} animationSpeed={6} showBorder={false}>
          Vaultonaut
        </GradientText>
      </span>
    </div>
  );
}
