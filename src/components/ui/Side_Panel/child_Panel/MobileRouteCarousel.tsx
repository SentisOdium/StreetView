import { useMemo, useEffect, useRef } from "react";
import useRouteDirection from "../../../hooks/useRouteDirection";
import { Loading } from "../../reusableUI/emptySearchUi";
import { VrpanoIcon } from "../../reusableUI/logo.exports";
import type { NodeRoute } from "../../../api/types/types_api";

type MobileRouteCarouselProps = {
  locA: string;
  locB: string;
  resolvedLocA?: string;
  resolvedLocB?: string;
  onSelectedRouteNode: (node: NodeRoute) => void;
  onEditRoute: () => void;
};

type DirectionStep = {
  target: NodeRoute;
  totalDist: number;
  isStart?: boolean;
};

export default function MobileRouteCarousel({
  locA,
  locB,
  resolvedLocA,
  resolvedLocB,
  onSelectedRouteNode,
  onEditRoute,
}: MobileRouteCarouselProps) {
  const { route, loading, error } = useRouteDirection({
    src: resolvedLocA || locA,
    dest: resolvedLocB || locB,
  });

  const steps: DirectionStep[] = useMemo(() => {
    if (!route || route.length === 0) return [];

    return route.map((node, index) => ({
      target: node,
      totalDist: node.dist || 0,
      isStart: index === 0,
    }));
  }, [route]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!steps.length || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index) && steps[index]) {
              onSelectedRouteNode(steps[index].target);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.6,
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [steps, onSelectedRouteNode]);

  useEffect(() => {
    if (steps.length > 0) {
      onSelectedRouteNode(steps[0].target);
    }
  }, [steps.length, onSelectedRouteNode]);

  if (loading) {
    return (
      <div className="absolute bottom-4 left-0 w-full z-50 flex justify-center">
        <div className="bg-white rounded-[24px] shadow-lg px-6 py-4 flex flex-col items-center mx-4">
          <Loading loading message="Calculating route..." />
        </div>
      </div>
    );
  }

  if (error || !route?.length) {
    return (
      <div className="absolute bottom-4 left-0 w-full z-50 flex justify-center pointer-events-auto">
        <div className="bg-white rounded-[24px] shadow-lg px-6 py-4 flex flex-col items-center mx-4 text-center">
          <p className="text-sm text-gray-500 font-semibold mb-3">No Valid Route Found</p>
          <button
            onClick={onEditRoute}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm font-semibold active:scale-95 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 w-full z-[100] flex flex-col items-start pointer-events-none pb-4">
      {/* Floating Edit Route "X" Button (Top Left of Carousel) */}
      <div className="w-full px-4 mb-3 flex justify-start pointer-events-auto">
        <button
          onClick={onEditRoute}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-transform"
          title="Exit Route View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="w-full flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {steps.map((step, index) => {
          const isDest = index === steps.length - 1 && !step.isStart;
          const stepLabel = step.isStart ? "Start" : isDest ? "Destination" : `Step ${index}`;

          return (
            <div
              key={step.target.id}
              data-index={index}
              ref={(el) => { cardRefs.current[index] = el; }}
              className="snap-center shrink-0 w-[85vw] max-w-[340px] bg-white rounded-[24px] p-5 shadow-lg flex items-center gap-4 relative"
            >
              {/* Waypoint/Direction Icon Container */}
              <div className={`h-12 w-12 rounded-full flex flex-col items-center justify-center shrink-0 shadow-sm
                ${step.isStart ? 'bg-amber-100 text-amber-700' : isDest ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {step.isStart ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                ) : isDest ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                )}
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {step.isStart ? `Start at ${step.target.name}` : `Go towards ${step.target.name}`}
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-[13px] text-gray-500 font-medium">
                  <span className={`${step.isStart ? 'text-amber-700' : isDest ? 'text-green-700' : 'text-blue-700'}`}>{stepLabel}</span>
                  {step.totalDist > 0 && (
                    <>
                      <span>•</span>
                      <span>{step.totalDist}m</span>
                    </>
                  )}
                </div>
              </div>

              <div className="absolute top-4 right-4 text-gray-300">
                <VrpanoIcon sx={{ fontSize: 18 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
