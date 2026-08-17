import { useState } from 'react';
import { useAIWorkspace } from '../../../context/AIWorkspaceContext';
import { Copy, Check, ExternalLink, Download } from 'lucide-react';

export default function SourceActions({ textToCopy = '' }) {
  const { showToast } = useAIWorkspace();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Retrieved chunk text copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
      <button
        onClick={handleCopy}
        className="btn-white-solid"
        style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem 0.8rem', justifyContent: 'center' }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        <span>{copied ? 'Copied' : 'Copy Chunk Text'}</span>
      </button>

      <button
        className="btn-white-outline"
        onClick={() => showToast('Navigating to originating Knowledge Vault document...', 'info')}
        style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        title="Open originating document in Knowledge Vault"
      >
        <span>Open Vault</span>
        <ExternalLink size={13} />
      </button>
    </div>
  );
}
