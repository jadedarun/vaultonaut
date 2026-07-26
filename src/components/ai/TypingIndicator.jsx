import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Database, Layers, Sparkles } from 'lucide-react';

const THINKING_STAGES = [
  { text: 'Searching 384d vector embeddings in ChromaDB...', icon: Database },
  { text: 'Filtering context & merging source citations...', icon: Layers },
  { text: 'Generating grounded response via Google Gemini...', icon: Sparkles }
];

export default function TypingIndicator() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex(prev => (prev + 1) % THINKING_STAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const currentStage = THINKING_STAGES[stageIndex];
  const StageIcon = currentStage.icon;

  return (
    <div className="chat-msg system" style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.8rem' }}>
      <div 
        className="avatar" 
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: 'var(--color-arctic-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Cpu size={16} />
      </div>

      <div 
        className="msg-bubble"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0.2rem 1rem 1rem 1rem',
          padding: '0.7rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: 'var(--color-arctic-1)',
          fontSize: '0.85rem',
          transition: 'all 0.3s ease'
        }}
      >
        <RefreshCw size={14} className="logo-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <StageIcon size={13} />
          {currentStage.text}
        </span>
      </div>
    </div>
  );
}
