import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

export default function CodeBlock({ language = 'text', code = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '0.8rem 0',
        borderRadius: '0.6rem',
        background: '#0d1117',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        overflow: 'hidden'
      }}
    >
      {/* Code Block Header */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.8rem',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-arctic-1)', textTransform: 'lowercase' }}>
          <Code size={12} />
          {language}
        </span>

        <button
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: copied ? '#34d399' : '#ccc',
            borderRadius: '0.35rem',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.15s ease'
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied ✓' : 'Copy Code'}
        </button>
      </div>

      {/* Code Area */}
      <pre
        style={{
          margin: 0,
          padding: '0.9rem',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.84rem',
          lineHeight: '1.5',
          color: '#e6edf3',
          background: 'transparent'
        }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
      </pre>
    </div>
  );
}

function highlightCode(code, language) {
  if (!code) return '';
  const lang = language?.toLowerCase();
  
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const escaped = escapeHtml(code);

  if (lang === 'python') {
    return escaped
      // Keywords
      .replace(/\b(def|class|import|from|return|if|else|elif|try|except|finally|for|in|while|as|with|lambda|and|or|not|is|None|True|False)\b/g, '<span style="color: #ff7b72; font-weight: 600;">$1</span>')
      // Strings
      .replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*')/g, '<span style="color: #a5d6ff;">$1</span>')
      // Comments
      .replace(/(#[^\n]*)/g, '<span style="color: #8b949e; font-style: italic;">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span style="color: #79c0ff;">$1</span>')
      // Functions
      .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span style="color: #d2a8ff;">$1</span>');
  }

  if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts' || lang === 'jsx' || lang === 'tsx') {
    return escaped
      // Keywords
      .replace(/\b(const|let|var|function|return|if|else|try|catch|finally|for|while|do|switch|case|default|break|continue|import|export|from|class|extends|new|this|typeof|instanceof|async|await|true|false|null|undefined)\b/g, '<span style="color: #ff7b72; font-weight: 600;">$1</span>')
      // Strings
      .replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`)/g, '<span style="color: #a5d6ff;">$1</span>')
      // Comments
      .replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span style="color: #8b949e; font-style: italic;">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span style="color: #79c0ff;">$1</span>')
      // Functions
      .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span style="color: #d2a8ff;">$1</span>');
  }

  if (lang === 'json') {
    return escaped
      // Keys
      .replace(/(&quot;[a-zA-Z0-9_-]+&quot;)(?=\s*:)/g, '<span style="color: #ffa657;">$1</span>')
      // String values
      .replace(/(:\s*)&quot;(.*?)&quot;/g, '$1<span style="color: #a5d6ff;">&quot;$2&quot;</span>')
      // Booleans / null
      .replace(/\b(true|false|null)\b/g, '<span style="color: #ff7b72;">$1</span>')
      // Numbers
      .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span style="color: #79c0ff;">$1</span>');
  }

  if (lang === 'html' || lang === 'xml') {
    return escaped
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color: #8b949e; font-style: italic;">$1</span>')
      // Tags
      .replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span style="color: #7ee787;">$1</span>')
      // Tag closing
      .replace(/(&gt;)/g, '<span style="color: #7ee787;">$1</span>')
      // Attributes
      .replace(/\b([a-zA-Z0-9:-]+)(?=\s*=\s*&quot;)/g, '<span style="color: #d2a8ff;">$1</span>')
      // String attribute values
      .replace(/(=&quot;.*?&quot;)/g, '=<span style="color: #a5d6ff;">$1</span>');
  }

  if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
    return escaped
      // Comments
      .replace(/(#[^\n]*)/g, '<span style="color: #8b949e; font-style: italic;">$1</span>')
      // Commands / keywords
      .replace(/\b(curl|wget|npm|pip|git|docker|docker-compose|python|python3|uvicorn|pytest|alembic|mkdir|cd|ls|rm|cp|mv|sudo|echo|exit|export|if|then|fi|else|elif|for|in|do|done)\b/g, '<span style="color: #ff7b72; font-weight: 600;">$1</span>')
      // Strings
      .replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*')/g, '<span style="color: #a5d6ff;">$1</span>');
  }

  return escaped;
}
