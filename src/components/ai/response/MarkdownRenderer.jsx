import CodeBlock from './CodeBlock';
import InlineCode from './InlineCode';
import TableRenderer from './TableRenderer';

export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  // Split content into blocks (code blocks vs text blocks)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'text',
      code: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({ type: 'text', text: content.slice(lastIndex) });
  }

  return (
    <div className="markdown-renderer" style={{ fontSize: '0.92rem', lineHeight: '1.6', color: '#e2e8f0' }}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code') {
          return <CodeBlock key={bIdx} language={block.language} code={block.code} />;
        }
        return <TextMarkdownBlock key={bIdx} text={block.text} />;
      })}
    </div>
  );
}

function TextMarkdownBlock({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: '0.3rem' }}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && (tableHeaders.length > 0 || tableRows.length > 0)) {
      elements.push(
        <TableRenderer key={`table-${elements.length}`} headers={tableHeaders} rows={tableRows} />
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table Row Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      
      // Check if divider line like |---|---|
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        return; // skip divider
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else {
      flushTable();
    }

    // List item detection (- or * or 1.)
    if (/^[\*\-]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      inList = true;
      const cleanItem = trimmed.replace(/^([\*\-]\s+|\d+\.\s+)/, '');
      listItems.push(cleanItem);
      return;
    } else {
      flushList();
    }

    if (!trimmed) {
      return;
    }

    // Heading H1 - H6
    if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={index} style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '1rem 0 0.5rem 0' }}>{renderInlineFormatting(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={index} style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-arctic-1)', margin: '0.8rem 0 0.4rem 0' }}>{renderInlineFormatting(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={index} style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: '0.6rem 0 0.3rem 0' }}>{renderInlineFormatting(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      elements.push(
        <blockquote key={index} style={{ margin: '0.6rem 0', padding: '0.6rem 1rem', borderLeft: '3px solid var(--color-arctic-1)', background: 'rgba(255,255,255,0.03)', fontStyle: 'italic', borderRadius: '0 0.4rem 0.4rem 0' }}>
          {renderInlineFormatting(trimmed.slice(2))}
        </blockquote>
      );
    } else {
      // Standard Paragraph
      elements.push(
        <p key={index} style={{ margin: '0.4rem 0' }}>
          {renderInlineFormatting(line)}
        </p>
      );
    }
  });

  flushList();
  flushTable();

  return <>{elements}</>;
}

function renderInlineFormatting(text) {
  if (!text) return null;

  // Inline Code parsing `code`
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <InlineCode key={i}>{part.slice(1, -1)}</InlineCode>;
    }

    // Bold **text**
    const boldParts = part.split(/(\*\*[^\*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={j} style={{ color: '#fff', fontWeight: 600 }}>{bp.slice(2, -2)}</strong>;
      }

      // Link [text](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const subParts = [];
      let lastIdx = 0;
      let match;

      while ((match = linkRegex.exec(bp)) !== null) {
        if (match.index > lastIdx) {
          subParts.push(bp.slice(lastIdx, match.index));
        }
        subParts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#60a5fa', textDecoration: 'underline' }}
          >
            {match[1]}
          </a>
        );
        lastIdx = match.index + match[0].length;
      }

      if (lastIdx < bp.length) {
        subParts.push(bp.slice(lastIdx));
      }

      return subParts;
    });
  });
}
