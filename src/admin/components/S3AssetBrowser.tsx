import { useEffect, useState, useMemo } from "react";
import { adminApi } from "../api/adminApi";
import type { S3Object } from "../api/types";
import { panoramaImageUrl } from "../../components/utils/imageUrl";
import { FaSearch, FaTimes, FaCloudDownloadAlt, FaChevronLeft, FaChevronRight, FaExpand } from "react-icons/fa";
import { debounce } from "../../components/utils/debounce";

type S3AssetBrowserProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
};

const ITEMS_PER_PAGE = 15;

export default function S3AssetBrowser({ isOpen, onClose, onSelect }: S3AssetBrowserProps) {
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setSelectedKey(null);
      setPreviewKey(null);
      setCurrentPage(1);
      adminApi.getS3Objects()
        .then((data) => {
          setObjects(data || []);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load S3 assets");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const updateDebouncedSearch = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 200),
    []
  );

  useEffect(() => {
    updateDebouncedSearch(searchQuery);
  }, [searchQuery, updateDebouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  if (!isOpen) return null;

  const s3KeysSet = new Set(objects.map(obj => obj.key));

  const mainObjects = objects.filter((obj) => !obj.key.toLowerCase().includes("_thumb."));

  const filteredObjects = mainObjects.filter((obj) =>
    obj.key.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const getThumbnailOrOriginalUrl = (key: string) => {
    const extIndex = key.lastIndexOf(".");
    const thumbKey = extIndex !== -1 
      ? `${key.substring(0, extIndex)}_thumb.webp` 
      : `${key}_thumb.webp`;

    if (s3KeysSet.has(thumbKey)) {
      return panoramaImageUrl(thumbKey);
    }
    return panoramaImageUrl(key);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredObjects.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedObjects = filteredObjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const previewIndex = filteredObjects.findIndex((obj) => obj.key === previewKey);

  const handlePrevPreview = () => {
    if (previewIndex > 0) {
      setPreviewKey(filteredObjects[previewIndex - 1].key);
    } else if (previewIndex === 0 && filteredObjects.length > 0) {
      setPreviewKey(filteredObjects[filteredObjects.length - 1].key);
    }
  };

  const handleNextPreview = () => {
    if (previewIndex !== -1 && previewIndex < filteredObjects.length - 1) {
      setPreviewKey(filteredObjects[previewIndex + 1].key);
    } else if (previewIndex === filteredObjects.length - 1 && filteredObjects.length > 0) {
      setPreviewKey(filteredObjects[0].key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewKey) return;
      if (e.key === "Escape") {
        setPreviewKey(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevPreview();
      } else if (e.key === "ArrowRight") {
        handleNextPreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewKey, previewIndex, filteredObjects]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-[85vh] w-[90vw] max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaCloudDownloadAlt className="text-[#800000] w-5 h-5" />
              S3 Asset Library
            </h3>
            <p className="text-xs text-slate-500">
              Select an existing panorama image directly from your S3 bucket
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#800000] focus:bg-white"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#800000]" />
              <p className="text-sm text-slate-500">Loading S3 assets...</p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-red-50 p-3 text-red-500">
                <FaTimes className="w-6 h-6" />
              </div>
              <h4 className="mt-3 font-semibold text-slate-800">Failed to Load Assets</h4>
              <p className="mt-1 text-sm text-slate-500 max-w-md">{error}</p>
            </div>
          ) : filteredObjects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
              <p className="text-sm text-slate-500">No assets found matching your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {paginatedObjects.map((obj) => {
                const isSelected = selectedKey === obj.key;
                const url = getThumbnailOrOriginalUrl(obj.key);

                return (
                  <div
                    key={obj.key}
                    onClick={() => setSelectedKey(obj.key)}
                    className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 ${isSelected
                        ? "border-[#800000] ring-2 ring-[#800000]/25 shadow-md bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"
                      }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                      <img
                        src={url || "/placeholder.png"}
                        alt={obj.key}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Enlarge button in the upper right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewKey(obj.key);
                        }}
                        className="absolute top-2.5 right-2.5 z-10 rounded-lg bg-black/50 p-2 text-white opacity-0 transition-all duration-200 hover:bg-[#800000] hover:scale-110 hover:text-white group-hover:opacity-100 flex items-center justify-center shadow-lg"
                        title="Enlarge image"
                      >
                        <FaExpand className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <div className="truncate text-xs font-semibold text-slate-700" title={obj.key}>
                        {obj.key}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {formatSize(obj.size)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 bg-white">
          {/* Pagination Controls */}
          {filteredObjects.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
              <span className="text-xs text-slate-400 ml-2">
                ({filteredObjects.length} total items)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedKey) {
                  onSelect(selectedKey);
                  onClose();
                }
              }}
              disabled={!selectedKey}
              className="rounded-xl bg-[#800000] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#800000]/15 hover:bg-[#680000] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Select Asset
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {previewKey && (
        <div 
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewKey(null)}
        >
          {/* Close button top right */}
          <button
            onClick={() => setPreviewKey(null)}
            className="absolute top-6 right-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
            title="Close Preview"
          >
            <FaTimes className="w-6 h-6" />
          </button>

          {/* Navigation - Left Arrow */}
          {filteredObjects.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPreview();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-4 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
              title="Previous Image"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Navigation - Right Arrow */}
          {filteredObjects.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPreview();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-4 text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
              title="Next Image"
            >
              <FaChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image Container */}
          <div 
            className="relative flex max-h-[75vh] max-w-[85vw] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={panoramaImageUrl(previewKey || undefined) || undefined}
              alt={previewKey || undefined}
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl border border-white/10 transition-transform duration-300"
            />
            
            {/* Info overlay below the image */}
            <div className="mt-4 flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-semibold text-white/90 truncate max-w-[80vw]" title={previewKey || undefined}>
                {previewKey || ""}
              </span>
              <span className="text-xs text-white/50">
                Image {previewIndex + 1} of {filteredObjects.length}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div 
            className="absolute bottom-8 flex gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewKey(null)}
              className="rounded-xl border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              Back to Library
            </button>
            <button
              onClick={() => {
                onSelect(previewKey);
                setPreviewKey(null);
                onClose();
              }}
              className="rounded-xl bg-[#800000] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#800000]/20 hover:bg-[#680000] hover:scale-105 transition-all duration-200"
            >
              Select this Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
