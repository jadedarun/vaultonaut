import { useState } from 'react';
import { Download, ShieldCheck, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { useAIWorkspace } from '../../../context/AIWorkspaceContext';
import { useDocuments } from '../../../context/DocumentContext';
import * as chatApi from '../../../services/chatApi';

export default function PreferenceSection() {
  const workspace = useAIWorkspace();
  const messages = workspace ? workspace.messages : [];
  const activeConversation = workspace ? workspace.activeConversation : null;
  const showToast = workspace ? workspace.showToast : ((msg, type) => console.log(msg, type));

  const { documents, removeDocument } = useDocuments();
  const [clearingHistory, setClearingHistory] = useState(false);
  const [deletingKnowledge, setDeletingKnowledge] = useState(false);

  const handleExportMarkdown = () => {
    if (!messages || messages.length === 0) {
      showToast('No active conversation history to export.', 'error');
      return;
    }

    const title = activeConversation?.title || 'Vaultonaut Study Session';
    let mdContent = `# ${title}\n\n*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    messages.forEach(m => {
      const roleName = m.role === 'user' ? 'User' : 'Assistant (Grounded)';
      mdContent += `### ${roleName}\n\n${m.content || ''}\n\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_session.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Markdown export downloaded.', 'success');
  };

  const handleExportJSON = () => {
    if (!messages || messages.length === 0) {
      showToast('No active conversation history to export.', 'error');
      return;
    }

    const title = activeConversation?.title || 'Vaultonaut Study Session';
    const exportData = {
      title,
      exportedAt: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.created_at
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_session.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('JSON export downloaded.', 'success');
  };

  const handleExportPDF = () => {
    if (!messages || messages.length === 0) {
      showToast('No active conversation history to export.', 'error');
      return;
    }

    const title = activeConversation?.title || 'Vaultonaut Study Session';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              margin: 30px;
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 22px;
              margin: 0;
              color: #0f172a;
              font-weight: 700;
            }
            .header p {
              font-size: 13px;
              color: #64748b;
              margin: 5px 0 0 0;
            }
            .message-card {
              margin-bottom: 25px;
              padding: 15px 20px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .message-card.user {
              background-color: #f8fafc;
              border-left: 4px solid #64748b;
            }
            .message-card.assistant {
              background-color: #ffffff;
              border-left: 4px solid #0ea5e9;
            }
            .role {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              color: #64748b;
            }
            .message-card.assistant .role {
              color: #0ea5e9;
            }
            .content {
              font-size: 14.5px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { margin: 20px; }
              .message-card { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Vaultonaut Study Session &bull; Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${messages.map(m => {
            const roleName = m.role === 'user' ? 'User Question' : 'Grounded AI Answer';
            const contentClean = m.content || '';
            return `
              <div class="message-card ${m.role}">
                <div class="role">${roleName}</div>
                <div class="content">${contentClean}</div>
              </div>
            `;
          }).join('')}
          <div class="footer">
            Processed securely by Vaultonaut study assistant. Grounded answer logs are encrypted and stored locally.
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const handleClearHistory = async () => {
    const confirmClear = window.confirm("Are you sure you want to permanently clear all conversation history? This action cannot be undone.");
    if (!confirmClear) return;

    setClearingHistory(true);
    try {
      const history = await chatApi.fetchConversations();
      if (Array.isArray(history) && history.length > 0) {
        for (const conv of history) {
          await chatApi.deleteConversation(conv.id);
        }
      }
      showToast('All conversation history cleared successfully.', 'success');
      if (workspace && typeof workspace.refreshConversations === 'function') {
        workspace.refreshConversations();
      }
    } catch (err) {
      console.warn("Failed clearing history:", err);
      showToast('Error occurred clearing conversation history.', 'error');
    } finally {
      setClearingHistory(false);
    }
  };

  const handleDeleteAllKnowledge = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete all uploaded documents and clear your knowledge vault? This action cannot be undone.");
    if (!confirmDelete) return;

    setDeletingKnowledge(true);
    try {
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          await removeDocument(doc.id);
        }
      }
      showToast('All knowledge documents deleted successfully.', 'success');
    } catch (err) {
      console.warn("Failed deleting knowledge:", err);
      showToast('Error occurred deleting documents.', 'error');
    } finally {
      setDeletingKnowledge(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Information Cards */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--color-arctic-1)" />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Your data stays under your control</h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
          Vaultonaut runs with a local-first architecture. All documents, textual parsing, search indexes, and relational logs are stored on your private machine.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'block', marginBottom: '0.3rem' }}>Uploaded Documents</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Vaultonaut processes and parses your uploaded files (PDFs, DOCX, MD, TXT) to build a structured personal knowledge base.
            </span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'block', marginBottom: '0.3rem' }}>AI Processing</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Queries and relevant document contexts are securely routed to the configured AI API provider (Google Gemini) to synthesize answers.
            </span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'block', marginBottom: '0.3rem' }}>Conversation History</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Your interactions in the AI Workspace are stored in a local SQLite database, allowing you to resume recent studies.
            </span>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--color-arctic-1)" />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Export Study Data</h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
          Download your active conversation study sessions directly in different formats.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
          <button className="btn-white-solid" onClick={handleExportMarkdown} style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={14} /> Export as Markdown (.md)
          </button>
          <button className="btn-white-outline" onClick={handleExportJSON} style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={14} /> Export as JSON (.json)
          </button>
          <button className="btn-white-outline" onClick={handleExportPDF} style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={14} /> Export as PDF (.pdf)
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="#ef4444" />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>Danger Zone</h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
          Permanently clear or delete your local learning history. These operations are irreversible.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button 
            className="btn-white-outline" 
            onClick={handleClearHistory} 
            disabled={clearingHistory}
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.78rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={14} /> {clearingHistory ? 'Clearing History...' : 'Clear Conversation History'}
          </button>
          <button 
            className="btn-white-outline" 
            onClick={handleDeleteAllKnowledge} 
            disabled={deletingKnowledge}
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.78rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={14} /> {deletingKnowledge ? 'Deleting Knowledge...' : 'Delete My Knowledge'}
          </button>
        </div>
      </div>

    </div>
  );
}
