import {
  WayfinderLogo1,
  SearchIcon,
  DirectionsIcon,
} from "../../reusableUI/logo.exports";

export default function RedPanel() {
  return (
    <div className="absolute top-0 left-0 z-50 w-10 h-screen bg-white border-r border-white/10 shadow-2xl flex flex-col items-center py-4">
      {/* Logo */}
      <img
        src={WayfinderLogo1}
        alt="Logo"
        className="w-8 h-8 object-contain cursor-pointer  mt-2"
      />

      {/* Divider */}
      <div className="w-6 h-px bg-[#800000]/30 my-3" />

      {/* Search */}
      <div className="relative group cursor-pointer">
        <SearchIcon
          sx={{ color: "maroon", fontSize: 28 }}
          className="transition-all duration-200 group-hover:scale-110"
        />

        <div className="absolute left-14 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#800000] text-white text-lg font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-200">
          Search Locations
        </div>
      </div>

      {/* Directions */}
      <div className="relative group cursor-pointer mt-6">
        <DirectionsIcon
          sx={{ color: "maroon", fontSize: 28 }}
          className="transition-all duration-200 group-hover:scale-110"
        />

        <div className="absolute left-14 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#800000] text-white text-lg font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-200">
          Generate Route
        </div>
      </div>
    </div>
  );
}