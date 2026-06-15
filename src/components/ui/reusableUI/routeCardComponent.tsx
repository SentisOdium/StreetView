import { useState, useMemo } from "react";
import useRouteDirection from "../../hooks/useRouteDirection";
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch";
import { EmptySearchUi, Loading, Error } from "./emptySearchUi";
import { VrpanoIcon } from "./logo.exports";
import { panoramaImageUrl } from "../../utils/imageUrl";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import type { NodeRoute } from "../../api/types/types_api";

type RouteCardProps = {
  locA: string;
  locB: string;
  resolvedLocA?: string;
  resolvedLocB?: string;
  onSelectedRouteNode: (node: NodeRoute) => void;
};

type DirectionStep = {
  target: NodeRoute;
  transitionalNodes: NodeRoute[];
  totalDist: number;
  isStart?: boolean;
};

type CompactCardProps = {
  nodeId: number;
  nodeName: string;
  onPreview: () => void;
};

function CompactLocationCard({ nodeId, nodeName, onPreview }: CompactCardProps) {
  const { details } = useNodeDetailsFetch(nodeId);
  const imgSrc = details?.Current?.img?.src ? panoramaImageUrl(details.Current.img.src) : null;

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:border-[#800000]/20 transition-all duration-200">
      <div className="h-10 w-14 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={nodeName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-100/50">
            <span className="text-[10px] text-slate-400">No img</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{nodeName}</p>
        <p className="text-[10px] text-slate-400 leading-none mt-0.5">Passing waypoint</p>
      </div>
      <button
        type="button"
        onClick={onPreview}
        className="p-1.5 rounded-lg text-slate-400 hover:text-[#800000] hover:bg-slate-50 transition active:scale-[0.95] shrink-0 cursor-pointer"
        title="Preview in Panorama"
      >
        <VrpanoIcon sx={{ fontSize: 16 }} />
      </button>
    </div>
  );
}

type RouteStepProps = {
  step: DirectionStep;
  index: number;
  onSelectedRouteNode: (node: NodeRoute) => void;
};

