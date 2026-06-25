import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAutoCompleteFetch from "../../../components/hooks/useAutocomplete";
import Search from "../../../components/ui/reusableUI/search";
import type { MapNode } from "../../../components/api/types/types_api";
import {
  SearchIcon,
  ClearIcon,
} from "../../../components/ui/reusableUI/logo.exports";
import { useReveal } from "../utils";

export function SearchSection() {
  const { list, loading, error } = useAutoCompleteFetch();

  const [search, setSearch] = useState("");
  const [scale, setScale] = useState(0.95);
  const [isGlowing, setIsGlowing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const reveal = useReveal<HTMLElement>();

  const errorMessage = error || null;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (node: MapNode) => {
    setSearch(node.node_name);
    navigate("/tour", {
      state: { targetNode: node },
    });
  };

  const popularTags = ["ITECH Center", "Dean's Office", "Registrar", "Clinic", "OMIT Office"];

  const handleTagClick = (tagName: string) => {
    const foundNode = list?.find(node =>
      node.node_name.toLowerCase().includes(tagName.toLowerCase())
    );
    if (foundNode) {
      handleSelect(foundNode);
    } else {
      setSearch(tagName);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = Math.abs(viewportCenter - elementCenter);
      const maxDistance = window.innerHeight * 0.75;
      const progress = Math.max(0, 1 - distance / maxDistance);

      // Scale from 0.95 → 1.03 for a smoother effect
      setScale(0.95 + progress * 0.08);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleGlow = () => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 2000);
    };
    window.addEventListener("trigger-search-glow", handleGlow);
    return () => window.removeEventListener("trigger-search-glow", handleGlow);
  }, []);

  return (
    <section
      id="search-section"
      ref={reveal.ref}
      className={`relative flex items-center justify-center min-h-[80vh] sm:min-h-screen py-16 transition-all duration-700 ${reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
    >
      <div
        ref={sectionRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative w-[92%] md:max-w-7xl h-[65vh] sm:h-[75vh] overflow-hidden rounded-[32px] border border-slate-200/50 shadow-2xl transition-transform duration-500 ease-out will-change-transform bg-white flex flex-col"
      >
        {/* Background Image with Blur Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 scale-105"
          style={{
            backgroundImage: "url('/landingPanorama/ITECH_CENTER.webp')",
          }}
        />

        {/* Backdrop Glass Layer */}
        <div className={`absolute inset-0 backdrop-blur-[3px] transition-colors duration-700 ${isGlowing ? "bg-black/60" : "bg-black/45"
          }`} />

        {/* Content Panel */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 sm:px-12 text-center">
          <h2 className="mb-6 text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Where would <span className={`transition-colors duration-700 ${isGlowing ? "text-[#b31919] drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "text-white"}`}>you</span> like to go?
          </h2>
          <p className="mb-8 text-slate-200/90 text-sm sm:text-base max-w-lg leading-relaxed hidden sm:block">
            Search for campus facilities, classrooms, or office locations to start your virtual walkthrough.
          </p>

          <div className="relative flex w-full max-w-4xl flex-col items-center gap-4">
            {/* Search Input Box */}
            <div
              className={`relative flex h-14 sm:h-16 w-full items-center justify-between bg-white/95 backdrop-blur px-4 py-1 transition-all duration-300 border border-slate-200 ${isDropdownOpen ? "rounded-t-2xl border-b-slate-100" : "rounded-2xl shadow-lg"
                } ${isGlowing ? "scale-[1.02] ring-4 ring-[#800000]/40 shadow-[0_0_32px_rgba(128,0,0,0.3)]" : "scale-100"}`}
            >
              <div className="flex-1 w-full text-base sm:text-lg">
                <Search
                  inputRef={inputRef}
                  value={search}
                  onChange={setSearch}
                  placeholder="Search for a building..."
                  items={list || []}
                  loading={loading}
                  error={errorMessage}
                  getLabel={(node: MapNode) => node.node_name}
                  getKey={(node: MapNode) => node.id}
                  onSelect={handleSelect}
                  noModal={true}
                  noRelativeWrapper={true}
                  onDropdownVisibilityChange={setIsDropdownOpen}
                  modalDesign="
                    max-h-[200px]
                    md:max-h-[240px]
                    overflow-y-auto
                    bg-white/98
                    backdrop-blur-md
                    shadow-2xl
                    rounded-b-2xl
                    [&::-webkit-scrollbar]:hidden
                    [-ms-overflow-style:none]
                    [scrollbar-width:none]
                    text-left
                    border-t
                    border-gray-100
                  "
                />
              </div>

              <div className="ml-2 flex space-x-1 sm:space-x-2">
                <button
                  type="button"
                  aria-label="Focus search"
                  onClick={() => inputRef.current?.focus()}
                  className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-slate-100 text-[#800000]"
                >
                  <SearchIcon />
                </button>

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-slate-100 text-[#800000]"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Popular/Quick Navigation Tags */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-2 w-full">
              <span className="text-slate-300 text-xs mr-1 font-medium select-none">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all duration-300 cursor-pointer active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}