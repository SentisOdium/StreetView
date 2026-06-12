import './Navbar.css';
import { useEffect, useState } from "react";
import { scrollTo } from "./utils";

export function Navbar() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = (id: string, block: ScrollIntoViewOptions["block"] = "start") => {
    setIsMenuOpen(false);
    scrollTo(id, block);
  };

  return (
    <nav
      id="wayfinder-nav"
      className={`wf-nav ${navScrolled ? "wf-nav--scrolled" : ""} ${isMenuOpen ? "wf-nav--open" : ""}`}
    >
      <div className="wf-nav__inner">
        <div className="wf-nav__brand" onClick={() => handleLinkClick("hero")}>
          <img
            src="/logo/WayfinderLogo1.png"
            alt="Wayfinder logo"
            className="wf-nav__logo"
          />
          <span className="wf-nav__name" style={{ whiteSpace: "nowrap" }}>
            Wayfinder | PUP Sta. Mesa
          </span>
        </div>

        {/* Hamburger Menu Toggle Button */}
        <button
          className="wf-nav__toggle"
          aria-label="Toggle Navigation Menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="wf-nav__toggle-bar"></span>
          <span className="wf-nav__toggle-bar"></span>
          <span className="wf-nav__toggle-bar"></span>
        </button>

        <div className={`wf-nav__links ${isMenuOpen ? "wf-nav__links--open" : ""}`}>
          <button onClick={() => handleLinkClick("search-section", "center")} className="wf-nav__link">
            Search
          </button>
          <button onClick={() => handleLinkClick("features-3d")} className="wf-nav__link">
            Route
          </button>
          <button onClick={() => handleLinkClick("about")} className="wf-nav__link">
            About
          </button>
        </div>
      </div>
    </nav>
  );
}
