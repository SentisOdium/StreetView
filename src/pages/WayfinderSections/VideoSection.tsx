import { useEffect, useRef, useState } from "react";
import './VideoSection.css';

export function VideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      const distance = Math.abs(viewportCenter - elementCenter);

      // Distance at which scaling starts
      const maxDistance = window.innerHeight * 0.75;

      const progress = Math.max(
        0,
        1 - distance / maxDistance
      );

      const isMobile = window.innerWidth <= 768;
      const maxScale = isMobile ? 1.0 : 1.2;
      setScale(0.8 + progress * (maxScale - 0.8));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="about" className="wf-video-section">
      <div
        ref={sectionRef}
        className="wf-video-card transition-transform duration-500 ease-out"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <iframe
          className="wf-video-player"
          src="https://www.youtube.com/embed/IetKXGbKd3M"
          title="WayFinder Teaser"
          allowFullScreen
        />
      </div>
    </section>
  );
}