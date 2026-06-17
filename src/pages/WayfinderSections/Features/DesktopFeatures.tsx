import { useState } from "react";
import { features } from "./featureData";

export function DesktopFeatures() {
  const [activeTab, setActiveTab] = useState<"panorama" | "search" | "directions">("panorama");
  const active = features[activeTab];

  return (
    <div className="hidden lg:flex flex-col gap-12 sm:gap-16 w-full">
      {/* Main Switchable card */}
      <div className="bg-slate-50/50 rounded-[28px] sm:rounded-[36px] border border-slate-200/60 p-6 sm:p-10 lg:p-12 shadow-sm transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center min-h-[450px]">
          {/* Left Side: Mockup browser */}
          <div className={`lg:col-span-8 w-full aspect-[16/10] relative flex items-center justify-center ${activeTab === 'search' ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="h-full w-full rounded-[20px] sm:rounded-[24px] border border-slate-200/60 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] bg-white flex flex-col">
              {active.mockup}
            </div>
          </div>

          {/* Right Side: Copy/Text Column */}
          <div className={`lg:col-span-4 flex flex-col gap-4 sm:gap-6 justify-center ${activeTab === 'search' ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="flex items-center gap-2 text-[#800000] font-semibold text-xs sm:text-sm">
              {active.icon}
              {active.subtitle && <span>{active.subtitle}</span>}
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {active.title}
            </h3>
            {active.descriptions.map((desc, idx) => (
              <p key={idx} className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {desc}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-[1px] bg-slate-200/80 my-2"></div>

      {/* Navigation Tabs/Cards at the bottom */}
      <div className="grid grid-cols-3 gap-6 w-full py-4 px-1">
        {/* Tab 1 */}
        <button
          onClick={() => setActiveTab("panorama")}
          className={`flex flex-col items-start text-left p-6 rounded-[20px] border transition-all duration-300 cursor-pointer ${
            activeTab === "panorama"
              ? "border-[#800000] bg-white shadow-lg shadow-slate-100 scale-[1.02]"
              : "border-slate-200/60 bg-slate-50/50 hover:bg-slate-50/80 hover:scale-[1.01]"
          }`}
        >
          <div className={`p-3 rounded-xl mb-4 transition-colors ${
            activeTab === "panorama"
              ? "bg-[#800000] text-white"
              : "bg-slate-100 text-[#800000]"
          }`}>
            {features.panorama.icon}
          </div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">
            360° Virtual Views
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Explore the campus in an interactive 360-degree virtual walkthrough.
          </p>
        </button>

        {/* Tab 2 */}
        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-start text-left p-6 rounded-[20px] border transition-all duration-300 cursor-pointer ${
            activeTab === "search"
              ? "border-[#800000] bg-white shadow-lg shadow-slate-100 scale-[1.02]"
              : "border-slate-200/60 bg-slate-50/50 hover:bg-slate-50/80 hover:scale-[1.01]"
          }`}
        >
          <div className={`p-3 rounded-xl mb-4 transition-colors ${
            activeTab === "search"
              ? "bg-[#800000] text-white"
              : "bg-slate-100 text-[#800000]"
          }`}>
            {features.search.icon}
          </div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">
            Instant Room Search
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Locate any classroom, office, or facility on campus instantly.
          </p>
        </button>

        {/* Tab 3 */}
        <button
          onClick={() => setActiveTab("directions")}
          className={`flex flex-col items-start text-left p-6 rounded-[20px] border transition-all duration-300 cursor-pointer ${
            activeTab === "directions"
              ? "border-[#800000] bg-white shadow-lg shadow-slate-100 scale-[1.02]"
              : "border-slate-200/60 bg-slate-50/50 hover:bg-slate-50/80 hover:scale-[1.01]"
          }`}
        >
          <div className={`p-3 rounded-xl mb-4 transition-colors ${
            activeTab === "directions"
              ? "bg-[#800000] text-white"
              : "bg-slate-100 text-[#800000]"
          }`}>
            {features.directions.icon}
          </div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">
            Optimal Walking Directions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Get detailed route recommendations and pathways between facilities.
          </p>
        </button>
      </div>
    </div>
  );
}
