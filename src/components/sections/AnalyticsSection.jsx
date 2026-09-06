import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  MessageSquare, 
  Clock, 
  FileText, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  Send, 
  Upload, 
  HardDrive, 
  Award,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getAnalyticsOverview } from '../../api/analytics';

export default function AnalyticsSection() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d'); // '7d' | '30d' | 'all'
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (range = timeRange, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getAnalyticsOverview(range);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load user learning analytics:', err);
      setError('Could not load your analytics. Please verify your connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleRefresh = () => {
    fetchAnalytics(timeRange, true);
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const navigateToConversation = (convId) => {
    if (convId) {
      localStorage.setItem('active_conversation_id', convId);
    }
    navigate('/ai-workspace');
  };

  if (loading && !analytics) {
    return (
      <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <RefreshCw 
          size={32} 
          style={{ 
            animation: 'spin 1.5s linear infinite', 
            color: 'var(--color-arctic-1)', 
            margin: '0 auto 1.2rem auto' 
          }} 
        />
        <h3 style={{ margin: 0, color: 'var(--color-arctic-1)' }}>Loading Your Learning Analytics</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Aggregating your vault documents, study conversations, and learning progress...
        </p>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ color: 'var(--color-arctic-1)', margin: 0 }}>Analytics Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
        <button 
          className="btn-white-solid" 
          onClick={() => fetchAnalytics(timeRange)} 
          style={{ marginTop: '1.5rem', marginInline: 'auto' }}
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const {
    has_data,
    overview,
    knowledge_library,
    study_activity,
    most_studied,
    learning_progress,
    recent_activity,
    insights
  } = analytics || {};

  // Empty State for Brand New Users
  if (!has_data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}
      >
        {/* Header */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge-tag" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={12} /> Personal Learning & Knowledge Analytics
              </span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--color-arctic-1)' }}>
                Analytics
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                Understand your knowledge, study activity, and learning progress.
              </p>
            </div>
            <button 
              className="btn-white-outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--glass-border)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-arctic-1)'
          }}>
            <BarChart2 size={32} />
          </div>

          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-arctic-1)', margin: '0 0 0.6rem 0' }}>
              Your learning analytics will appear here
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Upload a document, start an AI study conversation, or generate study cards to begin building your personal knowledge and learning history.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button className="btn-white-solid" onClick={() => navigate('/upload-center')}>
              <Upload size={16} /> Upload Material
            </button>
            <button className="btn-white-outline" onClick={() => navigate('/ai-workspace')}>
              <Send size={16} /> Start a Conversation
            </button>
            <button className="btn-white-outline" onClick={() => navigate('/learning-studio')}>
              <GraduationCap size={16} /> Open Learning Studio
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate max daily activity for scaling SVG trend
  const dailyPoints = study_activity?.daily_activity || [];
  const maxDailyQuestions = Math.max(...dailyPoints.map(p => p.questions), 1);
  const maxDailyDocs = Math.max(...dailyPoints.map(p => p.documents), 1);
  const maxActivityValue = Math.max(maxDailyQuestions, maxDailyDocs, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}
    >
      {/* 1. Page Header & Time Range Filter */}
      <div className="glass-card" style={{ padding: '1.8rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
          <div>
            <span className="badge-tag" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={12} /> Personal Learning & Knowledge Analytics
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--color-arctic-1)' }}>
              Analytics
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
              Understand your knowledge, study activity, and learning progress.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            {/* Time Filter Pill Buttons */}
            <div style={{ 
              display: 'flex', 
              background: 'var(--input-bg)', 
              borderRadius: '0.5rem', 
              padding: '0.25rem', 
              border: '1px solid var(--glass-border)' 
            }}>
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => handleTimeRangeChange(f.id)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.85rem',
                    fontWeight: timeRange === f.id ? 600 : 500,
                    borderRadius: '0.35rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeRange === f.id ? 'var(--color-arctic-1)' : 'transparent',
                    color: timeRange === f.id ? 'var(--bg-dark)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button 
              className="btn-white-outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              title="Refresh Analytics"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.8rem' }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
              <span style={{ fontSize: '0.85rem' }}>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overview Metrics Cards (Real DB Values) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.2rem' 
      }}>
        {/* Card 1: Documents */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Documents</span>
            <div style={{ color: 'var(--color-arctic-1)' }}><FileText size={18} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-arctic-1)', lineHeight: 1.1 }}>
            {overview?.total_documents || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
            Knowledge materials in your vault
          </p>
          <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-arctic-2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            {overview?.ai_ready_documents || 0} indexed & ready for study
          </div>
        </div>

        {/* Card 2: Conversations */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Conversations</span>
            <div style={{ color: 'var(--color-arctic-1)' }}><MessageSquare size={18} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-arctic-1)', lineHeight: 1.1 }}>
            {overview?.total_conversations || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
            AI study conversations
          </p>
          <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Across all saved learning sessions
          </div>
        </div>

        {/* Card 3: Study Materials */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Study Materials</span>
            <div style={{ color: 'var(--color-arctic-1)' }}><Layers size={18} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-arctic-1)', lineHeight: 1.1 }}>
            {overview?.total_study_materials || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
            Flashcards and quizzes generated
          </p>
          <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--color-arctic-2)' }}>
            {overview?.total_flashcards || 0} cards • {overview?.total_quiz_questions || 0} quiz items
          </div>
        </div>

        {/* Card 4: Questions Asked */}
        <div className="glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Questions Asked</span>
            <div style={{ color: 'var(--color-arctic-1)' }}><Send size={18} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-arctic-1)', lineHeight: 1.1 }}>
            {overview?.total_questions_asked || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
            Questions asked across your sessions
          </p>
          <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {study_activity?.period_questions || 0} asked in this {timeRange}
          </div>
        </div>
      </div>

      {/* 3. Personal Learning Insights (Deterministic factual insights) */}
      {insights && insights.length > 0 && (
        <div className="glass-card" style={{ padding: '1.8rem 2rem' }}>
          <div className="card-header-row" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
              <Sparkles size={18} className="logo-icon" /> Learning Insights
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Based on your actual library & study history
            </span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem' 
          }}>
            {insights.map(ins => (
              <div 
                key={ins.id}
                style={{ 
                  background: 'var(--input-bg)', 
                  padding: '1.1rem 1.2rem', 
                  borderRadius: '0.6rem', 
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: ins.type === 'success' ? '#10b981' : ins.type === 'highlight' ? 'var(--color-arctic-1)' : 'var(--color-arctic-4)'
                  }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>
                    {ins.title}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Two-Column Layout: Knowledge Library & AI Study Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Knowledge Library Analysis */}
        <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div className="card-header-row">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <BookOpen size={18} className="logo-icon" /> Knowledge Library Analysis
            </h2>
            <button 
              className="btn-white-outline" 
              onClick={() => navigate('/knowledge-vault')}
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
            >
              Open Vault <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.8rem', 
            background: 'var(--input-bg)', 
            padding: '1rem', 
            borderRadius: '0.6rem',
            border: '1px solid var(--glass-border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Storage</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginTop: '0.2rem' }}>
                {knowledge_library?.total_storage_mb || 0} MB
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Reading</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginTop: '0.2rem' }}>
                {knowledge_library?.total_reading_time_mins || 0} mins
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Word Count</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginTop: '0.2rem' }}>
                {(knowledge_library?.total_words || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Document Types Distribution */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>
                Document Format Distribution
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {knowledge_library?.total_documents || 0} total files
              </span>
            </div>

            {knowledge_library?.file_type_distribution && knowledge_library.file_type_distribution.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Proportional Stacked Bar */}
                <div style={{ 
                  height: 10, 
                  borderRadius: 5, 
                  display: 'flex', 
                  overflow: 'hidden', 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)'
                }}>
                  {knowledge_library.file_type_distribution.map((item, idx) => {
                    const colors = ['#ffffff', '#a1a1aa', '#71717a', '#3f3f46'];
                    return (
                      <div 
                        key={item.extension}
                        title={`${item.extension}: ${item.count} files (${item.percentage}%)`}
                        style={{ 
                          width: `${item.percentage}%`, 
                          background: colors[idx % colors.length] 
                        }}
                      />
                    );
                  })}
                </div>

                {/* Legend Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.4rem' }}>
                  {knowledge_library.file_type_distribution.map(item => (
                    <div 
                      key={item.extension}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        fontSize: '0.8rem', 
                        padding: '0.25rem 0.6rem',
                        background: 'var(--input-bg)',
                        borderRadius: '0.35rem',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--color-arctic-1)' }}>{item.extension}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No file formats recorded.</p>
            )}
          </div>

          {/* Recently Uploaded Documents */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'block', marginBottom: '0.6rem' }}>
              Recently Added to Vault
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {knowledge_library?.recent_documents && knowledge_library.recent_documents.length > 0 ? (
                knowledge_library.recent_documents.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => navigate('/knowledge-vault')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem', 
                      background: 'var(--input-bg)', 
                      borderRadius: '0.45rem',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <span className="badge-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                        {doc.file_extension}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-arctic-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{doc.file_size_formatted}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(doc.uploaded_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Study Activity & Trend */}
        <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div className="card-header-row">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <BarChart2 size={18} className="logo-icon" /> AI Study Activity
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Period: {timeRange === '7d' ? 'Past 7 Days' : timeRange === '30d' ? 'Past 30 Days' : 'All Time'}
            </span>
          </div>

          {/* Period Summary Pills */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.8rem', 
            background: 'var(--input-bg)', 
            padding: '1rem', 
            borderRadius: '0.6rem',
            border: '1px solid var(--glass-border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginTop: '0.2rem' }}>
                {study_activity?.period_questions || 0}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversations</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginTop: '0.2rem' }}>
                {study_activity?.period_conversations || 0}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Materials</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginTop: '0.2rem' }}>
                {study_activity?.period_materials || 0}
              </div>
            </div>
          </div>

          {/* Daily Activity Chart (Clean SVG Histogram backed by real database timestamps) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>
                Activity Trend
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, background: 'var(--color-arctic-1)', borderRadius: 2 }}></span>
                  Questions
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, background: '#71717a', borderRadius: 2 }}></span>
                  Documents
                </span>
              </div>
            </div>

            {dailyPoints.length > 0 ? (
              <div style={{ 
                background: 'var(--input-bg)', 
                padding: '1.2rem 1rem 0.8rem 1rem', 
                borderRadius: '0.6rem',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: timeRange === '7d' ? '12px' : '4px', 
                  height: 120,
                  paddingBottom: '0.4rem',
                  borderBottom: '1px solid var(--glass-border)'
                }}>
                  {dailyPoints.map(p => {
                    const qHeight = Math.max(Math.round((p.questions / maxActivityValue) * 100), p.questions > 0 ? 8 : 2);
                    const dHeight = Math.max(Math.round((p.documents / maxActivityValue) * 100), p.documents > 0 ? 8 : 2);

                    return (
                      <div 
                        key={p.date}
                        style={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          height: '100%', 
                          justifyContent: 'flex-end',
                          gap: 2
                        }}
                        title={`${p.label}: ${p.questions} questions, ${p.documents} docs, ${p.study_materials} materials`}
                      >
                        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                          <div 
                            style={{ 
                              width: timeRange === '7d' ? 14 : 6, 
                              height: `${qHeight}%`, 
                              background: p.questions > 0 ? 'var(--color-arctic-1)' : 'rgba(255,255,255,0.06)',
                              borderRadius: '2px 2px 0 0'
                            }} 
                          />
                          <div 
                            style={{ 
                              width: timeRange === '7d' ? 14 : 6, 
                              height: `${dHeight}%`, 
                              background: p.documents > 0 ? '#71717a' : 'rgba(255,255,255,0.03)',
                              borderRadius: '2px 2px 0 0'
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Date Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>{dailyPoints[0]?.label}</span>
                  {dailyPoints.length > 2 && (
                    <span>{dailyPoints[Math.floor(dailyPoints.length / 2)]?.label}</span>
                  )}
                  <span>{dailyPoints[dailyPoints.length - 1]?.label}</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No activity in this time window.</p>
            )}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn-white-solid" 
              onClick={() => navigate('/ai-workspace')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Send size={16} /> Continue Study Conversation
            </button>
          </div>
        </div>
      </div>

      {/* 5. Most Studied Knowledge (Real citations from user's AI conversations) */}
      <div className="glass-card" style={{ padding: '1.8rem 2rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
              <Award size={18} className="logo-icon" /> Most Studied Knowledge
            </h2>
            <p className="card-desc" style={{ marginTop: '0.3rem' }}>
              Documents and topics most frequently cited to answer your study questions.
            </p>
          </div>
        </div>

        {most_studied && most_studied.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {most_studied.map(item => (
              <div 
                key={item.title}
                style={{ 
                  background: 'var(--input-bg)', 
                  padding: '1.2rem', 
                  borderRadius: '0.6rem', 
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge-tag" style={{ fontSize: '0.7rem' }}>
                    {item.file_extension}
                  </span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: item.query_citations_count > 0 ? 'var(--color-arctic-1)' : 'var(--text-muted)',
                    background: item.query_citations_count > 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.3rem'
                  }}>
                    {item.query_citations_count} {item.query_citations_count === 1 ? 'citation' : 'citations'}
                  </span>
                </div>

                <div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: 'var(--color-arctic-1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                    {item.query_citations_count > 0 
                      ? `Last cited: ${formatRelativeTime(item.last_studied_at)}`
                      : 'Not yet queried in study chats'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.4rem', borderTop: '1px solid var(--glass-border)' }}>
                  {item.has_flashcards && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-arctic-2)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={12} color="#10b981" /> Flashcards
                    </span>
                  )}
                  {item.has_quiz && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-arctic-2)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={12} color="#10b981" /> Quiz
                    </span>
                  )}
                  {!item.has_flashcards && !item.has_quiz && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      No study cards created
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            No document queries recorded yet. Ask questions in the AI Workspace to track your most studied topics.
          </p>
        )}
      </div>

      {/* 6. Learning Progress & Quiz Readiness */}
      <div className="glass-card" style={{ padding: '1.8rem 2rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1.2rem' }}>
          <div>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
              <GraduationCap size={18} className="logo-icon" /> Learning Progress & Practice
            </h2>
            <p className="card-desc" style={{ marginTop: '0.3rem' }}>
              Track self-assessment materials synthesized from your vault documents.
            </p>
          </div>
          <button 
            className="btn-white-solid" 
            onClick={() => navigate('/learning-studio')}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            Open Learning Studio <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {/* Flashcards Deck Status */}
          <div style={{ 
            background: 'var(--input-bg)', 
            padding: '1.2rem', 
            borderRadius: '0.6rem', 
            border: '1px solid var(--glass-border)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} /> Flashcard Decks
              </span>
              <span className="badge-tag" style={{ fontSize: '0.75rem' }}>
                {learning_progress?.flashcard_decks || 0} decks
              </span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-arctic-1)', margin: '0.4rem 0' }}>
              {learning_progress?.total_flashcards || 0} Cards
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Synthesized concept definitions ready for spaced repetition in the Learning Studio.
            </p>
          </div>

          {/* Quiz Readiness Status */}
          <div style={{ 
            background: 'var(--input-bg)', 
            padding: '1.2rem', 
            borderRadius: '0.6rem', 
            border: '1px solid var(--glass-border)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GraduationCap size={16} /> Practice Quizzes
              </span>
              <span className="badge-tag" style={{ fontSize: '0.75rem' }}>
                {learning_progress?.quizzes_available || 0} quizzes
              </span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-arctic-1)', margin: '0.4rem 0' }}>
              {learning_progress?.total_quiz_questions || 0} Questions
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Multiple-choice questions with AI-grounded explanations compiled from your vault.
            </p>
          </div>
        </div>

        {/* Honest learning progress state */}
        <div style={{ 
          marginTop: '1.2rem', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px dashed var(--glass-border)', 
          borderRadius: '0.5rem', 
          padding: '0.9rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <Clock size={18} color="var(--color-arctic-4)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {learning_progress?.message || 'Learning progress and quiz mastery scores will appear as you complete study sessions in the Learning Studio.'}
          </span>
        </div>
      </div>

      {/* 7. Recent Activity Stream (Real timestamps and events from PostgreSQL) */}
      <div className="glass-card" style={{ padding: '1.8rem 2rem' }}>
        <div className="card-header-row" style={{ marginBottom: '1.2rem' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
            <Clock size={18} className="logo-icon" /> Recent Activity
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Chronological audit of vault and study events
          </span>
        </div>

        {recent_activity && recent_activity.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {recent_activity.map(evt => {
              const isClickable = evt.target_type === 'conversation' || evt.target_type === 'document' || evt.target_type === 'knowledge';

              const handleClick = () => {
                if (evt.target_type === 'conversation') {
                  navigateToConversation(evt.target_id);
                } else if (evt.target_type === 'document') {
                  navigate('/knowledge-vault');
                } else if (evt.target_type === 'knowledge') {
                  navigate('/learning-studio');
                }
              };

              return (
                <div 
                  key={evt.id}
                  onClick={isClickable ? handleClick : undefined}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem', 
                    background: 'var(--input-bg)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid var(--glass-border)',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0 }}>
                    <div style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid var(--glass-border)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--color-arctic-1)',
                      flexShrink: 0
                    }}>
                      {evt.event_type === 'document_upload' && <Upload size={15} />}
                      {evt.event_type === 'document_processed' && <CheckCircle size={15} color="#10b981" />}
                      {evt.event_type === 'conversation_start' && <MessageSquare size={15} />}
                      {evt.event_type === 'question_asked' && <Send size={15} />}
                      {evt.event_type === 'study_material' && <GraduationCap size={15} />}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        color: 'var(--color-arctic-1)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {evt.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {evt.details}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                    {isClickable && <ChevronRight size={14} color="var(--text-muted)" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            No recorded activities yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}
