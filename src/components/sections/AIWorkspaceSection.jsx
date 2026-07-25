import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  BookOpen, 
  GitCompare, 
  HelpCircle, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Bookmark, 
  Layers, 
  ArrowRight, 
  Copy, 
  ThumbsUp 
} from 'lucide-react';
import GradientText from '../GradientText';

export default function AIWorkspaceSection({ 
  chatMessages, 
  chatInput, 
  setChatInput, 
  onSendMessage 
}) {
  const [activeTab, setActiveTab] = useState('chat'); // chat | search | research | compare | explain
  const [selectedDocs, setSelectedDocs] = useState(['framer_motion_guide.pdf', 'fastapi_quickstart.md']);
  const [explainText, setExplainText] = useState('Retrieval-Augmented Generation (RAG) retrieves relevant chunks from ChromaDB before prompting LLM.');

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'search', label: 'Deep Search', icon: Search },
    { id: 'research', label: 'Research Assistant', icon: BookOpen },
    { id: 'compare', label: 'Compare Documents', icon: GitCompare },
    { id: 'explain', label: 'Explain Selection', icon: HelpCircle }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-[#0c101d] border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1 font-mono">
          <Sparkles className="w-4 h-4" />
          <span>INTELLIGENT SUITE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interact with your knowledge vault using grounded RAG semantic search, document comparison, and multi-file research synthesis.
        </p>
      </div>

      {/* Top Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: AI Chat (ChatGPT / NotebookLM style) */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="min-h-[380px] max-h-[500px] overflow-y-auto p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'system' && (
                  <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 h-fit shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div 
                  className={`p-4 rounded-2xl max-w-[85%] space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-none'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounded Citation Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span>Grounded Sources ({msg.citations.length})</span>
                        <span className="text-emerald-400 font-semibold">Confidence: 98.4%</span>
                      </div>
                      {msg.citations.map((cit, cIdx) => (
                        <div key={cIdx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                          <span className="font-semibold text-cyan-300">[{cit.doc}]</span> {cit.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); onSendMessage(); }}
            className="flex items-center gap-2 p-2 rounded-2xl bg-[#0c101d] border border-slate-800 backdrop-blur-md"
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about your vault documents..."
              className="flex-1 px-4 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab Content 2: Deep Search */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                placeholder="Perform semantic vector search across all embedded chunks..."
                defaultValue="FastAPI dependency injection and security tokens"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>Top 3 Semantic Vector Matches</span>
                <span className="text-emerald-400 font-semibold">Model: sentence-transformers/all-MiniLM-L6-v2</span>
              </div>

              {[
                { doc: "fastapi_quickstart.md", similarity: "94.2%", snippet: "FastAPI Dependency Injection manages DB sessions and JWT security context using Depends(get_current_user)." },
                { doc: "framer_motion_guide.pdf", similarity: "88.7%", snippet: "Spring transitions and layout animations provide smooth 60fps UI renders." },
                { doc: "chromadb_config.txt", similarity: "84.1%", snippet: "Distance metric: Cosine similarity with 384-dimensional dense vectors." }
              ].map((res, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {res.doc}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      Match: {res.similarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">{res.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Research Assistant */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
            <h2 className="text-base font-semibold text-white">Multi-Document Synthesizer</h2>
            <p className="text-xs text-slate-400">Select documents to synthesize into an integrated research brief.</p>

            <div className="flex flex-wrap gap-2">
              {['framer_motion_guide.pdf', 'fastapi_quickstart.md', 'langchain_rag_pipeline.docx', 'chromadb_config.txt'].map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    selectedDocs.includes(doc)
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {selectedDocs.includes(doc) ? '✓ ' : '+ '}{doc}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
                <span>Integrated Synthesized Brief ({selectedDocs.length} Documents)</span>
                <span className="text-purple-400 font-semibold">Confidence: 96.8%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The selected documents establish a full-stack architecture combining a FastAPI Python backend (SQLAlchemy ORM + JWT security) with a high-performance React Vite frontend powered by Framer Motion animations and ChromaDB local vector storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Compare Documents */}
      {activeTab === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c101d] border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-cyan-400 font-mono">Document A: fastapi_quickstart.md</span>
            <p className="text-xs text-slate-300">FastAPI backend utilizing async Python 3.12, Uvicorn server, and Pydantic v2 schemas.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0c101d] border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-purple-400 font-mono">Document B: langchain_rag_pipeline.docx</span>
            <p className="text-xs text-slate-300">LangChain pipeline chunking text into 500-character segments with sentence-transformer embeddings.</p>
          </div>
        </div>
      )}

      {/* Tab Content 5: Explain Selection */}
      {activeTab === 'explain' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h2 className="text-base font-semibold text-white">Selection Explainer</h2>
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-cyan-200 font-mono">
            "{explainText}"
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-purple-400">AI Explanation:</span>
            <p>RAG first queries the ChromaDB vector database to retrieve text snippets matching the user's question, then appends those snippets to the LLM prompt. This prevents hallucination and grounds every answer in verifiable source documents.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
