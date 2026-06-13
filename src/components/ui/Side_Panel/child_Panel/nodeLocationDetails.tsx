import useNodeDetailsFetch from "../../../hooks/useNodeDetailsFetch";
import { Loading, Error } from "../../reusableUI/emptySearchUi";
import { WayfinderLogo1, DirectionsIcon, ShareIcon } from "../../reusableUI/logo.exports";
import type { NodeLocationDetailsProps } from "../types/sidePanelProps";
import { panoramaImageUrl } from "../../../utils/imageUrl";

export default function NodeLocationDetails({
  selectedNodeId,
  onDirections,
  onBack,
  hasDirectionsPanel = false,
  canGoBack = false,
}: NodeLocationDetailsProps) {
  const { details, loading, error } = useNodeDetailsFetch(selectedNodeId);

  if (selectedNodeId == null) return null;

  if (loading && !details) {
    return (
      <div className="flex h-screen w-120 items-center justify-center border-gray-600 bg-white shadow-lg">
        <Loading loading message="Loading location details..." />
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="w-120 border-gray-600 bg-white p-4 shadow-lg">
        <Error error={error} />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex h-screen w-120 items-center justify-center border-gray-600 bg-white p-6 text-center text-sm text-gray-600 shadow-lg">
        No details available for this location.
      </div>
    );
  }

  const heroSrc =
    panoramaImageUrl(details.Current?.img?.src) ?? WayfinderLogo1;

  return (
    <div className="h-screen w-120 overflow-y-auto border-gray-600 bg-white shadow-lg animate-slideDown">
      {loading && (
        <div className="px-4 pt-2">
          <Loading loading message="Updating..." />
        </div>
      )}
      {error && (
        <div className="px-4 pt-2">
          <Error error={error} />
        </div>
      )}

      <img
        src={heroSrc}
        alt={details.Current?.img?.alt || details.Current?.node_name || "Location"}
        className="mb-2 h-62.5 w-full object-cover"
      />

      <div className="mb-2 flex justify-center gap-6 shadow-sm border-gray-300">
        <div className="flex flex-col items-center p-2">
          <button
            type="button"
            className="group flex cursor-pointer items-center justify-center rounded-full bg-[#800000]/10 p-2 shadow-xl transition-colors duration-300 hover:bg-[#800000]"
            aria-label="Share location"
            onClick={() => {
              if (navigator.share && details.Current?.node_name) {
                void navigator.share({
                  title: details.Current.node_name,
                  text: `Campus location: ${details.Current.node_name}`,
                });
              }
            }}
          >
            <ShareIcon className="text-2xl text-[#800000] transition-colors duration-300 group-hover:text-white" />
          </button>
          <p className="mt-1 text-center text-sm">Share</p>
        </div>

        <div className="flex flex-col items-center p-2">
          <button
            type="button"
            onClick={onDirections}
            className="group flex cursor-pointer items-center justify-center rounded-full bg-[#800000] p-2 shadow-xl transition-colors duration-300 hover:bg-[#800000]/10"
            aria-label="Show directions"
          >
            <DirectionsIcon className="text-2xl text-white transition-colors duration-300 group-hover:text-[#800000]" />
          </button>
          <p className="mt-1 text-center text-sm">Directions</p>
        </div>
      </div>

      <div className="px-4 py-2 shadow-sm">
        <h1 className="mb-3 text-2xl font-semibold">{details.Current?.node_name}</h1>

        {details.Room_Sprite?.length ? (
          details.Room_Sprite.map((room) => (
            <div key={room.room_number} className="mb-4">
              <h3 className="text-sm font-medium">{room.room_type}</h3>
              <p className="text-sm text-gray-600">{room.room_description}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No room information for this location.</p>
        )}
      </div>

      {canGoBack && !hasDirectionsPanel && (
        <div className="sticky bottom-0 flex justify-center border-t border-gray-100 bg-white/95 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-white/10 bg-[#800000] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#660000] active:scale-95"
          >
            Back
          </button>
        </div>
      )}

      {hasDirectionsPanel && (
        <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center pb-6">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-white/10 bg-[#800000] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#660000] active:scale-95 backdrop-blur-sm"
          >
            Back to Node Directions
          </button>
        </div>
      )}
    </div>
  );
}
