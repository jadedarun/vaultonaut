import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Layers, 
  GraduationCap, 
  FileText, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  X, 
  Award 
} from 'lucide-react';

export default function LearningStudioSection() {
  const [activeTool, setActiveTool] = useState('flashcards'); // summary | flashcards | quiz | notes | planner
  
  // Flashcard States
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // Quiz States
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const FLASHCARDS = [
    {
      q: 'What vector database does Vaultonaut use?',
      a: 'Vaultonaut uses ChromaDB, a lightweight open-source vector database, to store document chunk embeddings locally.'
    },
    {
      q: 'What embedding model is used for semantic representation?',
      a: 'It uses sentence-transformers/all-MiniLM-L6-v2, converting text chunks into dense vectors.'
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

  const tools = [
    { id: 'flashcards', label: 'AI Flashcards', icon: Layers },
    { id: 'quiz', label: 'AI Quiz', icon: GraduationCap },
    { id: 'summary', label: 'Summaries', icon: FileText },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'planner', label: 'Study Planner', icon: Calendar }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
    >
      {/* Top Learning Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid var(--glass-border)' }}>
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={isActive ? 'btn-white-solid' : 'btn-white-outline'}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={14} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool 1: Flashcards */}
      {activeTool === 'flashcards' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '2rem' }}>
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
                <span className="flashcard-meta" style={{ color: 'var(--color-arctic-3)' }}>Answer</span>
                <div className="flashcard-body">{FLASHCARDS[fcIndex].a}</div>
                <span className="flashcard-instructions" style={{ color: 'var(--color-arctic-3)' }}>Click to see question</span>
              </div>
            </div>
          </div>

          <div className="flashcard-controls" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button 
              className="btn-white-outline"
              disabled={fcIndex === 0}
              onClick={() => {
                setFcFlipped(false);
                setTimeout(() => setFcIndex(prev => Math.max(0, prev - 1)), 150);
              }}
            >
              Previous Card
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
      )}

      {/* Tool 2: Quiz */}
      {activeTool === 'quiz' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '2rem' }}>
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
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', lineHeight: '1.4', marginTop: '1rem' }}>
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
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={quizSelected === null}
                onClick={() => setQuizSubmitted(true)}
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tool 3: Summaries, Notes & Planner */}
      {(activeTool === 'summary' || activeTool === 'notes' || activeTool === 'planner') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Quick Summary', desc: 'Synthesized 2-paragraph overview highlighting key architectural takeaways.' },
            { title: 'Detailed Breakdown', desc: 'In-depth section-by-section breakdown of core concepts and formulas.' },
            { title: 'Cheat Sheet', desc: 'FastAPI Depends() injects DB session, validates JWT bearer tokens.' },
            { title: '4-Day Roadmap', desc: 'Day 1: Ingestion -> Day 2: Search -> Day 3: Flashcards -> Day 4: Quiz' }
          ].map((n, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>{n.title}</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>{n.desc}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
