import { features } from "./featureData";

export function MobileFeatures() {
  return (
    <div className="flex lg:hidden flex-col gap-12 sm:gap-16 w-full">
      {/* Feature 1: Panorama Card */}
      <div className="bg-slate-50/50 rounded-[28px] sm:rounded-[36px] border border-slate-200/60 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col gap-8">
          {/* Copy/Text Column */}
          <div className="flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-2 text-[#800000] font-semibold text-xs sm:text-sm">
              {features.panorama.icon}
              <span>{features.panorama.subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {features.panorama.title}
            </h3>
            {features.panorama.descriptions.map((desc, idx) => (
              <p key={idx} className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {desc}
              </p>
            ))}
          </div>
          {/* Mockup viewer */}
          <div className="w-full aspect-[4/5] sm:aspect-[16/10] relative flex items-center justify-center">
            <div className="h-full w-full rounded-[20px] sm:rounded-[24px] border border-slate-200/60 relative overflow-hidden bg-white flex flex-col">
              {features.panorama.mockup}
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Room Search Card */}
      <div className="bg-slate-50/50 rounded-[28px] sm:rounded-[36px] border border-slate-200/60 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col gap-8">
          {/* Copy/Text Column */}
          <div className="flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-2 text-[#800000] font-semibold text-xs sm:text-sm">
              {features.search.icon}
              <span>{features.search.subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {features.search.title}
            </h3>
            {features.search.descriptions.map((desc, idx) => (
              <p key={idx} className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {desc}
              </p>
            ))}
          </div>
          {/* Mockup viewer */}
          <div className="w-full aspect-[4/5] sm:aspect-[16/10] relative flex items-center justify-center">
            <div className="h-full w-full rounded-[20px] sm:rounded-[24px] border border-slate-200/60 relative overflow-hidden bg-white flex flex-col">
              {features.search.mockup}
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: Directions Card */}
      <div className="bg-slate-50/50 rounded-[28px] sm:rounded-[36px] border border-slate-200/60 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col gap-8">
          {/* Copy/Text Column */}
          <div className="flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-2 text-[#800000] font-semibold text-xs sm:text-sm">
              {features.directions.icon}
              <span>{features.directions.subtitle}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {features.directions.title}
            </h3>
            {features.directions.descriptions.map((desc, idx) => (
              <p key={idx} className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {desc}
              </p>
            ))}
          </div>
          {/* Mockup viewer */}
          <div className="w-full aspect-[4/5] sm:aspect-[16/10] relative flex items-center justify-center">
            <div className="h-full w-full rounded-[20px] sm:rounded-[24px] border border-slate-200/60 relative overflow-hidden bg-white flex flex-col">
              {features.directions.mockup}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
