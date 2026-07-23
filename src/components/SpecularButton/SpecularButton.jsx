import { useState, useRef, useCallback } from 'react';
import './SpecularButton.css';

export default function SpecularButton({
  children,
  onClick,
  size = 'lg',
  radius = 18,
  followMouse = true,
  autoAnimate = false,
  shineSize = 10,
  speed = 0.35,
  lineColor = '#7C3AED',
  textColor = '#FFFFFF',
  baseColor = '#6D28D9',
  tintOpacity = 0,
  className = '',
  disabled = false,
  ...props
}) {
  const buttonRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (!followMouse || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [followMouse]
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 50, y: 50 });
  };

  const styleProps = {
    '--btn-radius': `${radius}px`,
    '--btn-base-color': baseColor,
    '--btn-line-color': lineColor,
    '--btn-text-color': textColor,
    '--btn-shine-x': `${mousePos.x}%`,
    '--btn-shine-y': `${mousePos.y}%`,
    '--btn-shine-size': `${shineSize}%`,
    '--btn-speed': `${speed}s`,
    '--btn-tint-opacity': tintOpacity,
    borderRadius: `${radius}px`,
  };

  return (
    <button
      ref={buttonRef}
      className={`specular-button specular-button--${size} ${isHovered ? 'is-hovered' : ''} ${
        autoAnimate ? 'auto-animate' : ''
      } ${className}`}
      style={styleProps}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      type="button"
      {...props}
    >
      <span className="specular-button__border-glow" />
      <span className="specular-button__shine" />
      <span className="specular-button__content">{children}</span>
    </button>
  );
}
