import './ThreeBodyLoader.css';

export default function ThreeBodyLoader({ size = 45, color = '#7C3AED', speed = '0.8s' }) {
  return (
    <div
      className="three-body"
      style={{
        '--uib-size': `${size}px`,
        '--uib-color': color,
        '--uib-speed': speed,
      }}
      role="status"
      aria-label="Loading..."
    >
      <div className="three-body__dot"></div>
      <div className="three-body__dot"></div>
      <div className="three-body__dot"></div>
    </div>
  );
}
