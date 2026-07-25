import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Globe, 
  Video, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Cpu 
} from 'lucide-react';
import GradientText from '../GradientText';

export default function UploadCenterSection({ 
  onFileUpload, 
  onUrlIngest, 
  youtubeUrl, 
  setYoutubeUrl, 
  articleUrl, 
  setArticleUrl, 
  uploadTasks 
}) {
  const [dragActive, setDragActive] = useState(false);

  const mockQueue = uploadTasks.length > 0 ? uploadTasks : [
    { id: 101, name: 'MachineLearning_Advanced.pdf', size: '3.4 MB', progress: 100, status: 'Ready (Indexed in ChromaDB)' },
    { id: 102, name: 'FastAPI_Architecture.md', size: '48 KB', progress: 80, status: 'Generating embeddings (all-MiniLM-L6-v2)...' },
    { id: 103, name: 'YouTube: System Design Masterclass', size: 'Transcript', progress: 40, status: 'Extracting text chunks & citations...' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-[#0c101d] border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1 font-mono">
          <Upload className="w-4 h-4" />
          <span>INGESTION ENGINE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Upload Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingest raw documents, web articles, or YouTube videos to automatically parse, chunk, embed, and index into your Knowledge Vault.
        </p>
      </div>

      {/* 3 Upload Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Document Upload */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); onFileUpload(e); }}
          className={`relative p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-[#0c101d] border transition-all duration-200 backdrop-blur-xl flex flex-col justify-between ${
            dragActive ? 'border-cyan-400 bg-cyan-500/20 scale-[1.02]' : 'border-cyan-500/30 hover:border-cyan-400/60'
          }`}
        >
          <div>
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 w-fit mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-white">Upload Documents</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Drag & drop PDFs, Markdown, DOCX, or TXT files. Maximum 50MB per file.
            </p>
          </div>

          <div className="mt-6">
            <label className="block w-full text-center py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-all cursor-pointer">
              Choose Files
              <input type="file" multiple onChange={onFileUpload} className="hidden" accept=".pdf,.md,.docx,.txt" />
            </label>
            <span className="block text-[10px] text-center text-slate-500 mt-2 font-mono">Status: Ready to ingest</span>
          </div>
        </div>

        {/* Card 2: Website Article Ingest */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900/60 to-[#0c101d] border border-purple-500/30 hover:border-purple-400/60 transition-all duration-200 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 w-fit mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-white">Ingest Web Article</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Extract clean text and citations from any documentation page or public article URL.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <input 
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={() => onUrlIngest('article', articleUrl, setArticleUrl)}
              className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Fetch & Embed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: YouTube Transcript Ingest */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-slate-900/60 to-[#0c101d] border border-pink-500/30 hover:border-pink-400/60 transition-all duration-200 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 w-fit mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-white">YouTube Transcript</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Auto-fetch video transcripts, generate timestamps, and index key lecture insights.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <input 
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
            />
            <button
              onClick={() => onUrlIngest('youtube', youtubeUrl, setYoutubeUrl)}
              className="w-full py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold border border-pink-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Extract Transcript</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Processing Queue Pipeline */}
      <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Processing & Vector Indexing Queue
          </h2>
          <span className="text-xs text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Active Pipeline
          </span>
        </div>

        <div className="space-y-3">
          {mockQueue.map((task) => (
            <div key={task.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {task.progress === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                  <span className="text-xs font-semibold text-white">{task.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{task.size}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-500 ${
                    task.progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{task.status || 'Processing...'}</span>
                <span>{task.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
