import { useEffect, useCallback } from "react";
import { debounce } from "lodash";

const useScrollPosition = (containerRef) => {
  const saveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const currentScrollTop = containerRef.current.scrollTop;
      sessionStorage.setItem("scrolledHeight", currentScrollTop.toString());
    }
  }, [containerRef]);

  const handleScroll = useCallback(
    debounce(() => {
      saveScrollPosition();
    }, 100),
    [saveScrollPosition]
  );

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
        parseInt(sessionStorage.getItem("scrolledHeight")) || 0;
      containerRef.current.scrollTop = savedScrollTop;
    }
  }, [containerRef]);
};

export default useScrollPosition;
