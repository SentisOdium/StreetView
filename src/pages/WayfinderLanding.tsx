import "./WayfinderLanding.css";
import { Navbar } from "./WayfinderSections/Navbar";
import { Hero } from "./WayfinderSections/Hero";
import { VideoSection } from "./WayfinderSections/VideoSection";
import { FeaturesSection } from "./WayfinderSections/Features";
import { SearchSection } from "./WayfinderSections/SearchSection";
import { Footer } from "./WayfinderSections/Footer";

export default function WayfinderLanding() {
  return (
    <div
      className="wayfinder-landing"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Navbar />
      <Hero />
      <VideoSection />
      <FeaturesSection />
      <SearchSection />
      <Footer />


    </div>
  );
}
