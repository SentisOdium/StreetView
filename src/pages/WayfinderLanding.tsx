import "./WayfinderLanding.css";
import { Navbar } from "./WayfinderSections/Navbar/Navbar";
import { Hero } from "./WayfinderSections/Hero/Hero";
import { VideoSection } from "./WayfinderSections/VideosSection/VideoSection";
import { FeaturesSection } from "./WayfinderSections/Features/FeaturesSection";
import { SearchSection } from "./WayfinderSections/SearchSection/SearchSection";
import { Footer } from "./WayfinderSections/Footer/Footer";

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
