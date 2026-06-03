import { useRef, useState } from "react";
import Search from "../../reusableUI/search";
import type { SearchUiProps } from "../types/sidePanelProps";
import type { MapNode } from "../../../api/types/types_api";
import { SearchIcon, DirectionsIcon, ClearIcon } from "../../reusableUI/logo.exports";

export default function SearchUI2(props: SearchUiProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const errorMessage =
    typeof props.error === "string"
      ? props.error
      : props.error instanceof Error
        ? props.error.message
        : null;

  return (
    <div className="ml-14.75">
      <div
        className={`z-20 m-4 flex h-12 w-90 items-center justify-between bg-white px-4 pt-1 pb-1 ${
          search.length > 0 ? "rounded-2xl" : "rounded-2xl shadow-xl"
        }`}
      >
        <Search
          inputRef={inputRef}
          value={search}
          onChange={setSearch}
          placeholder="Enter your Destination"
          items={props.list || []}
          loading={props.loading}
          error={errorMessage}
          getLabel={(node: MapNode) => node.node_name}
          getKey={(node: MapNode) => node.id}
          onSelect={(node: MapNode) => {
            props.onSelect(node);
            setSearch(node.node_name);
          }}
          modalDesign="mt-[64.6px] ml-auto mr-4 w-90 max-h-[300px] overflow-y-auto shadow-xl animate-slideDown [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        />

        <div className="ml-2 flex space-x-2">
          <button
            type="button"
            aria-label="Focus search"
            onClick={() => inputRef.current?.focus()}
            className="cursor-pointer rounded-2xl p-1 hover:bg-gray-100"
          >
            <SearchIcon sx={{ color: "#800000" }} />
          </button>
          {!search ? (
            <button
              type="button"
              aria-label="Open directions"
              onClick={props.onDirections}
              className="cursor-pointer rounded-2xl p-1 hover:bg-gray-100"
            >
              <DirectionsIcon sx={{ color: "#800000" }} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="cursor-pointer rounded-2xl p-1 hover:bg-gray-100"
            >
              <ClearIcon sx={{ color: "#800000" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
