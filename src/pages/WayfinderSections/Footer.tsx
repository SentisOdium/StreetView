import './Footer.css';
import { useNavigate } from "react-router-dom";
import { scrollTo, useReveal } from "./utils";

export function Footer() {
  const navigate = useNavigate();
  const footerReveal = useReveal<HTMLElement>();

  return (
    <footer
      id="wayfinder-footer"
      ref={footerReveal.ref}
      className={`wf-footer ${footerReveal.visible ? "wf-reveal" : ""}`}
    >
      <div className="wf-footer__top">
        <div className="wf-footer__col">
          <h4 className="wf-footer__heading">Navigate</h4>
          <button onClick={() => scrollTo("hero")} className="wf-footer__link">Home</button>
          <button onClick={() => scrollTo("search-section", "center")} className="wf-footer__link">Search</button>
          <button onClick={() => scrollTo("features")} className="wf-footer__link">Route</button>
          <button onClick={() => scrollTo("about")} className="wf-footer__link">About</button>
        </div>
        <div className="wf-footer__col">
          <h4 className="wf-footer__heading">System</h4>
          <button onClick={() => navigate("/tour")} className="wf-footer__link">Virtual Tour</button>
          <button onClick={() => navigate("/admin/login")} className="wf-footer__link wf-footer__link--admin" id="admin-link">
            Admin Area
          </button>
        </div>
        <div className="wf-footer__col">
          <h4 className="wf-footer__heading">About</h4>
          <p className="wf-footer__text">
            PUP Wayfinder is a Navigation Tool designed to enhance and digitize your campus experience.
            <br /> Tailored for PUP Sta. Mesa | Institute of Technology.
          </p>
        </div>
      </div>

      <div className="wf-footer__wordmark-container">
        <span className="wf-footer__wordmark">Wayfinder. </span>
      </div>

      <div className="wf-footer__bottom">
        <p>&copy; {new Date().getFullYear()} Wayfinder — PUP Sta. Mesa</p>
      </div>
    </footer>
  );
}
