import { useReveal } from "../utils";
import { MobileFeatures } from "./MobileFeatures";
import { DesktopFeatures } from "./DesktopFeatures";

export function FeaturesSection() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef.ref} className="bg-white text-slate-900 w-full py-16 sm:py-28 px-4 sm:px-8 md:px-16 flex justify-center select-none">
      <div className="max-w-7xl w-full flex flex-col gap-12 sm:gap-16">

        <div className="text-center max-w-3xl mx-auto mb-4 flex flex-col gap-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            PUP Wayfinder <span className="text-[#800000]">Digitizing your Campus Experience.</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Enhancing Campus Navigation through 3D Visualization. Explore the campus through immersive
            visual navigation, intelligent route guidance, and interactive location discovery designed
            to make finding your destination faster and easier.
          </p>
        </div>

        {/* Mobile vertical cards stack (rendered below lg viewport) */}
        <MobileFeatures />

        {/* Desktop switchable tabs (rendered at lg viewport and up) */}
        <DesktopFeatures />

      </div>
    </div>
  );
}
