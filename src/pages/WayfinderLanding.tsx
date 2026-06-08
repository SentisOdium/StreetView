import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WayfinderLanding.css";

/* ─────────────────────────────────────────────
   Particle Canvas — Antigravity-style dots
   ───────────────────────────────────────────── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COLORS = ["#800000", "#b30000", "#3b82f6", "#6366f1", "#111111", "#aaaaaa"];

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    const init = () => {
      particles.length = 0;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      for (let i = 0; i < 140; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2.5 + 0.8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    window.addEventListener("resize", () => {
      resize();
      init();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────
   Scroll-reveal hook
   ───────────────────────────────────────────── */
function useReveal<T extends HTMLElement>() {
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

/* ─────────────────────────────────────────────
   Main Landing Page
   ───────────────────────────────────────────── */
export default function WayfinderLanding() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);

  /* track scroll for navbar style */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* reveal refs for each section */
  const videoReveal = useReveal<HTMLDivElement>();
  const featuresReveal = useReveal<HTMLDivElement>();
  const footerReveal = useReveal<HTMLElement>();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="wayfinder-landing"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── NAVBAR ────────────────────────────── */}
      <nav
        id="wayfinder-nav"
        className={`wf-nav ${navScrolled ? "wf-nav--scrolled" : ""}`}
      >
        <div className="wf-nav__inner">
          <div className="wf-nav__brand" onClick={() => scrollTo("hero")}>
            <img
              src="/logo/WayfinderLogo1.png"
              alt="Wayfinder logo"
              className="wf-nav__logo"
            />
            <span className="wf-nav__name">Wayfinder</span>
            <span className="wf-nav__name"> | PUP Sta. Mesa </span>
          </div>
          <div className="wf-nav__links">
            <button onClick={() => scrollTo("features")} className="wf-nav__link">
              Search
            </button>
            <button onClick={() => scrollTo("features")} className="wf-nav__link">
              Route
            </button>
            <button onClick={() => scrollTo("about")} className="wf-nav__link">
              About
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────── */}
      <section id="hero" className="wf-hero">
        <ParticleCanvas />
        <div className="wf-hero__content">

          <div className="wf-hero__branding">
            <img
              src="/logo/WayfinderLogo1.png"
              alt="Wayfinder"
              className="wf-hero__logo"
            />
            <h1 className="wf-hero__title">Wayfinder</h1>
          </div>

          <p className="wf-hero__tagline">
            Digitizing your campus experience.
          </p>

          <div className="wf-hero__cta">
            <button
              id="explore-now-btn"
              className="wf-btn wf-btn--primary"
              onClick={() => navigate("/tour")}
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
        </div>
      </section>

      {/* ── VIDEO TEASER ──────────────────────── */}
      <section id="about" className="wf-video-section">
        <div
          ref={videoReveal.ref}
          className={`wf-video-card ${videoReveal.visible ? "wf-reveal" : ""}`}
        >
          <video
            id="teaser-video"
            className="wf-video-player"
            controls
            playsInline
            poster="/logo/WayfinderLogo1.png"
          >
            {/* Drop your teaser video src here:
                <source src="/videos/teaser.mp4" type="video/mp4" /> */}
          </video>
          {/* Placeholder overlay — disappears when video src is set */}
          <div className="wf-video-placeholder">
            <div className="wf-video-placeholder__icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
                <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#fff" />
              </svg>
            </div>
            <p className="wf-video-placeholder__text">Teaser coming soon</p>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ─────────────────────── */}
      <section id="features" className="wf-features-section">
        <h2 className="wf-section-heading">Core Features</h2>
        <div
          ref={featuresReveal.ref}
          className={`wf-features-grid ${featuresReveal.visible ? "wf-reveal" : ""}`}
        >
          {/* 3D Visualize */}
          <div className="wf-feature-card" id="feature-3d">
            <div className="wf-feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="wf-feature-title">3D Visualize</h3>
            <p className="wf-feature-desc">
              Explore the campus in an interactive 3D panoramic view with smooth navigation.
            </p>
          </div>

          {/* Search */}
          <div className="wf-feature-card" id="feature-search">
            <div className="wf-feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 className="wf-feature-title">Search</h3>
            <p className="wf-feature-desc">
              Find any building, room, or landmark instantly with intelligent search.
            </p>
          </div>

          {/* Generate Route */}
          <div className="wf-feature-card" id="feature-route">
            <div className="wf-feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="wf-feature-title">Generate Route</h3>
            <p className="wf-feature-desc">
              Get step-by-step directions to navigate anywhere across campus.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer
        id="wayfinder-footer"
        ref={footerReveal.ref}
        className={`wf-footer ${footerReveal.visible ? "wf-reveal" : ""}`}
      >
        <div className="wf-footer__top">
          <div className="wf-footer__col">
            <h4 className="wf-footer__heading">Navigate</h4>
            <button onClick={() => scrollTo("hero")} className="wf-footer__link">Home</button>
            <button onClick={() => scrollTo("features")} className="wf-footer__link">Search</button>
            <button onClick={() => scrollTo("features")} className="wf-footer__link">Route</button>
            <button onClick={() => scrollTo("about")} className="wf-footer__link">About</button>
          </div>
          <div className="wf-footer__col">
            <h4 className="wf-footer__heading">System</h4>
            <button onClick={() => navigate("/tour")} className="wf-footer__link">Virtual Tour</button>
            <button onClick={() => navigate("/admin")} className="wf-footer__link wf-footer__link--admin" id="admin-link">
              Admin
            </button>
          </div>
          <div className="wf-footer__col">
            <h4 className="wf-footer__heading">About</h4>
            <p className="wf-footer__text">
              Wayfinder is a 360° virtual tour and wayfinding system for PUP Sta. Mesa campus.
            </p>
          </div>
        </div>

        <div className="wf-footer__wordmark-container">
          <span className="wf-footer__wordmark">Wayfinder</span>
        </div>

        <div className="wf-footer__bottom">
          <p>&copy; {new Date().getFullYear()} Wayfinder — PUP Sta. Mesa</p>
        </div>
      </footer>
    </div>
  );
}
