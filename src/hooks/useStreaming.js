import { useState, useRef, useCallback } from 'react';

export function useStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const abortControllerRef = useRef(null);
  const streamIntervalRef = useRef(null);

  const startStreaming = useCallback(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);
    setStreamedText('');
    return controller.signal;
  }, []);

  const streamTextProgressively = useCallback((fullText, onComplete) => {
    if (!fullText) {
      if (onComplete) onComplete();
      return;
    }

    let currentIndex = 0;
    const chunkSize = 3; // Characters per tick for smooth rendering

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    streamIntervalRef.current = setInterval(() => {
      currentIndex += chunkSize;
      if (currentIndex >= fullText.length) {
        setStreamedText(fullText);
        clearInterval(streamIntervalRef.current);
        setIsStreaming(false);
        if (onComplete) onComplete();
      } else {
        setStreamedText(fullText.slice(0, currentIndex));
      }
    }, 20);
  }, []);

  const stopStreaming = useCallback(() => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    streamedText,
    startStreaming,
    streamTextProgressively,
    stopStreaming,
    abortControllerRef
  };
}
