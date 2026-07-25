import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  BookOpen, 
  GitCompare, 
  HelpCircle, 
  Send, 
  Sparkles, 
  FileText, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';

export default function AIWorkspaceSection({ 
  chatMessages, 
  chatInput, 
  setChatInput, 
  onSendMessage 
}) {
  const [activeTab, setActiveTab] = useState('chat'); // chat | search | research | compare | explain
  const [selectedDocs, setSelectedDocs] = useState(['framer_motion_guide.pdf', 'fastapi_quickstart.md']);

  const subTabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'search', label: 'Deep Search', icon: Search },
    { id: 'research', label: 'Research Assistant', icon: BookOpen },
    { id: 'compare', label: 'Compare Documents', icon: GitCompare },
    { id: 'explain', label: 'Explain Selection', icon: HelpCircle }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
    >
      {/* Top Workspace Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid var(--glass-border)' }}>
        {subTabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={isActive ? 'btn-white-solid' : 'btn-white-outline'}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Chat */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="chat-window">
            <div className="chat-history">
              {(chatMessages || []).map((msg, index) => (
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

            <form onSubmit={onSendMessage} className="chat-input-bar">
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

          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Suggested Questions:</p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button className="btn-white-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setChatInput('How does RAG work?')}>
                How does RAG work?
              </button>
              <button className="btn-white-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setChatInput('What is FastAPI?')}>
                What is FastAPI?
              </button>
              <button className="btn-white-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setChatInput('What are SOLID design principles?')}>
                What are SOLID design principles?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Deep Search */}
      {activeTab === 'search' && (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card-header-row">
            <h2 className="card-title"><Search size={18} className="logo-icon" /> Semantic Vector Search</h2>
            <span className="badge-tag">ChromaDB Vector Store</span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input 
              type="text" 
              placeholder="Search across dense 384-dimensional vector embeddings..." 
              defaultValue="FastAPI dependency injection and security tokens"
              className="input-field"
            />
            <button className="btn-action">Search</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            {[
              { doc: "fastapi_quickstart.md", similarity: "94.2%", snippet: "FastAPI Dependency Injection manages DB sessions and JWT security context using Depends(get_current_user)." },
              { doc: "framer_motion_guide.pdf", similarity: "88.7%", snippet: "Spring transitions and layout animations provide smooth 60fps UI renders." },
              { doc: "chromadb_config.txt", similarity: "84.1%", snippet: "Distance metric: Cosine similarity with dense embeddings." }
            ].map((res, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-arctic-1)', fontSize: '0.85rem' }}>{res.doc}</span>
                  <span className="badge-tag">{res.similarity} match</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{res.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Research Assistant */}
      {activeTab === 'research' && (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="card-title"><BookOpen size={18} className="logo-icon" /> Multi-Document Synthesizer</h2>
          <p className="card-desc">Select documents to synthesize into a structured research brief.</p>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {['framer_motion_guide.pdf', 'fastapi_quickstart.md', 'langchain_rag_pipeline.docx'].map((doc, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc])}
                className={selectedDocs.includes(doc) ? 'btn-white-solid' : 'btn-white-outline'}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
              >
                {selectedDocs.includes(doc) ? '✓ ' : '+ '}{doc}
              </button>
            ))}
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'block', marginBottom: '0.4rem' }}>
              Synthesized Research Brief ({selectedDocs.length} Documents)
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              The selected documents establish a full-stack architecture combining a FastAPI Python backend (SQLAlchemy ORM + JWT security) with a high-performance React Vite frontend powered by Framer Motion animations and ChromaDB local vector storage.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4 & 5: Compare & Explain */}
      {(activeTab === 'compare' || activeTab === 'explain') && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 className="card-title"><GitCompare size={18} className="logo-icon" /> Document Analysis</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Side-by-side comparative analysis and selection explanation active for collection documents.
          </p>
        </div>
      )}
    </motion.div>
  );
}
