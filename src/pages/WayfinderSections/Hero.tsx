import './Hero.css';
import { scrollTo } from "./utils";
import { ParticleCanvas } from "./ParticleCanvas";
import { useState, useEffect } from "react";

export function Hero() {
  const [typedIndex, setTypedIndex] = useState(0);
  const fullText = "Digitizing your campus experience.";

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: number;

    const typeNext = () => {
      if (currentIndex < fullText.length) {
        currentIndex++;
        setTypedIndex(currentIndex);
        timeoutId = setTimeout(typeNext, Math.random() * 30 + 70);
      }
    };

    // Start typing after 1 blink (1000ms)
    timeoutId = setTimeout(typeNext, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const isTypingFinished = typedIndex === fullText.length;

  return (
    <section id="hero" className="wf-hero">
      <ParticleCanvas />
      <div className="wf-hero__content">

        {isTypingFinished && (
          <div className="wf-hero__branding animate-[wfRevealUp_0.8s_ease-out_forwards]">
            <img
              src="/logo/WayfinderLogo1.png"
              alt="Wayfinder"
              className="wf-hero__logo"
            />
            <h1 className="wf-hero__title">Wayfinder</h1>
          </div>
        )}

        <p className="wf-hero__tagline">
          <span className="wf-hero__text" style={{ position: "relative", display: "inline-block", maxWidth: "100%", paddingRight: "32px" }}>
            {/* Invisible full text pre-allocates the exact unbroken width to stop all shaking */}
            <span className="wf-hero__spacer" style={{ visibility: "hidden", display: "block", width: "100%" }}>{fullText}</span>

            {/* Absolute overlay for the actual typing effect */}
            <span className="wf-hero__overlay" style={{ position: "absolute", left: 0, top: 0, width: "calc(100% + 32px)", height: "100%", display: "block" }}>
              <span>{fullText.substring(0, typedIndex)}</span>
              <span className={`wf-hero__cursor ${isTypingFinished ? 'finished' : 'typing'}`} style={{ display: "inline-block" }}>|</span>
            </span>
          </span>
        </p>

        {isTypingFinished && (
          <div className="wf-hero__cta animate-[wfRevealUp_0.8s_ease-out_forwards]">
            <button
              id="explore-now-btn"
              className="wf-btn wf-btn--primary"
              onClick={() => {
                scrollTo("search-section", "center");
                window.dispatchEvent(new Event('trigger-search-glow'));
              }}
            >
              Explore Now
            </button>

            <button
              id="about-btn"
              className="wf-btn wf-btn--ghost"
              onClick={() => scrollTo("about")}
            >
              About
            </button>
          </div>
        )}
      </div>
    </section>
  );
}