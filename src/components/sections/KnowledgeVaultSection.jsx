import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  FileText, 
  Star, 
  Bookmark, 
  Clock, 
  Search, 
  FolderPlus, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  Filter, 
  Layers 
} from 'lucide-react';
import GradientText from '../GradientText';

const MOCK_COLLECTIONS = [
  { id: 'ai-eng', title: 'AI Engineering', count: 12, updated: '2 hours ago', icon: Sparkles, color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'ml-fund', title: 'Machine Learning', count: 8, updated: 'Yesterday', icon: Layers, color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30' },
  { id: 'dl-paper', title: 'Deep Learning Papers', count: 15, updated: '3 days ago', icon: FileText, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'res-paper', title: 'Research Papers', count: 6, updated: '1 week ago', icon: Folder, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30' },
  { id: 'college', title: 'College Notes', count: 24, updated: '2 weeks ago', icon: BookOpen, color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'personal', title: 'Personal Notes', count: 5, updated: '1 month ago', icon: Bookmark, color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30' }
];

import { BookOpen } from 'lucide-react';

export default function KnowledgeVaultSection({ files, collections, selectedCollection, setSelectedCollection }) {
  const [filterTab, setFilterTab] = useState('all'); // all | collections | pinned | favorites | recent
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All Resources', icon: Layers },
    { id: 'collections', label: 'Collections', icon: Folder },
    { id: 'pinned', label: 'Pinned', icon: Bookmark },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recently Viewed', icon: Clock }
  ];

  const filteredFiles = (files || []).filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.collection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Vault Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c101d] border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1 font-mono">
            <Folder className="w-4 h-4" />
            <span>KNOWLEDGE REPOSITORY</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Knowledge Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize, search, and manage your vector-indexed documents and curated study collections.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault documents & tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Vault Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        {filterTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
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

      {/* Featured Collections Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Folder className="w-4 h-4 text-purple-400" />
            Curated Collections
          </h2>
          <span className="text-xs text-slate-400 font-mono">{MOCK_COLLECTIONS.length} Collections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_COLLECTIONS.map((col) => {
            const Icon = col.icon;
            return (
              <motion.div
                key={col.id}
                whileHover={{ y: -3, scale: 1.01 }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${col.color} border backdrop-blur-xl flex flex-col justify-between min-h-[160px] shadow-lg group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-950/40 border border-white/5">
                      {col.count} Docs
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-base group-hover:text-cyan-300 transition-colors">{col.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">Updated {col.updated}</p>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <button className="flex-1 py-1.5 rounded-lg bg-slate-950/50 hover:bg-cyan-500/20 text-[11px] font-medium text-slate-200 hover:text-cyan-300 border border-white/10 transition-all flex items-center justify-center gap-1">
                    <Search className="w-3 h-3" />
                    Search
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[11px] font-semibold text-cyan-300 border border-cyan-500/40 transition-all flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" />
                    Open
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Indexed Document Files Table */}
      <div className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800/80 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Indexed Documents & Transcripts
          </h2>
          <span className="text-xs text-slate-400 font-mono">{filteredFiles.length} File(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[220px]">{file.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                      {file.collection}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{file.type}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{file.size}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{file.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
