import { useEffect, useState } from "react";
import { scrollTo } from "./utils";

export function Navbar() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
          <button onClick={() => scrollTo("search-section", "center")} className="wf-nav__link">
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
  );
}
