import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onFocusSearch,
  onFocusPrompt,
  onForceSend,
  onEscape
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;

      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (onFocusSearch) onFocusSearch();
      } else if (isCmdOrCtrl && e.key === '/') {
        e.preventDefault();
        if (onFocusPrompt) onFocusPrompt();
      } else if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        if (onForceSend) onForceSend();
      } else if (e.key === 'Escape') {
        if (onEscape) onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFocusSearch, onFocusPrompt, onForceSend, onEscape]);
}
