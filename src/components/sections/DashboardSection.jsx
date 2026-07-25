import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Upload, 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Folder, 
  Layers, 
  Database, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  HardDrive, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';
import GradientText from '../GradientText';

export default function DashboardSection({ user, onNavigate, files }) {
  const stats = [
    { label: 'Total Documents', value: files?.length || 14, icon: FileText, change: '+3 this week', color: 'text-cyan-400' },
    { label: 'Collections', value: '6', icon: Folder, change: '2 active', color: 'text-purple-400' },
    { label: 'AI Conversations', value: '28', icon: MessageSquare, change: '142 queries', color: 'text-pink-400' },
    { label: 'Flashcards', value: '48', icon: Layers, change: '85% mastery', color: 'text-emerald-400' },
    { label: 'Quizzes Taken', value: '12', icon: GraduationCap, change: '92% avg score', color: 'text-amber-400' },
    { label: 'Storage Used', value: '45.8 MB', icon: HardDrive, change: '1.2 GB cap', color: 'text-cyan-300' }
  ];

  const quickActions = [
    { title: 'Upload Knowledge', desc: 'Add PDFs, Docs, URLs or YouTube transcripts', icon: Upload, tabIndex: 2, color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' },
    { title: 'Chat with Vault', desc: 'Ask questions with precise source citations', icon: MessageSquare, tabIndex: 3, color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30' },
    { title: 'Generate Summary', desc: 'Synthesize complex documents in seconds', icon: FileText, tabIndex: 4, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
    { title: 'Continue Learning', desc: 'Review flashcards & test quiz readiness', icon: GraduationCap, tabIndex: 4, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30' }
  ];

  const recentActivities = [
    { action: 'Ingested Document', target: 'FastAPI_Architecture.pdf', time: '10 mins ago', type: 'upload' },
    { action: 'Generated Quiz', target: 'Machine Learning Fundamentals', time: '1 hour ago', type: 'quiz' },
    { action: 'AI Chat Query', target: 'Explain vector embeddings chunking', time: '3 hours ago', type: 'chat' },
    { action: 'Updated Collection', target: 'System Design & Distributed Vaults', time: 'Yesterday', type: 'vault' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1322] via-[#0f172a] to-[#07090e] border border-cyan-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Knowledge Operating System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Welcome back,{' '}
              <GradientText colors={['#38bdf8', '#c084fc', '#f472b6']} animationSpeed={6}>
                {user?.displayName || user?.firstName || 'Vaultonaut'}
              </GradientText>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Your personal knowledge engine is active. Ask questions across your documents, generate revision flashcards, or inspect indexed vector collections.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-md">
            <div className="relative">
              <img 
                src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'User')}`} 
                alt="Avatar" 
                className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[150px]">{user?.displayName || 'Active User'}</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{user?.email || 'user@vaultonaut.com'}</p>
              <span className="inline-block text-[10px] text-emerald-400 font-mono mt-0.5">● RAG Core Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(action.tabIndex)}
                className={`text-left p-5 rounded-2xl bg-gradient-to-br ${action.color} border backdrop-blur-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between min-h-[140px] group`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base group-hover:text-cyan-300 transition-colors">{action.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{action.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Statistics Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Knowledge Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-[#0c101d] border border-slate-800/80 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] text-slate-400 font-mono">{stat.change}</span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Recent Documents Dual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Recent Activity
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Feed</span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{act.action}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{act.target}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AI Chats Preview */}
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              Recent AI Conversations
            </h3>
            <button 
              onClick={() => onNavigate(3)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Open AI Workspace →
            </button>
          </div>

          <div className="space-y-3">
            {[
              { query: "How does RAG semantic chunking improve response accuracy?", time: "2h ago", sources: 3 },
              { query: "Summarize the key differences between PostgreSQL & ChromaDB", time: "4h ago", sources: 2 },
              { query: "Generate a 5-question quiz on FastAPI dependency injection", time: "1d ago", sources: 4 }
            ].map((chat, idx) => (
              <div 
                key={idx} 
                onClick={() => onNavigate(3)}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <p className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                  "{chat.query}"
                </p>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <FileText className="w-3 h-3 text-cyan-400" /> {chat.sources} sources referenced
                  </span>
                  <span className="font-mono text-slate-500">{chat.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
