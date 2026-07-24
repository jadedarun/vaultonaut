import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ type = 'error', title, message, onRetry, onClose }) {
  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__icon">
        {type === 'error' ? (
          <AlertCircle size={20} color="#ef4444" />
        ) : (
          <CheckCircle2 size={20} color="#10b981" />
        )}
      </div>

      <div className="toast__content">
        {title && <div className="toast__title">{title}</div>}
        {message && <div className="toast__message">{message}</div>}
      </div>

      {onRetry && (
        <button type="button" className="toast__retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}

      {onClose && (
        <button type="button" className="toast__close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
