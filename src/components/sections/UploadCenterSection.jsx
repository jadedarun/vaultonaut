import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Globe, 
  Video, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Link, 
  ExternalLink 
} from 'lucide-react';

export default function UploadCenterSection({ 
  onFileUpload, 
  onUrlIngest, 
  youtubeUrl, 
  setYoutubeUrl, 
  articleUrl, 
  setArticleUrl, 
  uploadTasks 
}) {
  const [isDragging, setIsDragging] = useState(false);

  const mockTasks = (uploadTasks && uploadTasks.length > 0) ? uploadTasks : [
    { id: 101, name: 'MachineLearning_Advanced.pdf', size: '3.4 MB', progress: 100, status: 'Ready (Indexed in ChromaDB)' },
    { id: 102, name: 'FastAPI_Architecture.md', size: '48 KB', progress: 80, status: 'Generating vector embeddings...' },
    { id: 103, name: 'YouTube: System Design Masterclass', size: 'Transcript', progress: 40, status: 'Extracting text chunks...' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="ingest-grid"
    >
      {/* File Upload Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
        <div className="card-header-row">
          <h2 className="card-title">
            <Upload size={20} className="logo-icon" /> Upload Local Documents
          </h2>
          <span className="badge-tag">Drag & Drop</span>
        </div>
        
        <p className="card-desc">
          Supported formats: PDF, DOCX, Markdown, TXT. Files are chunked into 500-character segments and converted to vector embeddings.
        </p>

        <div 
          className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); onFileUpload(e); }}
        >
          <Upload size={40} className="dropzone-icon" />
          <p style={{ fontWeight: '600', marginBottom: '0.3rem', color: 'var(--color-arctic-1)' }}>Drag & drop files here</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>or click to browse local storage</p>
          <input
            type="file"
            id="file-input-hub"
            multiple
            style={{ display: 'none' }}
            onChange={onFileUpload}
          />
          <button className="btn-white-solid" onClick={() => document.getElementById('file-input-hub')?.click()}>
            Browse Files
          </button>
        </div>
      </div>

      {/* URL & Video Ingest Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
        <div className="card-header-row">
          <h2 className="card-title">
            <Link size={20} className="logo-icon" /> Import Web Pages & Transcripts
          </h2>
          <span className="badge-tag">Web Scraper</span>
        </div>

        <p className="card-desc">
          Automatically fetch web pages or parse transcripts from YouTube videos to add to your knowledge vault.
        </p>

        <div className="url-input-group">
          <div className="input-field-wrapper">
            <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              YouTube Video URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="https://www.youtube.com/watch?v=..." 
                className="input-field"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <button className="btn-action" style={{ flexShrink: 0, padding: '0.6rem 1rem' }} onClick={() => onUrlIngest('youtube', youtubeUrl, setYoutubeUrl)}>
                <Video size={15} /> Import
              </button>
            </div>
          </div>

          <div className="input-field-wrapper" style={{ marginTop: '0.8rem' }}>
            <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              Web Article URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="https://medium.com/engineering/..." 
                className="input-field"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
              />
              <button className="btn-white-outline" style={{ flexShrink: 0, padding: '0.6rem 1rem' }} onClick={() => onUrlIngest('article', articleUrl, setArticleUrl)}>
                <ExternalLink size={15} /> Scrape
              </button>
            </div>
          </div>
        </div>

        {/* Live Processing Pipeline Queue */}
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.8rem' }}>
            Live Processing Queue
          </p>
          
          <div className="file-progress-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {mockTasks.map(t => (
              <div key={t.id} className="progress-item" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="progress-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="progress-filename" style={{ fontWeight: 600, color: 'var(--color-arctic-1)', fontSize: '0.85rem' }}>{t.name}</span>
                  <span className="progress-status" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {t.progress < 100 ? (
                      <RefreshCw size={12} className="logo-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
                    ) : (
                      <CheckCircle size={12} color="#10b981" />
                    )}
                    {t.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${t.progress}%`, height: '100%', background: 'var(--color-arctic-1)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
