import { useRef, useEffect, useCallback } from 'react';

export function useAutoScroll(dependencies = []) {
  const scrollRef = useRef(null);
  const userScrolledRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    userScrolledRef.current = !isAtBottom;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current && !userScrolledRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [...dependencies, scrollToBottom]);

  return {
    scrollRef,
    handleScroll,
    scrollToBottom
  };
}
