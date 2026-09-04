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
      className={`gradient-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 24px',
        borderRadius: '24px',
        background: 'transparent',
        border: '2px solid transparent',
        backgroundImage: 'linear-gradient(#080c1d, #080c1d), linear-gradient(135deg, #7C3AED, #A855F7, #3B82F6, #FF9FFC)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: '0 0 25px rgba(124, 58, 237, 0.3)'
      }}
    >
      {showIcon && (
        <div
          className="gradient-logo-icon-wrapper"
          style={{
            background: 'transparent',
            border: '1.5px solid #A855F7',
            borderRadius: '14px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(168, 85, 247, 0.3)'
          }}
        >
          <HardDrive size={iconSize} color="#A855F7" strokeWidth={2} />
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
