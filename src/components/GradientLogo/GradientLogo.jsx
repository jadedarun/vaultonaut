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
        padding: '8px 20px',
        background: 'transparent',
      }}
    >
      <img 
        src="/assets/vaultonaut-logo.png" 
        alt="Vaultonaut" 
        style={{ 
          height: textSize === 'text-4xl' ? '64px' : '48px', 
          width: 'auto', 
          objectFit: 'contain' 
        }} 
      />
    </div>
  );
}
