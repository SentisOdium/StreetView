import { PanoramaViewer } from "./PanoramaViewer";
import { SearchMockup } from "./SearchMockup";
import { DirectionsFlow } from "./DirectionsFlow";

export interface FeatureItem {
  id: string;
  badgeText: string;
  subtitle: string;
  title: React.ReactNode;
  descriptions: string[];
  icon: React.ReactNode;
  mockup: React.ReactNode;
}

export const features = {
  panorama: {
    id: "wayfinder-3d-panorama",
    badgeText: "Live 3D View",
    subtitle: "3D Campus Tour",
    title: (
      <>
        Immerse in virtual <span className="text-[#800000]">3D exploration</span>
      </>
    ),
    descriptions: [
      "Look around specific buildings and facilities before you physically arrive on campus. Rotate and navigate classrooms.",
      "Our high-resolution 3D virtual panoramas offer a realistic walkthrough of floor layouts and student corridors."
    ],
    icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    mockup: <PanoramaViewer />
  },
  search: {
    id: "wayfinder-room-search",
    badgeText: "Active Search",
    subtitle: "Smart Room Locator",
    title: (
      <>
        Find any <span className="text-[#800000]">campus room</span> in seconds
      </>
    ),
    descriptions: [
      "Search classroom numbers, staff offices, and facilities directly. Get fast results with floor location info.",
      "Type any room name, building name, or facility shortcut to highlight its location on our interactive map index immediately."
    ],
    icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    mockup: <SearchMockup />
  },
  directions: {
    id: "wayfinder-pathfinding-graph",
    badgeText: "Active Pathfinding",
    subtitle: "Navigation Pathways",
    title: (
      <>
        Get optimal <span className="text-[#800000]">walking directions</span>
      </>
    ),
    descriptions: [
      "Calculate shortest routes between locations and receive clear step-by-step path guidance throughout the campus.",
      "Easily commute between classes, locate stairs, and view path segments in our interactive live node graph."
    ],
    icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    mockup: <DirectionsFlow />
  }
};
