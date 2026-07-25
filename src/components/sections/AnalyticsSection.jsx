import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  Award, 
  Zap, 
  FileText, 
  MessageSquare, 
  GraduationCap, 
  CheckCircle2 
} from 'lucide-react';
import GradientText from '../GradientText';

export default function AnalyticsSection() {
  const metrics = [
    { label: 'Knowledge Growth', value: '+42%', icon: TrendingUp, color: 'text-emerald-400', desc: 'Indexed vector tokens' },
    { label: 'Documents Uploaded', value: '14', icon: FileText, color: 'text-cyan-400', desc: '45.8 MB total storage' },
    { label: 'Questions Asked', value: '142', icon: MessageSquare, color: 'text-purple-400', desc: '98.4% grounded accuracy' },
    { label: 'Study Time', value: '18.5 hrs', icon: Clock, color: 'text-amber-400', desc: 'This month' },
    { label: 'Quiz Accuracy', value: '92%', icon: Award, color: 'text-pink-400', desc: 'Top percentile' },
    { label: 'Learning Streak', value: '14 Days', icon: Zap, color: 'text-orange-400', desc: 'Personal record' }
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
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1 font-mono">
          <BarChart2 className="w-4 h-4" />
          <span>KNOWLEDGE INSIGHTS</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your knowledge repository growth, study streak, quiz scores, and RAG semantic query volume over time.
        </p>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
                <p className="text-xs font-medium text-slate-200 mt-0.5">{m.label}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance & Growth Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Ingestion Growth Progress */}
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-base font-semibold text-white">Ingestion & Vector Indexing Growth</h3>
          
          <div className="space-y-3">
            {[
              { category: 'AI Engineering & System Design', progress: 85, count: '6 Docs' },
              { category: 'Machine Learning Fundamentals', progress: 65, count: '4 Docs' },
              { category: 'Deep Learning Research Papers', progress: 40, count: '3 Docs' },
              { category: 'Personal Revision Notes', progress: 90, count: '1 Doc' }
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{cat.category}</span>
                  <span className="text-cyan-400 font-semibold">{cat.count}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${cat.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Mastery Breakdown */}
        <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-base font-semibold text-white">Study Suite Mastery</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <span className="text-2xl font-bold text-emerald-400">92%</span>
              <p className="text-xs text-slate-300">Quiz Accuracy</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <span className="text-2xl font-bold text-purple-400">48</span>
              <p className="text-xs text-slate-300">Mastered Flashcards</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <span className="text-2xl font-bold text-amber-400">18.5h</span>
              <p className="text-xs text-slate-300">Total Revision Time</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
              <span className="text-2xl font-bold text-cyan-400">14 Days</span>
              <p className="text-xs text-slate-300">Active Streak</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
