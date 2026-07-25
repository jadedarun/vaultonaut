import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  FileText, 
  Star, 
  Bookmark, 
  Clock, 
  Search, 
  FolderPlus, 
  FolderKanban, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Layers 
} from 'lucide-react';

export default function KnowledgeVaultSection({ files, collections, selectedCollection, setSelectedCollection, createCollection, newColName, setNewColName }) {
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All Collections' },
    { id: 'recent', label: 'Recently Viewed' },
    { id: 'pinned', label: 'Pinned Documents' },
    { id: 'favorites', label: 'Favorite Collections' }
  ];

  const filteredFiles = (files || []).filter(f => {
    if (selectedCollection && f.collection !== selectedCollection) return false;
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.type.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}
    >
      {/* Header & Collection Creator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Knowledge Collections</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filter your document search space by collection or search query</p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="url-input-group" style={{ margin: 0 }}>
            <input
              type="text"
              placeholder="Search files..."
              className="input-field"
              style={{ width: '180px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {createCollection && (
            <form onSubmit={createCollection} style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="New Collection"
                className="input-field"
                style={{ width: '160px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
              />
              <button type="submit" className="btn-white-solid" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                <FolderPlus size={15} /> Create
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {filterTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFilterTab(t.id)}
            className={filterTab === t.id ? 'btn-white-solid' : 'btn-white-outline'}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', borderRadius: '2rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Collections Grid */}
      <div className="collections-list">
        {(collections || ['CS-101', 'System Design', 'Personal Notes']).map(col => {
          const count = (files || []).filter(f => f.collection === col).length;
          const isSelected = selectedCollection === col;
          return (
            <div 
              key={col} 
              className={`glass-card collection-card ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedCollection(col)}
              style={{ textAlign: 'left', padding: '1.2rem', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <FolderKanban size={20} color={isSelected ? 'var(--color-arctic-1)' : 'var(--text-secondary)'} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-arctic-1)' }}>{col}</h3>
              </div>
              <div className="collection-meta">
                <span>{count} files</span>
                <span>{count * 8} vector chunks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Files Table */}
      <div className="glass-card documents-table-card">
        <div className="card-header-row">
          <h2 className="card-title">
            <FileText size={18} className="logo-icon" /> Files in Collection: {selectedCollection || 'All'}
          </h2>
          <span className="badge-tag">{filteredFiles.length} documents</span>
        </div>
        
        {filteredFiles.length === 0 ? (
          <div style={{ padding: '3rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No documents found matching this filter. Head over to Upload Center to ingest files.
          </div>
        ) : (
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Collection</th>
                <th>Type</th>
                <th>Size</th>
                <th>Indexed Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(f => (
                <tr key={f.id} className="doc-row">
                  <td>
                    <div className="doc-name">
                      <FileText size={16} color="var(--color-arctic-4)" />
                      {f.name}
                    </div>
                  </td>
                  <td><span className="badge-tag">{f.collection}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.type}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.size}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
