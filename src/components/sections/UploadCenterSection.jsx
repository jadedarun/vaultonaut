import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  X, 
  Trash2, 
  Download, 
  AlertTriangle,
  HardDrive,
  FileCheck,
  Cpu,
  Layers,
  Sparkles,
  Database,
  Zap,
  Check
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { useKnowledge } from '../../context/KnowledgeContext';

export default function UploadCenterSection() {
  const { 
    documents, 
    stats, 
    uploadQueue, 
    uploadBatch, 
    removeDocument, 
    downloadFile,
    cancelTask 
  } = useDocuments();

  const { fetchKnowledge } = useKnowledge();

  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFilesSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const allowedExts = ['.pdf', '.docx', '.txt', '.md'];
    const invalidFiles = [];
    const validFiles = [];

    Array.from(files).forEach(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        invalidFiles.push(f.name);
      } else if (f.size > 50 * 1024 * 1024) {
        showToast(`File '${f.name}' exceeds maximum allowed size of 50MB`, 'error');
      } else if (f.size === 0) {
        showToast(`File '${f.name}' is empty (0 bytes)`, 'error');
      } else {
        validFiles.push(f);
      }
    });

    if (invalidFiles.length > 0) {
      showToast(`Unsupported format for: ${invalidFiles.join(', ')}. Allowed: PDF, DOCX, TXT, MD.`, 'error');
    }

    if (validFiles.length > 0) {
      try {
        const { results, errors } = await uploadBatch(validFiles);
        if (results.length > 0) {
          showToast(`Successfully prepared ${results.length} document(s) for study!`, 'success');
          fetchKnowledge();
        }
        if (errors.length > 0) {
          showToast(`Upload warning: ${errors.join('; ')}`, 'error');
        }
      } catch (err) {
        showToast(err.message || 'Upload failed', 'error');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFormatBadgeColor = (ext) => {
    switch (ext?.toLowerCase()) {
      case '.pdf': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case '.docx': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case '.md': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case '.txt': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* Notification Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '0.9rem 1.2rem',
              borderRadius: '0.75rem',
              background: toastType === 'error' ? 'rgba(239, 68, 68, 0.2)' : toastType === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${toastType === 'error' ? 'rgba(239, 68, 68, 0.4)' : toastType === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
              color: toastType === 'error' ? '#fca5a5' : toastType === 'success' ? '#6ee7b7' : '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {toastType === 'error' ? <AlertTriangle size={18} /> : toastType === 'success' ? <CheckCircle size={18} /> : <Sparkles size={18} />}
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toastMessage}</span>
            </div>
            <button 
              onClick={() => setToastMessage(null)} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section: Dropzone & AI Stats Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Dropzone Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', position: 'relative' }}>
          <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              <Upload size={22} className="logo-icon" /> Upload Learning Materials
            </h2>
            <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.3rem 0.7rem', borderRadius: '1rem', fontSize: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              AI Study Ready
            </span>
          </div>

          <p className="card-desc" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Upload your documents (PDF, DOCX, TXT, MD) to prepare them for AI questions, study flashcards, and quizzes.
          </p>

          <div
            className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-arctic-1)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '0.85rem',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: isDragging ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255,255,255,0.01)',
              transition: 'all 0.25s ease',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className="dropzone-icon" style={{ color: 'var(--color-arctic-1)', marginBottom: '0.8rem' }} />
            <p style={{ fontWeight: '600', marginBottom: '0.4rem', color: 'var(--color-arctic-1)', fontSize: '1rem' }}>
              Drag & drop files to ingest & embed
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              or click anywhere to browse local device storage
            </p>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.docx,.txt,.md"
              style={{ display: 'none' }}
              onChange={(e) => handleFilesSelect(e.target.files)}
            />

            <button 
              className="btn-white-solid" 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{ padding: '0.65rem 1.4rem', fontWeight: 600, fontSize: '0.88rem', borderRadius: '0.5rem' }}
            >
              Browse Local Files
            </button>
          </div>

          {/* AI Pipeline Timeline Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Document Preparation:</span>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.06)', color: '#ccc' }}>Reading</span>
            <span>&rarr;</span>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.3rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Understanding</span>
            <span>&rarr;</span>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.3rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>AI Ready</span>
          </div>
        </div>

        {/* Study Library Statistics Overview */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={18} color="var(--color-arctic-1)" /> Study Library
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.65rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Documents:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {stats.total_documents || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Storage Used:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>
                {stats.total_storage_mb || 0} MB
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Ready:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>
                {stats.ai_ready_count || 0} Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Ingestion Pipeline Queue */}
      {uploadQueue.length > 0 && (
        <div className="glass-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={18} className="logo-icon" style={{ animation: 'spin 2s linear infinite' }} /> 
            Live AI Processing Queue ({uploadQueue.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {uploadQueue.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '0.65rem', 
                  border: task.status === 'failed' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.06)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FileText size={16} color="var(--color-arctic-1)" />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{task.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({task.size})</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.8rem', color: task.status === 'completed' ? '#10b981' : task.status === 'failed' ? '#f87171' : 'var(--color-arctic-1)', fontWeight: 500 }}>
                      {task.stage}
                    </span>
                    <button 
                      onClick={() => cancelTask(task.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Clear item"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${task.progress}%`, 
                        height: '100%', 
                        background: task.status === 'failed' ? '#ef4444' : 'var(--color-arctic-1)',
                        transition: 'width 0.3s ease' 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{task.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingested Documents Grid with AI Ready Indicators */}
      <div className="glass-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={20} color="var(--color-arctic-1)" /> Study Library Documents ({documents.length})
          </h3>
        </div>

        {documents.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>No AI documents indexed yet</p>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem' }}>Drag & drop PDF, DOCX, TXT, or MD files above to process, embed, and index them.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {documents.map(doc => {
              const badgeStyle = getFormatBadgeColor(doc.file_extension);
              return (
                <div 
                  key={doc.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '1rem',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            border: `1px solid ${badgeStyle.border}`
                          }}
                        >
                          {doc.file_extension?.toUpperCase() || 'FILE'}
                        </span>
                        {doc.status === 'completed' ? (
                          <span 
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.35rem',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <Sparkles size={11} /> AI Ready
                          </span>
                        ) : doc.status === 'failed' ? (
                          <span 
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.35rem',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <AlertTriangle size={11} /> Failed
                          </span>
                        ) : (
                          <span 
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.35rem',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <RefreshCw size={11} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} /> Processing
                          </span>
                        )}
                      </div>

                      <span 
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '1rem',
                          background: doc.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : doc.status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: doc.status === 'completed' ? '#10b981' : doc.status === 'failed' ? '#f87171' : '#60a5fa',
                          fontWeight: 500
                        }}
                      >
                        {doc.status === 'completed' ? 'AI Ready' : doc.status === 'failed' ? 'Couldn\'t prepare' : `Preparing: ${doc.processing_stage || 'processing'}`}
                      </span>
                    </div>

                    <h4 
                      style={{ 
                        margin: '0 0 0.4rem 0', 
                        fontSize: '0.95rem', 
                        fontWeight: 600, 
                        color: '#fff', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }} 
                      title={doc.original_filename}
                    >
                      {doc.original_filename}
                    </h4>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>Size: {formatFileSize(doc.file_size)}</span>
                      {doc.page_count && <span>Pages: {doc.page_count}</span>}
                      {doc.word_count && <span>Words: {doc.word_count}</span>}
                      {doc.reading_time && <span>Read: ~{doc.reading_time}m</span>}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-action"
                        onClick={() => downloadFile(doc.id, doc.original_filename)}
                        title="Download Document"
                        style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>

                    <button
                      onClick={() => removeDocument(doc.id)}
                      title="Delete Document"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        borderRadius: '0.4rem',
                        padding: '0.4rem 0.6rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
