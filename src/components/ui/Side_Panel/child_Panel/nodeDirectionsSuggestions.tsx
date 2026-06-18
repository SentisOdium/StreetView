import type { MapNode } from "../../../api/types/types_api"

interface NodeDirectionsSuggestionsProps {
  activeNode: MapNode | undefined;
  list: MapNode[];
  handleLocationSelect: (node: any) => void;
}

export default function NodeDirectionsSuggestions({
  activeNode,
  list,
  handleLocationSelect,
}: NodeDirectionsSuggestionsProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {activeNode && (
          <button
            key="current-location"
            onClick={() =>
              handleLocationSelect({ id: -1, node_name: "Current Location", type: "special" })
            }
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all duration-200 group text-slate-700 hover:text-[#800000] border-b border-dashed border-slate-100"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 group-hover:bg-[#800000] transition-colors shrink-0" />
            <span className="text-sm font-bold text-amber-600 transition-colors leading-tight">
              Use Current Location
            </span>
          </button>
        )}
        {list?.map((node: any) => (
          <button
            key={node.id}
            onClick={() => handleLocationSelect(node)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all duration-200 group text-slate-700 hover:text-[#800000]"
          >
            {/* Small modern map-dot indicator */}
            <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#800000] transition-colors shrink-0" />
            <span className="text-sm font-semibold transition-colors leading-tight">
              {node.node_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
