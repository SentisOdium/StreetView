import { useMemo, useState, useId, useRef, useEffect, type RefObject } from "react";
import Modal from "./modal";
import { Loading, Error } from "./emptySearchUi";
import { EmptySearchUi } from "./emptySearchUi";
import { debounce } from "../../utils/debounce";

type SearchProps<T> = {
  items: T[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  getLabel: (item: T) => string;
  getKey?: (item: T) => string | number;
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
  modalDesign?: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  noModal?: boolean;
  onDropdownVisibilityChange?: (visible: boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showOnFocusEmpty?: boolean;
  noRelativeWrapper?: boolean;
};

export default function Search<T>(props: SearchProps<T>) {
  const {
    items,
    value,
    onChange,
    onSelect,
    getLabel,
    getKey,
    placeholder,
    loading,
    error,
    modalDesign,
    disabled,
    inputRef,
    noModal,
    onDropdownVisibilityChange,
    noRelativeWrapper,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef ?? localInputRef;
  const listboxId = useId();
  const activeItemRef = useRef<HTMLLIElement>(null);

  const isDropdownOpen = showModal && (props.showOnFocusEmpty || value.length > 0) && !disabled;

  useEffect(() => {
    onDropdownVisibilityChange?.(isDropdownOpen);
  }, [isDropdownOpen, onDropdownVisibilityChange]);

  const [debouncedValue, setDebouncedValue] = useState(value);

  const updateDebouncedValue = useMemo(
    () => debounce((val: string) => setDebouncedValue(val), 150),
    []
  );

  useEffect(() => {
    updateDebouncedValue(value);
  }, [value, updateDebouncedValue]);

  // Reset activeIndex when query or list size changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedValue, items.length]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [activeIndex]);

  const filteredList = useMemo(() => {
    const query = debouncedValue.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      getLabel(item).toLowerCase().includes(query)
    );
  }, [items, debouncedValue, getLabel]);

  const dropdownContent = (
    <div id={listboxId} role="listbox" className={noModal ? modalDesign : undefined}>
      <Loading loading={loading} message="Loading locations..." />
      <Error error={error} />

      {!loading && !error && filteredList.length > 0 && (
        <ul>
          {filteredList.map((item, index) => {
            const key = getKey?.(item) ?? getLabel(item);
            const isActive = index === activeIndex;
            return (
              <li
                key={key}
                ref={isActive ? activeItemRef : null}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(item);
                  setShowModal(false);
                }}
                className={`cursor-pointer rounded-xl p-2 transition-colors ${
                  isActive ? "bg-gray-100 font-semibold text-[#800000]" : "hover:bg-gray-100"
                }`}
              >
                {getLabel(item)}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && value.length > 0 && filteredList.length === 0 && (
        <div className="text-gray-500 italic">
          <EmptySearchUi />
          <p className="pb-4 text-center text-sm">No locations match your search.</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`min-w-0 flex-1 ${noRelativeWrapper ? "" : "relative"}`}>
        <input
          ref={resolvedInputRef}
          type="search"
          className="w-full flex-1 outline-none placeholder:italic disabled:cursor-not-allowed disabled:opacity-60"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-expanded={showModal && (props.showOnFocusEmpty || value.length > 0)}
          aria-controls={listboxId}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setShowModal(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setShowModal(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowModal(false);
              setActiveIndex(-1);
            } else if (e.key === "ArrowDown") {
              if (!isDropdownOpen) {
                setShowModal(true);
              } else if (filteredList.length > 0) {
                e.preventDefault();
                setActiveIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : 0));
              }
            } else if (e.key === "ArrowUp") {
              if (isDropdownOpen && filteredList.length > 0) {
                e.preventDefault();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredList.length - 1));
              }
            } else if (e.key === "Enter") {
              if (isDropdownOpen && activeIndex >= 0 && activeIndex < filteredList.length) {
                e.preventDefault();
                onSelect(filteredList[activeIndex]);
                setShowModal(false);
              }
            }
            props.onKeyDown?.(e);
          }}
        />
        {noModal && showModal && (props.showOnFocusEmpty || value.length > 0) && !disabled && (
          <>
            {/* Invisible backdrop to catch clicks outside when noModal is true */}
            <div className="fixed inset-0 z-40" onClick={() => setShowModal(false)} />
            <div className="absolute top-full left-0 mt-2 w-full z-50">
              {dropdownContent}
            </div>
          </>
        )}
      </div>

      {!noModal && (
        <Modal
          isVisible={showModal && (props.showOnFocusEmpty || value.length > 0) && !disabled}
          onClose={() => setShowModal(false)}
          design={modalDesign ?? ""}
        >
          {dropdownContent}
        </Modal>
      )}
    </>
  );
}

