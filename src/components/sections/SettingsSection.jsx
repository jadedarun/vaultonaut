import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Cpu, 
  Bell, 
  ShieldCheck, 
  HardDrive, 
  Info, 
  Check 
} from 'lucide-react';
import GradientText from '../GradientText';

export default function SettingsSection({ user, logout }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile | appearance | ai | notifications | security | storage | about

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'ai', label: 'AI Preferences', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'about', label: 'About', icon: Info }
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
          <SettingsIcon className="w-4 h-4" />
          <span>SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Settings & Account
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your user profile, AI model parameters, vector database storage, and system security controls.
        </p>
      </div>

      {/* Settings Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
        {settingsTabs.map(tab => {
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

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'User')}`} 
              alt="Profile" 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-xl"
            />
            <div>
              <h2 className="text-base font-bold text-white">{user?.displayName || 'Vaultonaut User'}</h2>
              <p className="text-xs text-slate-400">{user?.email || 'user@vaultonaut.com'}</p>
              <span className="inline-block px-2.5 py-0.5 mt-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
                ● Authenticated via Google OAuth 2.0
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="text-xs text-slate-400 font-mono">First Name</label>
              <input 
                type="text" 
                readOnly 
                value={user?.firstName || 'Vaultonaut'} 
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono">Last Name</label>
              <input 
                type="text" 
                readOnly 
                value={user?.lastName || 'User'} 
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 transition-all"
          >
            Sign Out of Account
          </button>
        </div>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h2 className="text-base font-semibold text-white">Appearance & Theme</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-200 font-medium">Dark Glassmorphism Theme</span>
              <span className="text-xs text-cyan-400 font-mono">Active (Default)</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-200 font-medium">Typography Engine</span>
              <span className="text-xs text-slate-400 font-mono">Geist Sans & Geist Pixel</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Preferences */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h2 className="text-base font-semibold text-white">RAG & AI Model Configuration</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Vector Embedding Model</span>
              <span className="text-cyan-400 font-mono">sentence-transformers/all-MiniLM-L6-v2</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Chunk Size & Overlap</span>
              <span className="text-purple-400 font-mono">500 chars / 50 overlap</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">LLM Context Window</span>
              <span className="text-emerald-400 font-mono">4,096 tokens</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h2 className="text-base font-semibold text-white">Security & Token Control</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">FastAPI JWT Status</span>
              <span className="text-emerald-400 font-mono">✓ Signed Bearer JWT Token Active</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">OAuth Provider</span>
              <span className="text-cyan-400 font-mono">Google OAuth 2.0 Token Verification</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Storage */}
      {activeTab === 'storage' && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h2 className="text-base font-semibold text-white">Vector Storage & Database</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Database Engine</span>
              <span className="text-cyan-400 font-mono">PostgreSQL 16 (SQLAlchemy 2.0)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Vector Store</span>
              <span className="text-purple-400 font-mono">ChromaDB Local Vector Collections</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: About */}
      {(activeTab === 'about' || activeTab === 'notifications') && (
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-3 text-xs">
          <h2 className="text-base font-semibold text-white">About Vaultonaut</h2>
          <p className="text-slate-400 leading-relaxed">
            Vaultonaut is an AI-powered Personal Knowledge Vault enabling users to upload documents, perform RAG semantic search with grounded citations, and generate flashcards, quizzes, and study plans.
          </p>
          <div className="pt-2 text-slate-500 font-mono">
            Version 1.0.0 • Milestone 2 Complete
          </div>
        </div>
      )}
    </motion.div>
  );
}
