import { useState } from 'react';
import { useAISettings } from '../../../hooks/useAISettings';
import ProviderCard from './ProviderCard';
import UsageDashboard from './UsageDashboard';
import HealthStatus from './HealthStatus';
import DeveloperPanel from './DeveloperPanel';
import RetrievalSettings from './RetrievalSettings';
import ModelSettings from './ModelSettings';
import PreferenceSection from './PreferenceSection';
import KeyboardShortcutCard from './KeyboardShortcutCard';
import { ArrowLeft, Cpu, Activity, Terminal, Shield, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AISettings() {
  const navigate = useNavigate();
  const { settings, usage, health, loading, developerMode, toggleDeveloperMode } = useAISettings();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '1.5rem',
        boxSizing: 'border-box',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >
      {/* Header with Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={() => navigate('/ai-workspace')}
            className="btn-white-solid"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={16} /> Back to AI Workspace
          </button>

          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
            Vaultonaut AI Settings & Diagnostics
          </h2>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', overflowX: 'auto' }}>
        {[
          { id: 'general', label: 'General & Model', icon: Cpu },
          { id: 'usage', label: 'Usage Dashboard', icon: Activity },
          { id: 'developer', label: 'Developer Mode', icon: Terminal },
          { id: 'health', label: 'System Health', icon: Shield },
          { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                color: isActive ? 'var(--color-arctic-1)' : 'var(--text-muted)',
                borderRadius: '0.4rem',
                padding: '0.5rem 0.9rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading AI Workspace settings & diagnostics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeTab === 'general' && (
            <>
              <ProviderCard settings={settings} />
              <RetrievalSettings settings={settings} />
              <ModelSettings settings={settings} />
              <PreferenceSection />
            </>
          )}

          {activeTab === 'usage' && (
            <UsageDashboard usage={usage} />
          )}

          {activeTab === 'developer' && (
            <DeveloperPanel developerMode={developerMode} onToggle={toggleDeveloperMode} />
          )}

          {activeTab === 'health' && (
            <HealthStatus health={health} />
          )}

          {activeTab === 'shortcuts' && (
            <KeyboardShortcutCard />
          )}
        </div>
      )}
    </div>
  );
}
