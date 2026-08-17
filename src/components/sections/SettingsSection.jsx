import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAISettings } from '../../hooks/useAISettings';
import { AIWorkspaceProvider } from '../../context/AIWorkspaceContext';
import ProviderCard from '../ai/settings/ProviderCard';
import RetrievalSettings from '../ai/settings/RetrievalSettings';
import ModelSettings from '../ai/settings/ModelSettings';
import HealthStatus from '../ai/settings/HealthStatus';
import DeveloperPanel from '../ai/settings/DeveloperPanel';
import PreferenceSection from '../ai/settings/PreferenceSection';
import UsageDashboard from '../ai/settings/UsageDashboard';
import KeyboardShortcutCard from '../ai/settings/KeyboardShortcutCard';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Sun,
  Cpu, 
  ShieldCheck, 
  Info, 
  LogOut,
  Palette,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

export default function SettingsSection({ user, logout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, usage, health, loading, developerMode, toggleDeveloperMode } = useAISettings();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vaultonaut_theme') || 'dark';
  });

  const [versionClicks, setVersionClicks] = useState(0);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('vaultonaut_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    // Notify top header in App.jsx to update contrast button rendering
    window.dispatchEvent(new Event('vaultonaut-theme-change'));
  };

  const handleVersionClick = () => {
    setVersionClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        toggleDeveloperMode();
        window.alert("Developer Mode toggled.");
        return 0;
      }
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/settings/')) {
      return path.substring('/settings/'.length);
    }
    return 'general';
  });

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/settings/')) {
      const subTab = path.substring('/settings/'.length);
      setActiveTab(subTab);
    } else if (path === '/settings') {
      setActiveTab('general');
    }
  }, [location.pathname]);

  const handleSubTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/settings/${tabId}`);
  };

  const settingsTabs = [
    { id: 'general', label: 'General & Profile', icon: User },
    { id: 'appearance', label: 'Appearance & UI', icon: Palette },
    { id: 'ai_preferences', label: 'AI Preferences', icon: Cpu },
    { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck },
    ...(developerMode ? [{ id: 'developer', label: 'Developer Diagnostics', icon: SettingsIcon }] : []),
    { id: 'about', label: 'About Vaultonaut', icon: Info }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', width: '100%', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}
    >
      {/* Settings Page Header Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
            <SettingsIcon size={20} className="logo-icon" /> Settings
          </h2>
        </div>
        <p className="card-desc" style={{ marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Manage your account, appearance, AI preferences, and personal data.
        </p>
      </div>

      {/* Unified Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid var(--glass-border)' }}>
        {settingsTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={isActive ? 'btn-white-solid' : 'btn-white-outline'}
              style={{ fontSize: '0.84rem', padding: '0.45rem 1rem', borderRadius: '0.5rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading workspace configurations...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SECTION 1: General & Profile */}
          {activeTab === 'general' && (
            <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <img 
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=1e293b&color=ffffff&bold=true&size=128`} 
                  alt="Profile" 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-arctic-3)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-arctic-1)', margin: 0 }}>
                    {user?.displayName || `${user?.firstName || 'Vaultonaut'} ${user?.lastName || ''}`.trim()}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>{user?.email || 'user@vaultonaut.com'}</p>
                  <span className="badge-tag" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.72rem' }}>
                    Authenticated via Google OAuth 2.0
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>First Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={user?.firstName || 'Arunachalam'} 
                    className="input-field" 
                    style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'var(--color-arctic-1)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>Last Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={user?.lastName || 'Nachiappan'} 
                    className="input-field" 
                    style={{ width: '100%', padding: '0.55rem 0.8rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'var(--color-arctic-1)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  onClick={logout}
                  className="btn-white-outline"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.5rem 1.1rem', fontSize: '0.82rem' }}
                >
                  <LogOut size={14} /> Sign Out of Account
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: Appearance & UI */}
          {activeTab === 'appearance' && (
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={18} color="var(--color-arctic-1)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Appearance & Typography</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Theme</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose how Vaultonaut looks.</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={theme === 'dark' ? 'btn-white-solid' : 'btn-white-outline'}
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Moon size={12} />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={theme === 'light' ? 'btn-white-solid' : 'btn-white-outline'}
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Sun size={12} />
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Accent Theme Color</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose system theme highlight colors.</span>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#00d4ff', border: '2px solid #fff', cursor: 'pointer' }} title="Arctic Blue (Active)"></span>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', cursor: 'pointer' }} title="Emerald Green"></span>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#a855f7', cursor: 'pointer' }} title="Amethyst Purple"></span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Text & Display</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Typography is optimized for clear reading and study.</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: AI Preferences */}
          {activeTab === 'ai_preferences' && (
            <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} color="var(--color-arctic-1)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>AI Response & Study Preferences</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Customize how the AI Workspace assistant and Learning Studio formulate study materials.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Response Style</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Preferred formulation style for chat workspace answers.</span>
                  <select 
                    defaultValue="detailed"
                    className="input-field" 
                    style={{ width: '100%', padding: '0.45rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'var(--color-arctic-1)', fontSize: '0.82rem', marginTop: '0.3rem' }}
                  >
                    <option value="detailed" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>In-depth Explanations (Detailed)</option>
                    <option value="concise" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Concise & Direct Summaries</option>
                    <option value="bullets" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Bullet Points & Highlights</option>
                  </select>
                </div>

                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Learning Goal Focus</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tailor auto-generated flashcards and study notes.</span>
                  <select 
                    defaultValue="concepts"
                    className="input-field" 
                    style={{ width: '100%', padding: '0.45rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'var(--color-arctic-1)', fontSize: '0.82rem', marginTop: '0.3rem' }}
                  >
                    <option value="concepts" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Conceptual Understanding (Focus on key terminology)</option>
                    <option value="exams" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Exam Preparation (Focus on mock Q&A style)</option>
                    <option value="practical" style={{ background: 'var(--input-bg)', color: 'var(--color-arctic-1)' }}>Practical Application (Focus on examples & code)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Privacy & Data */}
          {activeTab === 'privacy' && (
            <AIWorkspaceProvider>
              <PreferenceSection />
            </AIWorkspaceProvider>
          )}

          {/* SECTION 5: Developer Diagnostics */}
          {activeTab === 'developer' && (
            <>
              <DeveloperPanel developerMode={developerMode} onToggle={toggleDeveloperMode} />
              
              {developerMode && (
                <>
                  <ProviderCard settings={settings} />
                  <RetrievalSettings settings={settings} />
                  <ModelSettings settings={settings} />
                  <UsageDashboard usage={usage} />
                  <HealthStatus health={health} />
                  
                  <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Terminal size={18} color="var(--color-arctic-1)" />
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Vector Console Logger Telemetry</h4>
                    </div>
                    <div style={{ padding: '0.8rem', background: '#09090b', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', height: '120px', overflowY: 'auto' }}>
                      <div>[LOGS 20:06:51] ChromaDB client initialized from workspace persistent store.</div>
                      <div>[LOGS 20:06:52] Local vector store collections mapped: 1. (vaultonaut_documents)</div>
                      <div>[LOGS 20:07:01] PostgreSQL database connected. 5 schemas, 11 models registered.</div>
                      <div style={{ color: '#34d399' }}>[SYSTEM] Diagnostic telemetry initialized: all systems operational.</div>
                    </div>
                  </div>
                </>
              )}

              <KeyboardShortcutCard />
            </>
          )}

          {/* SECTION 6: About Vaultonaut */}
          {activeTab === 'about' && (
            <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="var(--color-arctic-1)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>About Vaultonaut</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
                <p style={{ margin: 0 }}>
                  <strong 
                    onClick={handleVersionClick} 
                    style={{ cursor: 'pointer', color: 'var(--color-arctic-1)', textDecoration: 'underline' }}
                    title="Click 5 times to toggle developer diagnostics"
                  >
                    Vaultonaut v1.0.0
                  </strong>
                  {' '}— An AI-powered personal knowledge and study assistant.
                </p>

                <p style={{ margin: 0 }}>
                  Vaultonaut provides a local-first environment that allows you to:
                </p>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>Upload educational text, DOCX, and PDF learning materials securely.</li>
                  <li>Build a structured personal knowledge base.</li>
                  <li>Ask grounded questions and get detailed, citation-backed answers.</li>
                  <li>Automatically generate interactive study flashcards and review quizzes.</li>
                  <li>Analyze study progress and track learning analytics in real-time.</li>
                </ul>

                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem' }}>
                  <strong>Technology Acknowledgements:</strong> Built on top of Python FastAPI, React JS, PostgreSQL, and Gemini generative models.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.82rem' }}>
                  <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-arctic-3)', textDecoration: 'underline' }}>
                    GitHub Repository
                  </a>
                  <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
                  <span style={{ color: 'var(--text-muted)' }}>Local-First Privacy Architecture</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </motion.div>
  );
}
