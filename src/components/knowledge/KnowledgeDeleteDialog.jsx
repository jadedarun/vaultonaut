import { AlertTriangle, X } from 'lucide-react';

export default function KnowledgeDeleteDialog({ isOpen, onClose, onConfirm, itemTitle }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '90%', padding: '1.8rem', textAlign: 'center' }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1rem auto' }}>
          <AlertTriangle size={24} color="#ef4444" />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-arctic-1)', marginBottom: '0.5rem' }}>
          Delete Knowledge Document?
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          Are you sure you want to permanently delete <strong style={{ color: 'var(--color-arctic-1)' }}>"{itemTitle}"</strong>? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
          <button className="btn-white-outline" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button 
            className="btn-white-solid" 
            onClick={onConfirm} 
            style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
