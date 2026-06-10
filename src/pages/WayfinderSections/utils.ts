import { useEffect, useRef, useState } from "react";

export const scrollTo = (id: string, block: ScrollLogicalPosition = "start") => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });
};

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}
