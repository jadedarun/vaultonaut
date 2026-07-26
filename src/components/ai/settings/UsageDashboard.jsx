import AnalyticsCard from './AnalyticsCard';
import { MessageSquare, MessageCircle, HelpCircle, FileText, Clock, Zap } from 'lucide-react';

export default function UsageDashboard({ usage }) {
  const data = usage || {
    total_conversations: 12,
    total_messages: 84,
    questions_today: 9,
    documents_indexed: 18,
    avg_response_time_ms: 650
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>AI Usage & Activity Telemetry</h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <AnalyticsCard title="Total Conversations" value={data.total_conversations} subtitle="Active sessions" icon={MessageSquare} trend="+3 today" />
        <AnalyticsCard title="Total Messages" value={data.total_messages} subtitle="Prompts & responses" icon={MessageCircle} trend="+14 today" />
        <AnalyticsCard title="Questions Today" value={data.questions_today} subtitle="Queries processed" icon={HelpCircle} />
        <AnalyticsCard title="Documents Indexed" value={data.documents_indexed} subtitle="ChromaDB vector store" icon={FileText} trend="384d all-MiniLM" />
        <AnalyticsCard title="Avg Latency" value={`${data.avg_response_time_ms}ms`} subtitle="End-to-end response" icon={Clock} trend="⚡ Fast" />
      </div>
    </div>
  );
}
