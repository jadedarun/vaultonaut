import GradientText from '../GradientText';
import { HardDrive } from 'lucide-react';

export default function GradientLogo({
  iconSize = 36,
  textSize = 'text-4xl',
  showIcon = true,
  className = '',
  colors,
  theme = 'dark',
  variant = 'simple' // 'simple' or 'pill'
}) {
  const logoColors = colors || (theme === 'light' 
    ? ['#111827', '#374151', '#4b5563', '#111827'] 
    : ['#ffffff', '#e4e4e7', '#a1a1aa', '#ffffff']);

  const getFontSize = (size) => {
    switch (size) {
      case 'text-4xl': return '2.5rem';
      case 'text-3xl': return '2.0rem';
      case 'text-2xl': return '1.5rem';
      case 'text-xl': return '1.25rem';
      case 'text-lg': return '1.1rem';
      case 'text-sm': return '0.9rem';
      default: return '1.75rem';
    }
  };

  if (variant === 'simple') {
    return (
      <div
        className={`gradient-logo-container ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'transparent',
        }}
      >
        {showIcon && (
          <HardDrive size={iconSize} color="#A855F7" strokeWidth={2} />
        )}
        <span
          style={{
            fontFamily: "'Outfit', var(--font-sans, sans-serif)",
            fontWeight: 800,
            fontSize: getFontSize(textSize),
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}
        >
          <GradientText colors={logoColors} animationSpeed={5} showBorder={false}>
            Vaultonaut
          </GradientText>
        </span>
      </div>
    );
  }

  // variant === 'pill'
  return (
    <div
      className={`gradient-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: textSize === 'text-2xl' ? '10px' : '14px',
        padding: textSize === 'text-2xl' ? '6px 16px' : '10px 24px',
        borderRadius: '24px',
        background: 'transparent',
        border: '2px solid transparent',
        backgroundImage: 'linear-gradient(var(--sidebar-bg, #080c1d), var(--sidebar-bg, #080c1d)), linear-gradient(135deg, #7C3AED, #A855F7, #3B82F6, #FF9FFC)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: theme === 'light' 
          ? '0 0 15px rgba(124, 58, 237, 0.15)' 
          : '0 0 25px rgba(124, 58, 237, 0.3)'
      }}
    >
      {showIcon && (
        <div
          className="gradient-logo-icon-wrapper"
          style={{
            background: 'transparent',
            border: '1.5px solid #A855F7',
            borderRadius: '14px',
            padding: textSize === 'text-2xl' ? '6px' : '8px',
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
          fontSize: getFontSize(textSize),
          letterSpacing: '-0.03em',
          lineHeight: 1.1
        }}
      >
        <GradientText colors={logoColors} animationSpeed={5} showBorder={false}>
          Vaultonaut
        </GradientText>
      </span>
    </div>
  );
}
