import { useState, useEffect } from "react";

export interface WindowDimensions {
  width: number;
  height: number;
}

/**
 * Reusable custom hook tracking browser window dimensions with debouncing.
 * Prevents WebGL canvas re-render thrashing during rapid resize events.
 */
export default function useWindowDimensions(delay = 150): WindowDimensions {
  const [dimensions, setDimensions] = useState<WindowDimensions>({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [delay]);

  return dimensions;
}
