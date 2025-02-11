import { useEffect, useCallback } from "react";
import { debounce } from "lodash";

const useScrollPosition = (containerRef, scrolledHeightElement) => {
  const saveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const currentScrollTop = containerRef.current.scrollTop;
      sessionStorage.setItem(
        scrolledHeightElement,
        currentScrollTop.toString()
      );
    }
  }, [containerRef, scrolledHeightElement]);

  const handleScroll = debounce(() => {
    saveScrollPosition();
  }, 100);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      saveScrollPosition();
    };
  }, [containerRef, handleScroll, saveScrollPosition]);

  useEffect(() => {
    if (containerRef.current) {
      const savedScrollTop =
        parseInt(sessionStorage.getItem(scrolledHeightElement)) || 0;
      containerRef.current.scrollTop = savedScrollTop;
    }
  }, [containerRef, scrolledHeightElement]);
};

export default useScrollPosition;
