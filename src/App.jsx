import { useState, useCallback } from 'react';
import {
  Shield,
  HardDrive,
  FolderKanban,
  Send,
  Upload,
  Link,
  Cpu,
  FileText,
  Settings,
  CheckCircle,
  Bookmark,
  Compass,
  HelpCircle,
  Info,
  Sparkles,
  RefreshCw,
  Trash2,
  FolderPlus,
  BookOpen,
  Award,
  Zap,
  X,
  ChevronRight,
  Database,
  Search,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import GradientText from './components/GradientText';
import LineSidebar from './components/LineSidebar';
import GradientBlinds from './components/GradientBlinds';
import './App.css';

// Initial Mock Files
const INITIAL_FILES = [
  { id: 1, name: 'framer_motion_guide.pdf', size: '2.4 MB', type: 'PDF', date: '2026-07-20', collection: 'CS-101' },
  { id: 2, name: 'fastapi_quickstart.md', size: '45 KB', type: 'Markdown', date: '2026-07-21', collection: 'CS-101' },
  { id: 3, name: 'langchain_rag_pipeline.docx', size: '1.2 MB', type: 'DOCX', date: '2026-07-22', collection: 'System Design' },
  { id: 4, name: 'chromadb_config.txt', size: '12 KB', type: 'TXT', date: '2026-07-22', collection: 'System Design' }
];

// Initial Flashcards
const FLASHCARDS = [
  {
    q: 'What vector database does Vaultonaut use?',
    a: 'Vaultonaut uses ChromaDB, a lightweight and open-source vector database, to store document chunk embeddings locally.'
  },
  {
    q: 'What embedding model is used for semantic representation?',
    a: 'It uses sentence-transformers/all-MiniLM-L6-v2, converting text chunks into 384-dimensional dense vectors.'
  },
  {
    q: 'What is the role of RAG in this application?',
    a: 'Retrieval-Augmented Generation (RAG) queries ChromaDB for relevant text chunks, and passes them as context to the LLM to write answers with grounded citations.'
  },
  {
    q: 'What is document chunking?',
    a: 'The process of breaking down long documents (e.g. PDFs) into smaller, overlapping segments (e.g. 500-1000 characters) to fit LLM context limits.'
  }
];

// Quiz Data
const QUIZ_QUESTION = {
  question: 'Which of the following describes the core advantage of a Retrieval-Augmented Generation (RAG) system?',
  options: [
    { text: 'It speeds up network requests by caching API payloads locally.', isCorrect: false },
    { text: 'It grounds LLM responses in verifiable private data, minimizing hallucinations and enabling source citations.', isCorrect: true },
    { text: 'It automatically formats database schemas to PostgreSQL using AI.', isCorrect: false },
    { text: 'It compiles React code into WebAssembly for high performance.', isCorrect: false }
  ],
  explanation: 'RAG retrieves relevant private document chunks matching the query, and prompts the LLM using this text. This grounds the answer in real data and allows listing which files/pages the info came from.'
};

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  
  // Vault Data State
  const [files, setFiles] = useState(INITIAL_FILES);
  const [collections, setCollections] = useState(['CS-101', 'System Design', 'Personal Notes']);
  const [selectedCollection, setSelectedCollection] = useState('CS-101');
  const [newColName, setNewColName] = useState('');
  
  // Ingest Form States
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadTasks, setUploadTasks] = useState([]);
  
  // Chat States
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'system',
      text: 'Hello! I am Vaultonaut, your RAG-based knowledge assistant. Ask me anything about your uploaded documents, and I\'ll answer with precise citations.',
      citations: []
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Study States
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Tab Labels mapped to Index
  const tabs = ['Overview', 'Vault Explorer', 'Ingestion Hub', 'Semantic QA', 'Study Suite'];

  // Handle Tab Switch
  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  // Mock Ingestion Handler
  const handleFileUpload = (e) => {
    const uploadedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (uploadedFiles.length === 0) return;

    uploadedFiles.forEach(file => {
      const taskId = Date.now() + Math.random();
      const newTask = {
        id: taskId,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        progress: 10,
        status: 'Parsing file...'
      };
      setUploadTasks(prev => [newTask, ...prev]);

      // Simulate parsing stages
      setTimeout(() => {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 40, status: 'Generating embeddings...' } : t));
      }, 1000);

      setTimeout(() => {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 80, status: 'Storing in ChromaDB...' } : t));
      }, 2000);

      setTimeout(() => {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 100, status: 'Completed' } : t));
        
        // Add to main files list
        const newFileEntry = {
          id: Date.now(),
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: file.name.split('.').pop().toUpperCase(),
          date: new Date().toISOString().split('T')[0],
          collection: selectedCollection
        };
        setFiles(prev => [newFileEntry, ...prev]);
      }, 3000);
    });
  };

  // URL Ingest Simulator
  const handleUrlIngest = (type, url, setUrl) => {
    if (!url) return;
    const taskId = Date.now();
    const name = type === 'youtube' ? 'YouTube Transcript: ' + url.substring(0, 30) + '...' : 'Web Article: ' + url.substring(0, 30) + '...';
    
    const newTask = {
      id: taskId,
      name,
      size: 'Fetch API',
      progress: 20,
      status: 'Downloading content...'
    };
    
    setUploadTasks(prev => [newTask, ...prev]);
    setUrl('');

    setTimeout(() => {
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 60, status: 'Chunking text & embedding...' } : t));
    }, 1200);

    setTimeout(() => {
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 100, status: 'Completed' } : t));
      setFiles(prev => [
        {
          id: Date.now(),
          name: type === 'youtube' ? 'yt_transcript_' + Math.floor(Math.random() * 1000) + '.txt' : 'web_article_' + Math.floor(Math.random() * 1000) + '.md',
          size: '32 KB',
          type: type === 'youtube' ? 'Transcript' : 'Article',
          date: new Date().toISOString().split('T')[0],
          collection: selectedCollection
        },
        ...prev
      ]);
    }, 2500);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e);
  };

  // Create Collection
  const createCollection = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    if (collections.includes(newColName.trim())) return;
    setCollections(prev => [...prev, newColName.trim()]);
    setSelectedCollection(newColName.trim());
    setNewColName('');
  };

  // Mock Q&A simulation
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput, citations: [] };
    setChatMessages(prev => [...prev, userMsg]);
    const query = chatInput.toLowerCase();
    setChatInput('');

    // Loader
    const loadingMsgId = Date.now();
    setChatMessages(prev => [...prev, { id: loadingMsgId, sender: 'system', text: 'Retrieving context and generating response...', isLoading: true }]);

    setTimeout(() => {
      let answerText = "I couldn't find a direct match in your current vault document chunks. However, looking at the structural layout of Vaultonaut, you can initialize a ChromaDB client and perform a similarity query. Ensure that you have embedded the documents using Gemini's embedding model or SentenceTransformers.";
      let citations = [];

      if (query.includes('rag') || query.includes('retrieval')) {
        answerText = 'Retrieval-Augmented Generation (RAG) is a technique that references a local vector store (ChromaDB) to retrieve document chunks matching your question. The system then feeds these chunks to the LLM (Google Gemini) alongside your prompt to generate a grounded, accurate reply.';
        citations = ['langchain_rag_pipeline.docx:p2', 'framer_motion_guide.pdf:p1'];
      } else if (query.includes('solid') || query.includes('clean architecture') || query.includes('design')) {
        answerText = 'SOLID design principles (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion) are utilized to write modular and testable code. In the backend, we separate routing (FastAPI endpoints), services (RAG, Ingestion), and schemas (PostgreSQL models) to keep components decoupled.';
        citations = ['fastapi_quickstart.md:p4'];
      } else if (query.includes('fastapi') || query.includes('python')) {
        answerText = 'FastAPI is a Python framework utilized for building the Vaultonaut API backend. It provides automated interactive documentation via Swagger, fast asynchronous request processing, and strong type validation using Pydantic.';
        citations = ['fastapi_quickstart.md:p1', 'chromadb_config.txt:p1'];
      } else if (query.includes('embedding') || query.includes('vector')) {
        answerText = 'Embeddings represent text chunks as mathematical vectors in a multi-dimensional space. Distance metrics like cosine similarity or L2 distance are used to retrieve chunks. Vaultonaut uses sentence-transformers to run these models locally without network overhead.';
        citations = ['chromadb_config.txt:p2'];
      }

      setChatMessages(prev => prev.filter(m => m.id !== loadingMsgId).concat({
        sender: 'system',
        text: answerText,
        citations
      }));
    }, 1500);
  };

  return (
    <div className="app-container">
      {/* Background Animated Gradient Blinds */}
      <div className="bg-canvas-container">
        <GradientBlinds
          gradientColors={['#0a0e17', '#2c3e50', '#80c6e8', '#b3ddf2', '#0a0e17']}
          angle={45}
          noise={0.12}
          blindCount={12}
          blindMinWidth={60}
          mouseDampening={0.2}
          spotlightRadius={0.6}
          spotlightSoftness={1.2}
          spotlightOpacity={0.8}
          distortAmount={1}
          mixBlendMode="normal"
        />
      </div>

      {/* Sidebar Panel */}
      <aside className="sidebar-container">
        <div>
          <div className="logo-section">
            <HardDrive size={28} className="logo-icon" />
            <span className="logo-text">
              <GradientText
                colors={['#e6f3ff', '#b3ddf2', '#80c6e8', '#ffffff']}
                animationSpeed={5}
                showBorder={false}
              >
                Vaultonaut
              </GradientText>
            </span>
          </div>
          
          <div className="sidebar-nav">
            <LineSidebar
              items={tabs}
              accentColor="#80c6e8"
              textColor="#9ca3af"
              markerColor="#4b5563"
              showIndex={true}
              showMarker={true}
              proximityRadius={90}
              maxShift={20}
              falloff="smooth"
              itemGap={18}
              fontSize={1.0}
              smoothing={120}
              defaultActive={activeTab}
              onItemClick={(index) => handleTabChange(index)}
            />
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot"></span>
            <span>RAG Engine Online</span>
          </div>
          <div className="db-stats">
            <p>Chroma vectors: {files.length * 8}</p>
            <p>Collections: {collections.length}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="page-title">{tabs[activeTab]}</div>
          <div className="nav-actions">
            {/* The white buttons requested by the user */}
            <button className="btn-white-solid" onClick={() => setFeaturesOpen(true)}>
              <Sparkles size={16} />
              Features
            </button>
            <button className="btn-white-outline" onClick={() => setAboutOpen(true)}>
              <Info size={16} />
              About
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-icon-only" 
              title="GitHub Repository"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </a>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="dashboard-view">
          
          {/* TAB 0: OVERVIEW */}
          {activeTab === 0 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card hero-banner">
                <span className="badge-tag">v1.0.0 Starting Frontend</span>
                <h1 className="hero-banner-title">AI-Powered Personal Knowledge Vault</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '1.05rem', lineHeight: '1.5' }}>
                  Vaultonaut combines local document indexing with vector similarity search (RAG) and LLM generative reasoning. Upload PDFs, markdown files, transcripts, or web articles to get immediate, source-backed answers and study guides.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
                  <button className="btn-action" onClick={() => setActiveTab(2)}>
                    <Upload size={16} /> Ingest Documents
                  </button>
                  <button className="btn-white-outline" onClick={() => setActiveTab(3)}>
                    <Send size={16} /> Ask the Vault
                  </button>
                </div>
              </div>

              <div className="overview-grid">
                <div className="glass-card col-span-2">
                  <div className="card-header-row">
                    <h2 className="card-title"><Database size={20} className="logo-icon" /> Vault Summary</h2>
                    <span className="badge-tag">Ready</span>
                  </div>
                  <div className="stat-group" style={{ marginBottom: '1.5rem' }}>
                    <div className="stat-item">
                      <div className="stat-val">{files.length}</div>
                      <div className="stat-lbl">Ingested Files</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-val">{files.length * 8}</div>
                      <div className="stat-lbl">Chroma DB Chunks</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', fontWeight: '600' }}>Recent Ingests</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {files.slice(0, 3).map(f => (
                        <div key={f.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={14} color="var(--color-arctic-3)" /> {f.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{f.date} &bull; {f.collection}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="card-header-row">
                    <h2 className="card-title"><Cpu size={20} className="logo-icon" /> Quick Ingest</h2>
                  </div>
                  <p className="card-desc" style={{ textAlign: 'left' }}>Import URLs directly into the active collection: <strong>{selectedCollection}</strong></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="url-input-group" style={{ gap: '0.8rem' }}>
                      <input 
                        type="text" 
                        placeholder="YouTube Video URL" 
                        className="input-field" 
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                      <button className="btn-action" style={{ padding: '0.6rem' }} onClick={() => handleUrlIngest('youtube', youtubeUrl, setYoutubeUrl)}>
                        <Link size={14} /> Import Transcript
                      </button>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 0' }}></div>
                    <div className="url-input-group" style={{ gap: '0.8rem' }}>
                      <input 
                        type="text" 
                        placeholder="Web Article URL" 
                        className="input-field" 
                        value={articleUrl}
                        onChange={(e) => setArticleUrl(e.target.value)}
                      />
                      <button className="btn-white-outline" style={{ padding: '0.6rem', width: '100%', justifyContent: 'center' }} onClick={() => handleUrlIngest('article', articleUrl, setArticleUrl)}>
                        <ExternalLink size={14} /> Scrape Web Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: VAULT EXPLORER */}
          {activeTab === 1 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Knowledge Collections</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a collection to filter your semantic search space</p>
                </div>
                <form onSubmit={createCollection} style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    placeholder="New Collection Name"
                    className="input-field"
                    style={{ width: '220px', padding: '0.5rem 0.8rem' }}
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                  />
                  <button type="submit" className="btn-white-solid" style={{ padding: '0.5rem 1rem' }}>
                    <FolderPlus size={16} /> Create
                  </button>
                </form>
              </div>

              <div className="collections-list">
                {collections.map(col => {
                  const count = files.filter(f => f.collection === col).length;
                  return (
                    <div 
                      key={col} 
                      className={`glass-card collection-card ${selectedCollection === col ? 'active' : ''}`}
                      onClick={() => setSelectedCollection(col)}
                      style={{ textAlign: 'left', padding: '1.2rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <FolderKanban size={20} color={selectedCollection === col ? 'var(--color-arctic-3)' : 'var(--text-secondary)'} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{col}</h3>
                      </div>
                      <div className="collection-meta">
                        <span>{count} files</span>
                        <span>{count * 8} chunks</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="glass-card documents-table-card">
                <div className="card-header-row">
                  <h2 className="card-title">Files in Collection: {selectedCollection}</h2>
                  <span className="badge-tag">{files.filter(f => f.collection === selectedCollection).length} documents</span>
                </div>
                
                {files.filter(f => f.collection === selectedCollection).length === 0 ? (
                  <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                    No files uploaded in this collection yet. Head over to Ingestion Hub to upload documents.
                  </div>
                ) : (
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Indexed On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.filter(f => f.collection === selectedCollection).map(f => (
                        <tr key={f.id} className="doc-row">
                          <td>
                            <div className="doc-name">
                              <FileText size={16} color="var(--color-arctic-4)" />
                              {f.name}
                            </div>
                          </td>
                          <td><span className="badge-tag">{f.type}</span></td>
                          <td>{f.size}</td>
                          <td>{f.date}</td>
                          <td>
                            <button 
                              className="btn-icon-only" 
                              style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
                              onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                              title="Delete file & remove vectors"
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INGESTION HUB */}
          {activeTab === 2 && (
            <div className="fade-in ingest-grid">
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                <h2 className="card-title"><Upload size={20} className="logo-icon" /> Upload Local Files</h2>
                <p className="card-desc">Supported formats: PDF, DOCX, Markdown, TXT. Files are chunked and converted to vector embeddings using a local sentence-transformer pipeline.</p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Active Target Collection</label>
                  <select 
                    className="input-field" 
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    style={{ background: 'rgba(10, 14, 23, 0.8)' }}
                  >
                    {collections.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div 
                  className={`file-dropzone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload size={40} className="dropzone-icon" />
                  <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Drag & drop files here</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>or click to browse local storage</p>
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button className="btn-white-solid" onClick={() => document.getElementById('file-input').click()}>
                    Browse Files
                  </button>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <h2 className="card-title"><Link size={20} className="logo-icon" /> Import Web Articles & Transcripts</h2>
                <p className="card-desc">Automatically fetch web pages or parse transcripts from YouTube videos to add to your knowledge vault.</p>

                <div className="url-input-group">
                  <div className="input-field-wrapper">
                    <label className="input-label">YouTube Video URL</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        className="input-field"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                      />
                      <button className="btn-white-solid" style={{ flexShrink: 0 }} onClick={() => handleUrlIngest('youtube', youtubeUrl, setYoutubeUrl)}>
                        Import
                      </button>
                    </div>
                  </div>

                  <div className="input-field-wrapper" style={{ marginTop: '0.5rem' }}>
                    <label className="input-label">Web Article URL</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="https://medium.com/engineering/..." 
                        className="input-field"
                        value={articleUrl}
                        onChange={(e) => setArticleUrl(e.target.value)}
                      />
                      <button className="btn-white-solid" style={{ flexShrink: 0 }} onClick={() => handleUrlIngest('article', articleUrl, setArticleUrl)}>
                        Scrape
                      </button>
                    </div>
                  </div>
                </div>

                {uploadTasks.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.6rem' }}>Ingestion Progress</p>
                    <div className="file-progress-list">
                      {uploadTasks.map(t => (
                        <div key={t.id} className="progress-item">
                          <div className="progress-info">
                            <span className="progress-filename">{t.name}</span>
                            <span className="progress-status">
                              {t.progress < 100 ? (
                                <RefreshCw size={12} className="logo-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
                              ) : (
                                <CheckCircle size={12} color="#10b981" />
                              )}
                              {t.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{t.progress}%</span>
                            <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${t.progress}%`, height: '100%', background: 'var(--color-arctic-3)', transition: 'width 0.3s ease' }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SEMANTIC QA */}
          {activeTab === 3 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Search Context</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Querying vector embeddings inside collection: <strong>{selectedCollection}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <select 
                    className="input-field" 
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(10, 14, 23, 0.8)' }}
                  >
                    {collections.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="chat-window">
                <div className="chat-history">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`chat-msg ${msg.sender === 'user' ? 'user' : 'system'}`}>
                      <div className="avatar">
                        {msg.sender === 'user' ? 'U' : <Cpu size={16} />}
                      </div>
                      <div className="msg-bubble">
                        {msg.isLoading ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={14} className="logo-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
                            {msg.text}
                          </span>
                        ) : (
                          <>
                            {msg.text}
                            {msg.citations && msg.citations.length > 0 && (
                              <div style={{ marginTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Citations:</span>
                                {msg.citations.map((cit, idx) => (
                                  <span key={idx} className="citation" title="Show document source chunk">
                                    <FileText size={10} style={{ marginRight: '0.2rem' }} />
                                    {cit}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-bar">
                  <input
                    type="text"
                    placeholder='Ask a question (e.g. "How does RAG work?" or "What is SOLID?")'
                    className="input-field"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn-action" style={{ padding: '0.8rem 1.2rem' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>

              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Suggested Questions:</p>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-white-outline" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => setChatInput('How does RAG work?')}
                  >
                    How does RAG work?
                  </button>
                  <button 
                    className="btn-white-outline" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => setChatInput('What is FastAPI?')}
                  >
                    What is FastAPI?
                  </button>
                  <button 
                    className="btn-white-outline" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => setChatInput('What are SOLID design principles?')}
                  >
                    What are SOLID design principles?
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDY SUITE */}
          {activeTab === 4 && (
            <div className="fade-in study-grid">
              {/* Flashcards */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                <div className="card-header-row">
                  <h2 className="card-title"><BookOpen size={20} className="logo-icon" /> AI Flashcards</h2>
                  <span className="badge-tag">Card {fcIndex + 1} of {FLASHCARDS.length}</span>
                </div>
                <p className="card-desc">Interactive flashcards synthesized automatically from your ingested files. Click the card to flip it and view the definition.</p>
                
                <div className="flashcard-wrapper" onClick={() => setFcFlipped(!fcFlipped)}>
                  <div className={`flashcard ${fcFlipped ? 'flipped' : ''}`}>
                    <div className="flashcard-side flashcard-front">
                      <span className="flashcard-meta">Question</span>
                      <div className="flashcard-body">{FLASHCARDS[fcIndex].q}</div>
                      <span className="flashcard-instructions">Click to reveal answer</span>
                    </div>
                    <div className="flashcard-side flashcard-back">
                      <span className="flashcard-meta" style={{ color: 'var(--color-arctic-4)' }}>Answer</span>
                      <div className="flashcard-body">{FLASHCARDS[fcIndex].a}</div>
                      <span className="flashcard-instructions" style={{ color: 'var(--color-arctic-4)' }}>Click to see question</span>
                    </div>
                  </div>
                </div>

                <div className="flashcard-controls">
                  <button 
                    className="btn-white-outline"
                    disabled={fcIndex === 0}
                    onClick={() => {
                      setFcFlipped(false);
                      setTimeout(() => setFcIndex(prev => Math.max(0, prev - 1)), 150);
                    }}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn-white-solid"
                    disabled={fcIndex === FLASHCARDS.length - 1}
                    onClick={() => {
                      setFcFlipped(false);
                      setTimeout(() => setFcIndex(prev => Math.min(FLASHCARDS.length - 1, prev + 1)), 150);
                    }}
                  >
                    Next Card
                  </button>
                </div>
              </div>

              {/* Quizzes */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                <div className="card-header-row">
                  <h2 className="card-title"><Award size={20} className="logo-icon" /> AI-Generated Quiz</h2>
                  <span className="badge-tag">RAG Evaluation</span>
                </div>
                <p className="card-desc">Self-evaluation multiple choice questions compiled from document segments.</p>

                <div className="quiz-question-box">
                  <p className="quiz-question-text">{QUIZ_QUESTION.question}</p>
                  
                  <div className="quiz-options">
                    {QUIZ_QUESTION.options.map((opt, idx) => {
                      let optionClass = 'quiz-option-btn';
                      if (quizSelected === idx) optionClass += ' selected';
                      if (quizSubmitted) {
                        if (opt.isCorrect) optionClass += ' correct';
                        else if (quizSelected === idx) optionClass += ' incorrect';
                      }

                      return (
                        <button 
                          key={idx}
                          className={optionClass}
                          disabled={quizSubmitted}
                          onClick={() => setQuizSelected(idx)}
                        >
                          <span>{opt.text}</span>
                          {quizSubmitted && opt.isCorrect && <CheckCircle size={16} color="#10b981" />}
                          {quizSubmitted && !opt.isCorrect && quizSelected === idx && <X size={16} color="#ef4444" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      <p style={{ fontWeight: '600', color: 'var(--color-arctic-3)', marginBottom: '0.3rem' }}>Explanation:</p>
                      <p style={{ color: 'var(--text-secondary)' }}>{QUIZ_QUESTION.explanation}</p>
                      <button 
                        className="btn-white-outline" 
                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                        onClick={() => {
                          setQuizSelected(null);
                          setQuizSubmitted(false);
                        }}
                      >
                        Reset Quiz
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn-action" 
                      style={{ width: '100%', marginTop: '0.5rem' }}
                      disabled={quizSelected === null}
                      onClick={() => setQuizSubmitted(true)}
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FEATURES MODAL ("the white one like features and about buttons") */}
      {featuresOpen && (
        <div className="modal-overlay" onClick={() => setFeaturesOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setFeaturesOpen(false)}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={24} className="logo-icon" /> Vaultonaut Core Features
            </h2>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Vaultonaut is packed with features designed to build a professional personal knowledge vault using Retrieval-Augmented Generation (RAG).
              </p>
              
              <div className="modal-section-title">Knowledge Management</div>
              <div className="features-list-modal">
                <div className="feature-box">
                  <div className="feature-box-title">Multi-Format Parsing</div>
                  <div className="feature-box-desc">Ingest local PDFs, DOCX files, Markdown files, and plain text documents seamlessly.</div>
                </div>
                <div className="feature-box">
                  <div className="feature-box-title">URL Scraping</div>
                  <div className="feature-box-desc">Paste YouTube links to automatically fetch transcripts or web links to scrape articles.</div>
                </div>
                <div className="feature-box">
                  <div className="feature-box-title">Collections</div>
                  <div className="feature-box-desc">Organize documents into structured collections to segment and control retrieval context.</div>
                </div>
                <div className="feature-box">
                  <div className="feature-box-title">Local Vector Storage</div>
                  <div className="feature-box-desc">Embed text chunks and store them in ChromaDB locally, preserving privacy.</div>
                </div>
              </div>

              <div className="modal-section-title">Semantic & Q&A Operations</div>
              <div className="features-list-modal">
                <div className="feature-box">
                  <div className="feature-box-title">Natural Query Interface</div>
                  <div className="feature-box-desc">Ask questions about your documents in plain English and receive conversational responses.</div>
                </div>
                <div className="feature-box">
                  <div className="feature-box-title">Source Grounding</div>
                  <div className="feature-box-desc">Answers are grounded in your files. Every sentence is backed by clear inline citations.</div>
                </div>
                <div className="feature-box">
                  <div className="feature-box-title">Contextual Memory</div>
                  <div className="feature-box-desc">Keeps chat history context alive so follow-up queries carry full conversational context.</div>
                </div>
                <div className="feature-box">
                  <div className="feature-box-title">AI Study Aids</div>
                  <div className="feature-box-desc">Instantly compile cards, quizzes, and summaries from your text vectors.</div>
                </div>
              </div>

              <button className="btn-white-solid" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} onClick={() => setFeaturesOpen(false)}>
                Explore Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {aboutOpen && (
        <div className="modal-overlay" onClick={() => setAboutOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setAboutOpen(false)}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Info size={24} className="logo-icon" /> About Vaultonaut
            </h2>
            <div className="modal-body" style={{ gap: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Vaultonaut is a production-grade full-stack personal knowledge organizer built using FastAPI, React (Vite), and vector embeddings.
              </p>
              
              <div className="modal-section-title">Architectural Stack</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', width: '130px', color: 'var(--color-arctic-3)' }}>Backend Framework</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>FastAPI (Python 3.12+) & Uvicorn</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Frontend UI</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>React.js (Vite), Vanilla CSS, Framer Motion, OGL, Lucide</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Vector Database</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>Chroma DB (Local Storage)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>RAG Pipeline</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>LangChain, RecursiveCharacterTextSplitter</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Embeddings</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>sentence-transformers (all-MiniLM-L6-v2)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>LLM Integrator</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>Google Gemini API Service Layer (Abstracted interface)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Primary Database</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>PostgreSQL (User details, collection metadata) & SQLAlchemy</td>
                  </tr>
                </tbody>
              </table>

              <div className="modal-section-title" style={{ marginTop: '0.5rem' }}>Core System Pipeline Flow</div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', lineHeight: '1.45', fontFamily: 'var(--font-mono)', color: 'var(--color-arctic-2)' }}>
                Upload Document &rarr; Parse text (PyMuPDF/docx) &rarr; Segment into Chunks &rarr; Embed (Sentence-Transformers) &rarr; Save Vectors (ChromaDB)
                <br /><br />
                User Query &rarr; Query Embed &rarr; Semantic Retrieve (Cosine Similarity) &rarr; Context Synthesis &rarr; Prompt Gemini LLM &rarr; Cite Source References
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-white-solid" style={{ flexGrow: 1, textDecoration: 'none', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem' }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> GitHub Code
                </a>
                <button className="btn-white-outline" style={{ flexGrow: 1 }} onClick={() => setAboutOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
