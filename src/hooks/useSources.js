import { useState, useCallback } from 'react';

export function useSources() {
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const openSourcePanel = useCallback((citation) => {
    setSelectedCitation(citation);
    setCurrentChunkIndex(0);
    setSearchQuery('');
  }, []);

  const closeSourcePanel = useCallback(() => {
    setSelectedCitation(null);
    setCurrentChunkIndex(0);
    setSearchQuery('');
  }, []);

  const nextChunk = useCallback((totalChunks) => {
    setCurrentChunkIndex(prev => (prev + 1) % totalChunks);
  }, []);

  const prevChunk = useCallback((totalChunks) => {
    setCurrentChunkIndex(prev => (prev - 1 + totalChunks) % totalChunks);
  }, []);

  return {
    selectedCitation,
    currentChunkIndex,
    searchQuery,
    setSearchQuery,
    openSourcePanel,
    closeSourcePanel,
    nextChunk,
    prevChunk,
    setSelectedCitation
  };
}
