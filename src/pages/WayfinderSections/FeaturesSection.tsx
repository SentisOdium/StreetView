import { useReveal } from "./utils";

export function FeaturesSection() {
  const featuresReveal = useReveal<HTMLDivElement>();

  return (
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
  );
}
