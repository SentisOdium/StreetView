import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAutoCompleteFetch from "../../components/hooks/useAutocomplete";
import Search from "../../components/ui/reusableUI/search";
import type { MapNode } from "../../components/api/types/types_api";
import {
  SearchIcon,
  ClearIcon,
} from "../../components/ui/reusableUI/logo.exports";
import { useReveal } from "./utils";

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

  const handleSelect = (node: MapNode) => {
    setSearch(node.node_name);
    navigate("/tour", {
      state: { targetNode: node },
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      const distance = Math.abs(
        viewportCenter - elementCenter
      );

      const maxDistance = window.innerHeight * 0.75;

      const progress = Math.max(
        0,
        1 - distance / maxDistance
      );

      // Scale from 0.95 → 1.05
      setScale(0.95 + progress * 0.1);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () =>
      window.removeEventListener("scroll", handleScroll);
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
      className={`relative flex items-center justify-center min-h-[1000px] transition-all duration-700 ${reveal.visible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-12"
        }`}
    >
      <div
        ref={sectionRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative w-full max-w-[calc(90%-192px)] h-[82vh] overflow-hidden rounded-[32px] transition-transform duration-300 ease-out will-change-transform"      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/landingPanorama/ITECH_CENTER.webp')",
          }}
        />

        {/* Dark Overlay */}
        <div className={`absolute inset-0 transition-colors duration-700 ${isGlowing ? "bg-black/70" : "bg-black/40"}`} />

        {/* Content */}
        <div className="relative z-10 flex min-h-[880px] flex-col items-center justify-center px-6">
          <h2 className="mb-8 text-center text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
            Where would <span className={`transition-colors duration-700 ${isGlowing ? "text-[#800000] delay-[900ms]" : "delay-0"}`}>you</span> like to go?
          </h2>

          <div className="relative flex w-full max-w-2xl flex-col items-center">
            <div
              className={`flex h-16 w-full items-center justify-between bg-white px-4 py-1 transition-all duration-700 ${search.length > 0
                ? "rounded-t-2xl"
                : "rounded-2xl shadow-2xl"
                } ${isGlowing ? "scale-[1.03] ring-4 ring-[#800000]/40 shadow-[0_0_32px_rgba(128,0,0,0.3)]" : "scale-100"}`}
            >
              <div className="flex-1 w-full text-lg">
                <Search
                  inputRef={inputRef}
                  value={search}
                  onChange={setSearch}
                  placeholder="Search for a building or facility..."
                  items={list || []}
                  loading={loading}
                  error={errorMessage}
                  getLabel={(node: MapNode) =>
                    node.node_name
                  }
                  getKey={(node: MapNode) => node.id}
                  onSelect={handleSelect}
                  noModal={true}
                  modalDesign="
                    max-h-[350px]
                    -ml-4
                    mt-2.5
                    w-168
                    overflow-y-auto
                    bg-white
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

              <div className="ml-2 flex space-x-2">
                <button
                  type="button"
                  aria-label="Focus search"
                  onClick={() =>
                    inputRef.current?.focus()
                  }
                  className="cursor-pointer rounded-2xl p-2 transition-colors hover:bg-gray-100"
                >
                  <SearchIcon sx={{ color: "#800000" }} />
                </button>

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="cursor-pointer rounded-2xl p-2 transition-colors hover:bg-gray-100"
                  >
                    <ClearIcon sx={{ color: "#800000" }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}