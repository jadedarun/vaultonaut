import { useState, useEffect } from 'react';
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
  Award,
  AlertTriangle
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import * as documentAPI from '../../api/documents';

export default function LearningStudioSection() {
  const { documents } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [activeTool, setActiveTool] = useState('flashcards'); // summary | flashcards | quiz | notes | planner
  
  // Loaded Data States
  const [flashcards, setFlashcards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | generating | completed | error
  const [generatingProgress, setGeneratingProgress] = useState(false);

  // Flashcard States
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // Quiz States
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Auto-select first completed document on load
  useEffect(() => {
    if (documents && documents.length > 0 && !selectedDocId) {
      const completed = documents.find(d => d.status === 'completed');
      if (completed) {
        setSelectedDocId(completed.id);
      }
    }
  }, [documents, selectedDocId]);

  // Fetch materials whenever active document changes
  const fetchStudyMaterials = async (docId) => {
    if (!docId) return;
    setStatus('loading');
    try {
      const fcResponse = await documentAPI.getDocumentFlashcards(docId);
      const quizResponse = await documentAPI.getDocumentQuiz(docId);

      if (fcResponse.status === 'generating') {
        setStatus('generating');
        // Poll status every 3 seconds
        setTimeout(() => fetchStudyMaterials(docId), 3000);
        return;
      }

      setFlashcards(fcResponse.flashcards || []);
      setQuizQuestions(quizResponse.quiz?.questions || []);
      setStatus('completed');
      setFcIndex(0);
      setQuizIndex(0);
      setQuizSelected(null);
      setQuizSubmitted(false);
      setScore(0);
    } catch (err) {
      console.warn('Failed to fetch study materials:', err);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (selectedDocId) {
      fetchStudyMaterials(selectedDocId);
    }
  }, [selectedDocId]);

  const handleManualTrigger = async () => {
    if (!selectedDocId) return;
    setGeneratingProgress(true);
    try {
      await documentAPI.generateDocumentFlashcards(selectedDocId);
      setStatus('generating');
      fetchStudyMaterials(selectedDocId);
    } catch (e) {
      console.warn(e);
      setStatus('error');
    } finally {
      setGeneratingProgress(false);
    }
  };

  const tools = [
    { id: 'flashcards', label: 'AI Flashcards', icon: Layers },
    { id: 'quiz', label: 'AI Quiz', icon: GraduationCap },
    { id: 'summary', label: 'Summaries', icon: FileText },
    { id: 'notes', label: 'Study Notes', icon: BookOpen },
    { id: 'planner', label: 'Study Planner', icon: Calendar }
  ];

  const currentDoc = documents.find(d => d.id === selectedDocId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
    >
      {/* Document Selection Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)', margin: 0 }}>
          Study Library Selector
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Select a document from your vault to load its AI-generated study cards and quizzes.
        </p>
        
        {documents.filter(d => d.status === 'completed').length === 0 ? (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#fca5a5' }}>
            No completed documents found. Go to the Upload Center and upload a document to get started.
          </div>
        ) : (
          <select 
            value={selectedDocId} 
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="input-field"
            style={{ 
              width: '100%', 
              maxWidth: '450px', 
              padding: '0.55rem 0.8rem', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '0.5rem', 
              color: '#fff',
              fontSize: '0.88rem'
            }}
          >
            <option value="">-- Choose a document to study --</option>
            {documents.filter(d => d.status === 'completed').map(doc => (
              <option key={doc.id} value={doc.id}>{doc.original_filename}</option>
            ))}
          </select>
        )}
      </div>

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

      {/* Tab Panel Renderings */}
      {!selectedDocId ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Please select a study document above to initialize AI learning materials.
        </div>
      ) : status === 'loading' ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: 'var(--color-arctic-1)', marginLeft: 'auto', marginRight: 'auto' }} />
          <div>Loading study materials...</div>
        </div>
      ) : status === 'generating' ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <RefreshCw size={32} className="spin-icon" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: 'var(--color-arctic-1)', marginLeft: 'auto', marginRight: 'auto' }} />
          <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Creating study cards...</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Gemini is synthesizing flashcards and quizzes from your document.</p>
        </div>
      ) : status === 'error' ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={32} color="#f87171" />
          <div>
            <h4 style={{ margin: 0, color: '#fff' }}>Failed to load study cards</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>There was an error retrieving or generating the AI cards for this document.</p>
          </div>
          <button className="btn-action" onClick={handleManualTrigger} disabled={generatingProgress}>
            {generatingProgress ? 'Starting...' : 'Generate Flashcards & Quiz'}
          </button>
        </div>
      ) : (
        <>
          {/* Tool 1: Flashcards */}
          {activeTool === 'flashcards' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '2rem' }}>
              {flashcards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Study cards couldn't be generated yet for this document.</p>
                  <button className="btn-action" onClick={handleManualTrigger} disabled={generatingProgress}>
                    {generatingProgress ? 'Generating...' : 'Generate Study Cards'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="card-header-row">
                    <h2 className="card-title"><Layers size={20} className="logo-icon" /> AI Flashcards</h2>
                    <span className="badge-tag">Card {fcIndex + 1} of {flashcards.length}</span>
                  </div>
                  <p className="card-desc">Interactive flashcards synthesized automatically from {currentDoc?.original_filename || 'document'}. Click the card to flip it and view the definition.</p>
                  
                  <div className="flashcard-wrapper" onClick={() => setFcFlipped(!fcFlipped)}>
                    <div className={`flashcard ${fcFlipped ? 'flipped' : ''}`}>
                      <div className="flashcard-side flashcard-front">
                        <span className="flashcard-meta">Question</span>
                        <div className="flashcard-body">{flashcards[fcIndex].q}</div>
                        <span className="flashcard-instructions">Click to reveal answer</span>
                      </div>
                      <div className="flashcard-side flashcard-back">
                        <span className="flashcard-meta" style={{ color: 'var(--color-arctic-3)' }}>Answer</span>
                        <div className="flashcard-body">{flashcards[fcIndex].a}</div>
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
                      disabled={fcIndex === flashcards.length - 1}
                      onClick={() => {
                        setFcFlipped(false);
                        setTimeout(() => setFcIndex(prev => Math.min(flashcards.length - 1, prev + 1)), 150);
                      }}
                    >
                      Next Card
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tool 2: Quiz */}
          {activeTool === 'quiz' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '2rem' }}>
              {quizQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>AI study quiz is not generated yet for this document.</p>
                  <button className="btn-action" onClick={handleManualTrigger} disabled={generatingProgress}>
                    {generatingProgress ? 'Generating...' : 'Generate AI Quiz'}
                  </button>
                </div>
              ) : quizIndex >= quizQuestions.length ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Award size={48} color="var(--color-arctic-1)" />
                  <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>Quiz Completed!</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      You scored {score} out of {quizQuestions.length} correct.
                    </p>
                  </div>
                  <button 
                    className="btn-white-solid" 
                    onClick={() => {
                      setQuizIndex(0);
                      setQuizSelected(null);
                      setQuizSubmitted(false);
                      setScore(0);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="card-header-row">
                    <h2 className="card-title"><GraduationCap size={20} className="logo-icon" /> AI-Generated Quiz</h2>
                    <span className="badge-tag">Question {quizIndex + 1} of {quizQuestions.length}</span>
                  </div>
                  <p className="card-desc">Self-evaluation multiple choice questions generated strictly from {currentDoc?.original_filename || 'material'}.</p>

                  <div className="quiz-question-box" style={{ marginTop: '0.5rem' }}>
                    <p className="quiz-question-text" style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                      {quizQuestions[quizIndex].question}
                    </p>
                    
                    <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {quizQuestions[quizIndex].options.map((opt, idx) => {
                        let optionClass = 'quiz-option-btn';
                        const isCorrectOpt = idx === quizQuestions[quizIndex].answer_idx;
                        
                        if (quizSelected === idx) optionClass += ' selected';
                        if (quizSubmitted) {
                          if (isCorrectOpt) optionClass += ' correct';
                          else if (quizSelected === idx) optionClass += ' incorrect';
                        }

                        return (
                          <button 
                            key={idx}
                            className={optionClass}
                            disabled={quizSubmitted}
                            onClick={() => setQuizSelected(idx)}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrectOpt && <CheckCircle size={16} color="#10b981" />}
                            {quizSubmitted && !isCorrectOpt && quizSelected === idx && <X size={16} color="#ef4444" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted ? (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', lineHeight: '1.4', marginTop: '1.2rem' }}>
                        <p style={{ fontWeight: '600', color: 'var(--color-arctic-3)', marginBottom: '0.3rem' }}>Explanation:</p>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{quizQuestions[quizIndex].explanation}</p>
                        <button 
                          className="btn-white-solid" 
                          style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                          onClick={() => {
                            if (quizSelected === quizQuestions[quizIndex].answer_idx) {
                              setScore(prev => prev + 1);
                            }
                            setQuizIndex(prev => prev + 1);
                            setQuizSelected(null);
                            setQuizSubmitted(false);
                          }}
                        >
                          {quizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn-action" 
                        style={{ width: '100%', marginTop: '1.2rem' }}
                        disabled={quizSelected === null}
                        onClick={() => setQuizSubmitted(true)}
                      >
                        Submit Answer
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tool 3: Summaries, Notes & Planner */}
          {(activeTool === 'summary' || activeTool === 'notes' || activeTool === 'planner') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {flashcards.length === 0 ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                  No study cards available. Generate study materials above to unlock summaries and roadmap sheets.
                </div>
              ) : (
                <>
                  <div className="glass-card" style={{ padding: '1.2rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>AI Summary Quick Insights</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      This document contains key concepts including <strong>{flashcards[0]?.q?.replace('?', '') || 'core subjects'}</strong>. Use AI Flashcards to review and flip cards to internalize terminology.
                    </p>
                  </div>
                  <div className="glass-card" style={{ padding: '1.2rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>Key Terms to Master</span>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
                      {flashcards.slice(0, 3).map((fc, i) => (
                        <li key={i}>{fc.q.replace(/What is |Explain /g, '')}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card" style={{ padding: '1.2rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>Study Guide Tip</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      Ask questions about this file inside the <strong>AI Workspace</strong> for deep RAG grounded answers referencing page citations.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