function RouteStepCard({ step, index, onSelectedRouteNode }: RouteStepProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasTransitional = step.transitionalNodes.length > 0;

  if (step.isStart) {
    return (
      <div className="relative">
        <span className="absolute -left-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
        
        <div className="rounded-2xl p-4 bg-amber-50/5 hover:bg-amber-50/10 transition border border-amber-100/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Starting Point</span>
              <p className="text-sm font-semibold text-amber-800 mt-0.5">{step.target.name}</p>
              {step.totalDist > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-semibold italic">{step.totalDist}m</span> leg distance
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label={`Open panorama for ${step.target.name}`}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 transition active:scale-[0.95] cursor-pointer"
                onClick={() => onSelectedRouteNode(step.target)}
                title="View in Panorama"
              >
                <VrpanoIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {hasTransitional && (
            <div className="mt-2 border-t border-amber-100 pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 transition cursor-pointer select-none"
              >
                {isExpanded ? (
                  <ExpandLessIcon sx={{ fontSize: 14 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 14 }} />
                )}
                <span>Passing Through ({step.transitionalNodes.length})</span>
              </button>

              {isExpanded && (
                <div className="mt-2 flex flex-col gap-2 pl-2 border-l border-amber-200 animate-slideDown">
                  {step.transitionalNodes.map((tNode) => (
                    <CompactLocationCard
                      key={tNode.id}
                      nodeId={tNode.id}
                      nodeName={tNode.name}
                      onPreview={() => onSelectedRouteNode(tNode)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step.totalDist === 0) {
    return (
      <div className="relative">
        <span className="absolute -left-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#800000] ring-4 ring-[#800000]/10" />
        
        <div className="rounded-2xl p-4 bg-[#800000]/5 hover:bg-[#800000]/10 transition border border-[#800000]/40 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#800000] uppercase tracking-wider block">Destination</span>
            <p className="text-sm font-semibold text-[#800000] mt-0.5">{step.target.name}</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label={`Open panorama for ${step.target.name}`}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#800000]/5 hover:bg-[#800000]/10 text-[#800000] transition active:scale-[0.95] cursor-pointer"
              onClick={() => onSelectedRouteNode(step.target)}
              title="View in Panorama"
            >
              <VrpanoIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepNumber = index;

  return (
    <div className="relative">
      <span className="absolute -left-2.5 top-2.5 h-2 w-2 rounded-full bg-[#800000] ring-4 ring-[#800000]/10" />
      
      <div className="rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50/80 transition border border-slate-100/85 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {step.totalDist === 0 ? "Destination" : `Step ${stepNumber}`}
            </span>
            <p className="text-sm font-semibold text-[#800000] mt-0.5">Go towards {step.target.name}</p>
            {step.totalDist > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold italic">{step.totalDist}m</span> leg distance
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label={`Open panorama for ${step.target.name}`}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#800000]/5 hover:bg-[#800000]/10 text-[#800000] transition active:scale-[0.95] cursor-pointer"
              onClick={() => onSelectedRouteNode(step.target)}
              title="View in Panorama"
            >
              <VrpanoIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {hasTransitional && (
          <div className="mt-2 border-t border-slate-200/50 pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer select-none"
            >
              {isExpanded ? (
                <ExpandLessIcon sx={{ fontSize: 14 }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 14 }} />
              )}
              <span>Passing Through ({step.transitionalNodes.length})</span>
            </button>

            {isExpanded && (
              <div className="mt-2 flex flex-col gap-2 pl-2 border-l border-slate-200 animate-slideDown">
                {step.transitionalNodes.map((tNode) => (
                  <CompactLocationCard
                    key={tNode.id}
                    nodeId={tNode.id}
                    nodeName={tNode.name}
                    onPreview={() => onSelectedRouteNode(tNode)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RouteCardComponent({
  locA,
  locB,
  resolvedLocA,
  resolvedLocB,
  onSelectedRouteNode,
}: RouteCardProps) {
  const { route, loading, error } = useRouteDirection({
    src: resolvedLocA || locA,
    dest: resolvedLocB || locB,
  });

  const steps: DirectionStep[] = useMemo(() => {
    if (!route || route.length === 0) return [];

    const result: DirectionStep[] = [];
    let currentStep: DirectionStep | null = null;

    for (let i = 0; i < route.length; i++) {
      const node = route[i];
      const isLastNode = i === route.length - 1;

      if (i === 0) {
        currentStep = {
          target: node,
          transitionalNodes: [],
          totalDist: 0,
          isStart: true,
        };
        result.push(currentStep);
        
        if (isLastNode) {
          currentStep.totalDist = 0;
        }
      } else if (isLastNode) {
        if (currentStep) {
          currentStep.totalDist += node.dist;
        }
        result.push({
          target: node,
          transitionalNodes: [],
          totalDist: 0,
        });
      } else {
        if (node.type === "transitional") {
          if (currentStep) {
            currentStep.transitionalNodes.push(node);
            currentStep.totalDist += node.dist;
          }
        } else {
          if (currentStep) {
            currentStep.totalDist += node.dist;
          }
          currentStep = {
            target: node,
            transitionalNodes: [],
            totalDist: 0,
          };
          result.push(currentStep);
        }
      }
    }

    return result;
  }, [route]);

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
        <Loading loading message="Calculating route..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
        <Error error={error} message="Failed to calculate route." />
      </div>
    );
  }

  if (!route?.length) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        <EmptySearchUi />
        No route found between these locations.
      </div>
    );
  }

  return (
    <div className="mt-6 mx-auto flex w-full max-w-xl rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex-1">
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-medium">Route Directions</p>
          <h2 className="text-base font-bold text-gray-800 tracking-tight">
            {locA} → {locB}
          </h2>
        </div>

        <div className="relative space-y-4 border-l border-slate-200 pl-4 ml-1">
          {steps.map((step, index) => (
            <RouteStepCard
              key={step.target.id}
              step={step}
              index={index}
              onSelectedRouteNode={onSelectedRouteNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
