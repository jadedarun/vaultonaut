import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4 bg-[#0e121b] border border-cyan-500/20 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300 tracking-wide">
            Authenticating & restoring session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? fallback : null;
  }

  return children;
}
