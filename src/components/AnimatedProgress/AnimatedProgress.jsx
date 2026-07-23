import './AnimatedProgress.css';

export default function AnimatedProgress({ progress = 0 }) {
  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="animated-progress">
      <div className="animated-progress__percentage font-mono">
        <span>{roundedProgress}</span>
        <span className="unit">%</span>
      </div>

      <div className="animated-progress__bar-container">
        <div
          className="animated-progress__bar-fill"
          style={{ width: `${roundedProgress}%` }}
        />
        <div
          className="animated-progress__glow"
          style={{ left: `${roundedProgress}%` }}
        />
      </div>
    </div>
  );
}
