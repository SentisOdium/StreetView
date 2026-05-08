
import { useMemo, useState } from "react";
import Modal from "./modal";
import { Loading, Error } from "./emptySearchUi";
import { EmptySearchUi } from "./emptySearchUi";

type SearchProps<T> = {
    items: T[];
    value: string;
    onChange: (value: string) => void;
    onSelect: (item: T) => void;
    getLabel: (item: T) => string;
    placeholder?: string;
    loading?: boolean;
    error?: any;
    modalDesign?: string;
    disabled?: boolean;
}

export default function Search<T>(props: SearchProps<T>) {
    const { items, value, onChange, onSelect, getLabel, placeholder, loading, error, modalDesign, disabled } = props;

    const [showModal, setShowModal] = useState(false);

    const filteredList = useMemo(() => {
        return items.filter(item =>
            getLabel(item).toLowerCase().includes(value.toLowerCase())
        );
    }, [items, value, getLabel]);

    return (
        <>
            <div>
                <input
                    type="text"
                    className="w-full flex-1 outline-none placeholder:italic"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowModal(true);
                    }}
                    onFocus={() => {
                        if (disabled) return;
                        setShowModal(true)
                    }}
                />
            </div>

            <Modal
                isVisible={showModal && value.length > 0}
                onClose={() => setShowModal(false)}
                design={`${modalDesign} `}
            >
                <Loading loading={loading} message="Loading locations..." />
                <Error error={error} />

                {!loading && !error && filteredList.length > 0 && (
                    <ul>
                        {filteredList.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    onSelect(item);
                                    setShowModal(false);
                                }}
                                className="hover:bg-gray-100 p-2 cursor-pointer rounded-xl"
                            >
                                {getLabel(item)}
                            </li>
                        ))}
                    </ul>
                )}

                {!loading && !error && value.length > 0 && filteredList.length === 0 && (
                    <div className="text-gray-500 italic">
                        <EmptySearchUi />
                    </div>
                )}
            </Modal>
        </>
    );
}