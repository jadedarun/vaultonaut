import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  FileText,
  Star,
  Bookmark
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import KnowledgeCard from '../knowledge/KnowledgeCard';
import KnowledgeEditorModal from '../knowledge/KnowledgeEditorModal';
import KnowledgeDeleteDialog from '../knowledge/KnowledgeDeleteDialog';

function cleanTitle(title) {
  if (!title) return '';
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (title.startsWith('Flashcards -') && uuidRegex.test(title)) {
    return 'Flashcards';
  }
  if (title.startsWith('Quiz -') && uuidRegex.test(title)) {
    return 'Quiz';
  }
  return title;
}

export default function KnowledgeVaultSection() {
  const {
    items,
    total,
    page,
    totalPages,
    loading,
    error,
    query,
    setQuery,
    category,
    setCategory,
    sort,
    setSort,
    order,
    setOrder,
    filterType,
    setFilterType,
    setPage,
    createItem,
    updateItem,
    deleteItem,
    toggleFav,
    togglePin
  } = useKnowledge();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const categories = ['All', 'General', 'AI Engineering', 'System Design', 'Machine Learning', 'College Notes', 'Personal Notes'];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleSaveDocument = async (payload) => {
    if (editingItem) {
      await updateItem(editingItem.id, payload);
    } else {
      await createItem(payload);
      setCategory('All');
      setFilterType('all');
    }
  };

  const handleOpenDelete = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      await deleteItem(deletingItem.id);
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', textAlign: 'left' }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Knowledge Vault</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create, manage, and filter your structured knowledge documents ({total || items.length} items)
          </p>
        </div>

        <button className="btn-white-solid" onClick={handleOpenCreate}>
          <Plus size={16} /> Create Document
        </button>
      </div>

      {/* Toolbar: Search, Filter Tabs, Sort */}
      <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search title, content, or category..."
              className="input-field"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Category:</span>
            <select
              className="input-field"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '0.4rem' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Sort:</span>
            <select
              className="input-field"
              value={`${sort}-${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split('-');
                setSort(s);
                setOrder(o);
                setPage(1);
              }}
              style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '0.4rem' }}
            >
              <option value="created_at-desc" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Newest First</option>
              <option value="created_at-asc" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Oldest First</option>
              <option value="title-asc" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Title (A-Z)</option>
              <option value="updated_at-desc" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs (All, Favorites, Pinned) */}
        <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.8rem' }}>
          {[
            { id: 'all', label: 'All Documents', icon: null },
            { id: 'favorite', label: 'Favorites', icon: Star },
            { id: 'pinned', label: 'Pinned', icon: Bookmark }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setFilterType(t.id); setPage(1); }}
                className={filterType === t.id ? 'btn-white-solid' : 'btn-white-outline'}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {Icon && <Icon size={12} />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && items.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', height: '180px', opacity: 0.5, animation: 'pulse 1.5s infinite' }}>
              <div style={{ width: '40%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem' }} />
              <div style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.6rem' }} />
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginBottom: '0.4rem' }}>
            No Knowledge Documents Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {query || category !== 'All' || filterType !== 'all' 
              ? 'No documents match your active search or filter criteria.' 
              : 'Your knowledge vault is empty. Click below to create your first document.'}
          </p>
          <button className="btn-white-solid" style={{ margin: '0 auto' }} onClick={handleOpenCreate}>
            <Plus size={16} /> Create First Document
          </button>
        </div>
      )}

      {/* Knowledge Cards Grid */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {items.map(item => (
            <KnowledgeCard
              key={item.id}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleFav={toggleFav}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            className="btn-white-outline"
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages} ({total || items.length} items)
          </span>
          <button
            className="btn-white-outline"
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Editor Modal */}
      <KnowledgeEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveDocument}
        initialData={editingItem}
      />

      {/* Delete Confirmation Dialog */}
      <KnowledgeDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemTitle={cleanTitle(deletingItem?.title || '')}
      />
    </motion.div>
  );
}
