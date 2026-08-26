import { useState, useCallback, useEffect } from 'react';
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
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useGoogleAuth } from './context/GoogleAuthContext';
import { useDocuments } from './context/DocumentContext';
import GradientText from './components/GradientText';
import LineSidebar from './components/LineSidebar';
import GradientBlinds from './components/GradientBlinds';
import { AnimatePresence } from 'framer-motion';
import OnboardingFlow from './components/OnboardingFlow';
import DashboardSection from './components/sections/DashboardSection';
import KnowledgeVaultSection from './components/sections/KnowledgeVaultSection';
import UploadCenterSection from './components/sections/UploadCenterSection';
import AIWorkspaceSection from './components/sections/AIWorkspaceSection';
import LearningStudioSection from './components/sections/LearningStudioSection';
import AnalyticsSection from './components/sections/AnalyticsSection';
import SettingsSection from './components/sections/SettingsSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare, GeistPixelGrid, GeistPixelCircle, GeistPixelTriangle, GeistPixelLine } from 'geist/font/pixel';
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
  const { user, logout } = useGoogleAuth();
  const { stats } = useDocuments();
  const location = useLocation();
  const navigate = useNavigate();

  // Theme state for reactive header button styling
  const [theme, setTheme] = useState(() => localStorage.getItem('vaultonaut_theme') || 'dark');

  // Onboarding & LocalStorage Defaults Migration
  useEffect(() => {
    const currentThreshold = localStorage.getItem('vaultonaut_similarity_threshold');
    const parsed = Number(currentThreshold);
    if (!currentThreshold || isNaN(parsed) || parsed === 0.75 || parsed > 1.0 || parsed < 0.0) {
      localStorage.setItem('vaultonaut_similarity_threshold', '0.45');
    }
    const currentTopK = localStorage.getItem('vaultonaut_top_k');
    if (!currentTopK) {
      localStorage.setItem('vaultonaut_top_k', '5');
    }
    
    // Restore Visual Theme
    const savedTheme = localStorage.getItem('vaultonaut_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    // Reactively update theme state
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('vaultonaut_theme') || 'dark');
    };
    window.addEventListener('vaultonaut-theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('vaultonaut-theme-change', handleThemeChange);
    };
  }, []);

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [turboMode, setTurboMode] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Sync URL routes to activeTab
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      navigate('/dashboard', { replace: true });
    } else if (path.startsWith('/dashboard')) {
      setActiveTab(0);
    } else if (path.startsWith('/knowledge-vault')) {
      setActiveTab(1);
    } else if (path.startsWith('/upload-center')) {
      setActiveTab(2);
    } else if (path.startsWith('/ai-workspace')) {
      setActiveTab(3);
    } else if (path.startsWith('/learning-studio')) {
      setActiveTab(4);
    } else if (path.startsWith('/analytics')) {
      setActiveTab(5);
    } else if (path.startsWith('/settings')) {
      setActiveTab(6);
    }
  }, [location.pathname, navigate]);
  
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
  const tabs = [
    'Dashboard',
    'Knowledge Vault',
    'Upload Center',
    'AI Workspace',
    'Learning Studio',
    'Analytics',
    'Settings'
  ];

  // Handle Tab Switch
  const handleTabChange = (index) => {
    const paths = [
      '/dashboard',
      '/knowledge-vault',
      '/upload-center',
      '/ai-workspace',
      '/learning-studio',
      '/analytics',
      '/settings'
    ];
    navigate(paths[index]);
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
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 40, status: 'Understanding...' } : t));
      }, 1000);

      setTimeout(() => {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 80, status: 'Ready' } : t));
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
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: 60, status: 'Understanding...' } : t));
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
    <OnboardingFlow>
      <div className="app-container">
      {/* Background Animated Gradient Blinds */}
      <div className="bg-canvas-container">
        {!turboMode ? (
          <GradientBlinds
            gradientColors={['#000000', '#0a0a0a', '#18181b', '#27272a', '#000000']}
            angle={45}
            noise={0.02}
            blindCount={6}
            blindMinWidth={60}
            mouseDampening={0.1}
            spotlightRadius={0.5}
            spotlightSoftness={1}
            spotlightOpacity={0.5}
            distortAmount={0.3}
            dpr={1}
            mixBlendMode="normal"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#000000' }} />
        )}
      </div>

      {/* Sidebar Panel */}
      <aside className="sidebar-container">
        <div>
          <div className="logo-section">
            <HardDrive size={28} className="logo-icon" style={{ color: 'var(--color-arctic-1)' }} />
            <span className="logo-text">
              <GradientText
                colors={theme === 'light' ? ['#111827', '#374151', '#4b5563', '#111827'] : ['#ffffff', '#e4e4e7', '#a1a1aa', '#ffffff']}
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
              accentColor="var(--sidebar-active-text)"
              textColor="var(--sidebar-text)"
              markerColor="var(--text-muted)"
              showIndex={true}
              showMarker={true}
              proximityRadius={90}
              maxShift={20}
              falloff="smooth"
              itemGap={13}
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
            <span>Connected</span>
          </div>
          <div className="db-stats">
            <p>Ready to answer from your knowledge</p>
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
            <button 
              className={`btn-turbo-mode${turboMode ? ' active' : ''}`}
              onClick={() => setTurboMode(!turboMode)} 
              title="Toggle Turbo Mode (Disables GPU WebGL shaders for max FPS)"
            >
              <Zap size={16} />
              <span>{turboMode ? 'Turbo On (120 FPS)' : 'Turbo Mode'}</span>
            </button>
            <button className="btn-white-solid" onClick={() => setFeaturesOpen(true)}>
              <Sparkles size={16} />
              Features
            </button>
            <button className="btn-white-outline" onClick={() => setAboutOpen(true)}>
              <Info size={16} />
              About
            </button>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0.75rem', background: 'var(--glass-border)', borderRadius: '2rem', border: '1px solid var(--glass-border)' }}>
                <img src={user.photoURL} alt={user.displayName} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f4f4f5' }}>{user.firstName}</span>
              </div>
            )}
            <button className="btn-white-outline" onClick={logout} title="Sign Out" style={{ padding: '0.5rem 0.8rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace Views */}
        <div className={`dashboard-view ${activeTab === 3 ? 'ai-workspace-tab-view' : ''}`}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <DashboardSection key="dashboard" user={user} onNavigate={handleTabChange} files={files} />
            )}
            {activeTab === 1 && (
              <KnowledgeVaultSection key="vault" files={files} collections={collections} selectedCollection={selectedCollection} setSelectedCollection={setSelectedCollection} />
            )}
            {activeTab === 2 && (
              <UploadCenterSection key="upload" onFileUpload={handleFileUpload} onUrlIngest={handleUrlIngest} youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} articleUrl={articleUrl} setArticleUrl={setArticleUrl} uploadTasks={uploadTasks} />
            )}
            {activeTab === 3 && (
              <AIWorkspaceSection key="ai" chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} onSendMessage={handleSendMessage} />
            )}
            {activeTab === 4 && (
              <LearningStudioSection key="learning" />
            )}
            {activeTab === 5 && (
              <AnalyticsSection key="analytics" />
            )}
            {activeTab === 6 && (
              <SettingsSection key="settings" user={user} logout={logout} />
            )}
          </AnimatePresence>
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
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', width: '130px', color: 'var(--color-arctic-3)' }}>Backend Framework</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>FastAPI (Python 3.12+) & Uvicorn</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Frontend UI</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>React.js (Vite), Vanilla CSS, Framer Motion, OGL, Lucide</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Vector Database</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>Chroma DB (Local Storage)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>RAG Pipeline</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>LangChain, RecursiveCharacterTextSplitter</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: '600', color: 'var(--color-arctic-3)' }}>Embeddings</td>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>sentence-transformers (all-MiniLM-L6-v2)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
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
              <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', lineHeight: '1.45', fontFamily: 'var(--font-mono)', color: 'var(--color-arctic-2)' }}>
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
    </OnboardingFlow>
  );
}
