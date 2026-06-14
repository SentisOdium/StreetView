import { useState } from "react";
import useNodeDetailsFetch from "../../../hooks/useNodeDetailsFetch";
import { Loading, Error } from "../../reusableUI/emptySearchUi";
import { WayfinderLogo1, DirectionsIcon, ShareIcon, AccessTimeFilledIcon, ContactPhoneIcon } from "../../reusableUI/logo.exports";
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
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!details?.Current) return;

    const slug = details.Current.node_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const shareUrl = `${window.location.origin}${window.location.pathname}?nodeId=${details.Current.id}&slug=${slug}`;

    if (navigator.share) {
      navigator.share({
        title: details.Current.node_name,
        text: `Campus location: ${details.Current.node_name}`,
        url: shareUrl,
      })
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback if share sheet fails or is cancelled
          navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        });
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
        });
    }
  };

  if (selectedNodeId == null) return null;

  if (loading && !details) {
    return (
      <div className="flex h-screen w-120 items-center justify-center border-r border-slate-100 bg-white shadow-2xl rounded-br-[32px]">
        <Loading loading message="Loading location details..." />
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="w-120 border-r border-slate-100 bg-white p-4 shadow-2xl rounded-br-[32px]">
        <Error error={error} />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex h-screen w-120 items-center justify-center border-r border-slate-100 bg-white p-6 text-center text-sm text-gray-600 shadow-2xl rounded-br-[32px]">
        No details available for this location.
      </div>
    );
  }

  const heroSrc =
    panoramaImageUrl(details.Current?.img?.src) ?? WayfinderLogo1;

  const firstRoomWithPhone = details.Room_Sprite?.find((r) => r.phone);
  const firstRoomWithHours = details.Room_Sprite?.find((r) => r.hours);

  const phoneDisplay = firstRoomWithPhone?.phone || "(555) 123-4567";
  const hoursDisplay = firstRoomWithHours?.hours || "7:00 AM - 11:00 PM";


  return (
    <div className="h-screen w-120 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-r border-slate-100 bg-white shadow-2xl animate-slideDown flex flex-col rounded-br-[32px] overflow-hidden">
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

      {/* Hero Image Section */}
      <div className="relative w-full h-64 shrink-0">
        <img
          src={heroSrc}
          alt={details.Current?.img?.alt || details.Current?.node_name || "Location"}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Title & Metadata */}
      <div className="px-6 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
          {details.Current?.node_name}
        </h1>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          {details.Current?.node_name} • Campus Landmark
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 flex items-center gap-4 shrink-0">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 border transition-all duration-300 px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm active:scale-95 cursor-pointer ${copied
              ? "border-amber-500 bg-amber-50/50 text-amber-700 font-bold"
              : "border-slate-200 hover:border-[#800000]/30 hover:bg-slate-50 text-slate-800"
            }`}
          onClick={handleShare}
        >
          {copied ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ShareIcon className="text-slate-600" sx={{ fontSize: 18 }} />
              <span>Share</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onDirections}
          className="flex-1 flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#660000] text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <DirectionsIcon sx={{ fontSize: 18 }} />
          <span>Directions</span>
        </button>
      </div>

      {/* About Section */}
      <div className="px-6 py-4 flex-1">
        <h2 className="text-lg font-bold text-slate-900 mb-2">About this location</h2>
        <div className="text-sm text-slate-600 leading-relaxed space-y-3">
          {details.Room_Sprite?.length ? (
            details.Room_Sprite.map((room) => (
              <div key={room.room_number} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">{room.room_type}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{room.room_description}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic">No room information for this location.</p>
          )}
        </div>
      </div>

      {/* Footer Info Cards */}
      <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-4 shrink-0">
        {/* Phone Card */}
        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3">
          <ContactPhoneIcon className="text-[#800000]" sx={{ fontSize: 22 }} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Contact</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{phoneDisplay}</p>
          </div>
        </div>

        {/* Hours Card */}
        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3">
          <AccessTimeFilledIcon className="text-[#800000]" sx={{ fontSize: 22 }} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Today's Hours</p>
            <p className="text-xs font-bold text-slate-800 mt-1">{hoursDisplay}</p>
          </div>
        </div>
      </div>

      {/* Back Actions */}
      {canGoBack && !hasDirectionsPanel && (
        <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-2xl bg-[#800000] hover:bg-[#660000] py-3 font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 cursor-pointer text-center text-sm"
          >
            Back
          </button>
        </div>
      )}

      {hasDirectionsPanel && (
        <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-2xl bg-[#800000] hover:bg-[#660000] py-3 font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 cursor-pointer text-center text-sm"
          >
            Back to Node Directions
          </button>
        </div>
      )}
    </div>
  );
}
