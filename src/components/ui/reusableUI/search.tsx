import { useMemo, useState, useId, useRef, type RefObject } from "react";
import Modal from "./modal";
import { Loading, Error } from "./emptySearchUi";
import { EmptySearchUi } from "./emptySearchUi";

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
  } = props;

  const [showModal, setShowModal] = useState(false);
  const localInputRef = useRef<HTMLInputElement>(null);
  const resolvedInputRef = inputRef ?? localInputRef;
  const listboxId = useId();

  const filteredList = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      getLabel(item).toLowerCase().includes(query)
    );
  }, [items, value, getLabel]);

  return (
    <>
      <div className="min-w-0 flex-1">
        <input
          ref={resolvedInputRef}
          type="search"
          className="w-full flex-1 outline-none placeholder:italic disabled:cursor-not-allowed disabled:opacity-60"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-expanded={showModal && value.length > 0}
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
            if (e.key === "Escape") setShowModal(false);
          }}
        />
      </div>

      <Modal
        isVisible={showModal && value.length > 0 && !disabled}
        onClose={() => setShowModal(false)}
        design={modalDesign ?? ""}
      >
        <div id={listboxId} role="listbox">
          <Loading loading={loading} message="Loading locations..." />
          <Error error={error} />

          {!loading && !error && filteredList.length > 0 && (
            <ul>
              {filteredList.map((item) => {
                const key = getKey?.(item) ?? getLabel(item);
                return (
                  <li
                    key={key}
                    role="option"
                    onClick={() => {
                      onSelect(item);
                      setShowModal(false);
                    }}
                    className="cursor-pointer rounded-xl p-2 hover:bg-gray-100"
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
      </Modal>
    </>
  );
}
