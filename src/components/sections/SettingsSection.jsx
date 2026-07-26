import { useState } from 'react';
import { motion } from 'framer-motion';
import AISettings from '../ai/settings/AISettings';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Cpu, 
  Bell, 
  ShieldCheck, 
  HardDrive, 
  Info, 
  LogOut 
} from 'lucide-react';

export default function SettingsSection({ user, logout }) {
  const [activeTab, setActiveTab] = useState('ai'); // ai | profile | appearance | notifications | security | storage | about

  const settingsTabs = [
    { id: 'ai', label: 'AI Workspace & Diagnostics', icon: Cpu },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
    >
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="card-header-row">
          <h2 className="card-title">
            <SettingsIcon size={20} className="logo-icon" /> Settings & Diagnostics Hub
          </h2>
          <span className="badge-tag">System Configuration</span>
        </div>
        <p className="card-desc" style={{ marginTop: '0.4rem' }}>
          Manage your user profile, AI model parameters, Developer Mode telemetry, vector database diagnostics, and security controls.
        </p>
      </div>

      {/* Settings Sub-Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid var(--glass-border)' }}>
        {settingsTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? 'btn-white-solid' : 'btn-white-outline'}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Workspace & Diagnostics */}
      {activeTab === 'ai' && (
        <AISettings />
      )}

      {/* Tab 2: Profile */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'User')}`} 
              alt="Profile" 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-arctic-3)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-arctic-1)' }}>
                {user?.displayName || `${user?.firstName || 'Vaultonaut'} ${user?.lastName || ''}`.trim()}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email || 'user@vaultonaut.com'}</p>
              <span className="badge-tag" style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                Authenticated via Google OAuth 2.0
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>First Name</label>
              <input 
                type="text" 
                readOnly 
                value={user?.firstName || 'Arunachalam'} 
                className="input-field" 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>Last Name</label>
              <input 
                type="text" 
                readOnly 
                value={user?.lastName || 'Nachiappan'} 
                className="input-field" 
              />
            </div>
          </div>

          <div style={{ paddingTop: '0.5rem' }}>
            <button
              onClick={logout}
              className="btn-white-outline"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.6rem 1.2rem' }}
            >
              <LogOut size={15} /> Sign Out of Account
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Appearance */}
      {activeTab === 'appearance' && (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Appearance & Fonts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Theme Mode</span>
              <span className="badge-tag">Dark Glassmorphism (Default)</span>
            </div>
            <div style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Typography Standard</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-arctic-3)' }}>Geist Sans & Geist Mono</span>
            </div>
          </div>
        </div>
      )}

      {/* Other Settings Tabs */}
      {(activeTab === 'notifications' || activeTab === 'security' || activeTab === 'storage' || activeTab === 'about') && (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>System Information</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Vaultonaut v1.0.0 is running locally with FastAPI (Python) backend, PostgreSQL / SQLite storage, and React Vite frontend styling with Geist Typography.
          </p>
        </div>
      )}
    </motion.div>
  );
}
