import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Layers, 
  GraduationCap, 
  FileText, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Award, 
  HelpCircle, 
  Check 
} from 'lucide-react';
import GradientText from '../GradientText';

export default function LearningStudioSection() {
  const [activeTool, setActiveTool] = useState('flashcards'); // summary | flashcards | quiz | notes | planner
  
  // Flashcard States
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // Quiz States
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizType, setQuizType] = useState('MCQ');
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const FLASHCARDS = [
    {
      q: 'What vector database does Vaultonaut use?',
      a: 'Vaultonaut uses ChromaDB, a lightweight open-source vector database, to store document chunk embeddings locally.'
    },
    {
      q: 'What embedding model is used for semantic representation?',
      a: 'It uses sentence-transformers/all-MiniLM-L6-v2, converting text chunks into 384-dimensional dense vectors.'
    },
    {
      q: 'What is the role of RAG in this application?',
      a: 'Retrieval-Augmented Generation (RAG) queries ChromaDB for relevant text chunks and passes them as context to the LLM to write answers with grounded citations.'
    },
    {
      q: 'What is FastAPI dependency injection?',
      a: 'FastAPI Depends() injects database sessions and decodes JWT bearer tokens automatically on protected endpoints.'
    }
  ];

  const tools = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quiz Generator', icon: GraduationCap },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'planner', label: 'Study Planner', icon: Calendar }
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
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1 font-mono">
          <GraduationCap className="w-4 h-4" />
          <span>REVISION & MASTERY</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Learning Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Transform your ingested document vault into interactive flashcards, self-grading quizzes, chapter summaries, and day-by-day study roadmaps.
        </p>
      </div>

      {/* 5 Premium Sub-Tool Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool 1: Summary */}
      {activeTool === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Quick Summary', desc: 'A 2-paragraph overview highlighting key architectural takeaways.' },
            { title: 'Detailed Summary', desc: 'In-depth section-by-section breakdown of core concepts and formulas.' },
            { title: 'Chapter Summary', desc: 'Structured chapter breakdown with bulleted definitions and diagrams.' },
            { title: 'Executive Summary', desc: 'High-level synthesis formatted for rapid decision making.' }
          ].map((sum, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0c101d] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-amber-400 font-mono">{sum.title}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{sum.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tool 2: Flashcards */}
      {activeTool === 'flashcards' && (
        <div className="p-8 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center min-h-[320px] space-y-6">
          <div className="flex items-center justify-between w-full max-w-lg text-xs font-mono text-slate-400">
            <span>Card {fcIndex + 1} of {FLASHCARDS.length}</span>
            <span>Click card to flip</span>
          </div>

          <motion.div
            onClick={() => setFcFlipped(!fcFlipped)}
            animate={{ rotateY: fcFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0e1322] to-slate-950 border border-amber-500/30 shadow-2xl cursor-pointer min-h-[180px] flex items-center justify-center text-center"
          >
            <div style={{ transform: fcFlipped ? 'rotateY(180deg)' : 'none' }}>
              <p className="text-xs font-mono text-amber-400 mb-2 uppercase">
                {fcFlipped ? 'Answer' : 'Question'}
              </p>
              <p className="text-sm font-semibold text-white">
                {fcFlipped ? FLASHCARDS[fcIndex].a : FLASHCARDS[fcIndex].q}
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setFcFlipped(false); setFcIndex((fcIndex + 1) % FLASHCARDS.length); }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-all"
            >
              Next Card →
            </button>
            <button
              onClick={() => { setFcFlipped(false); setFcIndex(Math.floor(Math.random() * FLASHCARDS.length)); }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Shuffle
            </button>
          </div>
        </div>
      )}

      {/* Tool 3: Quiz Generator */}
      {activeTool === 'quiz' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Difficulty:</span>
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setQuizDifficulty(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                    quizDifficulty === d ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-medium">Type:</span>
              {['MCQ', 'True/False', 'Short Answer', 'Coding'].map(t => (
                <button
                  key={t}
                  onClick={() => setQuizType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                    quizType === t ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Q: Which of the following describes the core advantage of a Retrieval-Augmented Generation (RAG) system?
            </h3>

            <div className="space-y-2">
              {[
                { id: 0, text: 'It speeds up network requests by caching API payloads locally.' },
                { id: 1, text: 'It grounds LLM responses in verifiable private data, minimizing hallucinations and enabling source citations.', correct: true },
                { id: 2, text: 'It automatically formats database schemas to PostgreSQL using AI.' },
                { id: 3, text: 'It compiles React code into WebAssembly for high performance.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setQuizSelected(opt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    quizSelected === opt.id 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <button
              onClick={() => setQuizSubmitted(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
            >
              Submit Answer
            </button>

            {quizSubmitted && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                ✓ Correct! RAG retrieves relevant private document chunks matching the query and prompts the LLM using this text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 4: Study Notes */}
      {activeTool === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Formula Sheet', desc: 'Vector cosine similarity formula: cos(θ) = (A · B) / (||A|| ||B||)' },
            { title: 'Cheat Sheet', desc: 'FastAPI Depends() injects DB session, validates JWT bearer tokens.' },
            { title: 'Revision Notes', desc: 'ChromaDB persists embeddings locally in SQLite + parquet vector tables.' },
            { title: 'Key Definitions', desc: 'Chunking breaks 10k character documents into 500-char segments.' }
          ].map((n, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0c101d] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-amber-400 font-mono">{n.title}</span>
              <p className="text-xs text-slate-300">{n.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tool 5: Study Planner Roadmap */}
      {activeTool === 'planner' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h2 className="text-base font-semibold text-white">4-Day Mastery Roadmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { day: 'Day 1', title: 'Document Ingestion', desc: 'Upload PDFs, chunk text, build vector index.' },
              { day: 'Day 2', title: 'Semantic Search', desc: 'Test RAG queries with cosine similarity matching.' },
              { day: 'Day 3', title: 'Flashcard Drills', desc: 'Review top 50 AI engineering cards.' },
              { day: 'Day 4', title: 'Final Quiz Exam', desc: 'Take 20-question randomized MCQ quiz.' }
            ].map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 font-mono">{d.day}</span>
                <h4 className="text-xs font-semibold text-white">{d.title}</h4>
                <p className="text-[11px] text-slate-400">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
