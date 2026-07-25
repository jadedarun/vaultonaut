import { useState, useEffect } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';

export default function KnowledgeEditorModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setContent(initialData.content || '');
        setCategory(initialData.category || 'General');
        setTags(initialData.tags || []);
        setFavorite(initialData.favorite || false);
        setPinned(initialData.pinned || false);
      } else {
        setTitle('');
        setContent('');
        setCategory('General');
        setTags([]);
        setFavorite(false);
        setPinned(false);
      }
      setError('');
      setSubmitting(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || 'General',
        tags,
        favorite,
        pinned
      });
      setSubmitting(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save document.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '650px', width: '90%', padding: '2rem' }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-arctic-1)', marginBottom: '0.4rem' }}>
          <Sparkles size={20} className="logo-icon" />
          {initialData ? 'Edit Knowledge Document' : 'Create Knowledge Document'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Add structured text content to your personal knowledge repository.
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Document Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. System Design Microservices Guide"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                Category
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ background: 'rgba(10, 14, 23, 0.8)' }}
              >
                <option value="General">General</option>
                <option value="AI Engineering">AI Engineering</option>
                <option value="System Design">System Design</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="College Notes">College Notes</option>
                <option value="Personal Notes">Personal Notes</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                Add Tag
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="tag-name"
                  className="input-field"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(e); }}
                />
                <button type="button" className="btn-white-outline" onClick={handleAddTag} style={{ padding: '0.5rem' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {tags.map((t, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    padding: '0.2rem 0.6rem', 
                    background: 'rgba(255,255,255,0.06)', 
                    borderRadius: '0.3rem', 
                    fontSize: '0.75rem', 
                    fontFamily: 'var(--font-mono)', 
                    color: 'var(--color-arctic-3)' 
                  }}
                >
                  #{t}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(t)} />
                </span>
              ))}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Content *
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {wordCount} words &bull; {readingTime} min read
              </span>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Enter document content text here..."
              className="input-field"
              style={{ width: '100%', resize: 'vertical', lineHeight: '1.5' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                style={{ accentColor: '#ffffff' }}
              />
              Mark as Favorite ⭐
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                style={{ accentColor: '#ffffff' }}
              />
              Pin to Top 📌
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn-white-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-white-solid" disabled={submitting}>
              {submitting ? 'Saving...' : (initialData ? 'Update Document' : 'Save Document')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
