import { useState, useMemo } from "react"
import useAutoCompleteFetch from "../../hooks/useAutocomplete";
import useShowModal from "../../hooks/useShowModal";
import useLoadingError from "../../hooks/useLoadingError";

import Modal from "./modal"
import { EmptySearchUi, Loading, Error } from "./emptySearchUi";
type Direction_SearchUiProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;    
    placeholder: string;
    modalLoc?: string;
}
export default function Direction_SearchUi({value, onChange, placeholder, modalLoc}:Direction_SearchUiProps){
    
    const [tempLoc, setTempLoc] = useState<string>("")
    const { list } = useAutoCompleteFetch()
    const {showModal, setShowModal} = useShowModal()
    const {error, loading} = useLoadingError()

    const filteredList = useMemo(() => {
            if (!list) return [];
            
            return list.filter(node =>
                (node.node_name ?? "").toLowerCase().includes(value.toLowerCase())
            );
        }, [value,  list]);
    return(
        <>
            
            <input 
                type="text" 
                value={value}
                onChange={onChange}
                onClick={() => setShowModal(true)}
                className="w-full outline-none placeholder:italic bg-transparent"
                placeholder={placeholder}
            />

            <Modal 
                    isVisible={showModal} 
                    onClose={() => setShowModal(false)}
                    design={`fixed z-10 shadow-xl animate-slideDown`}>
                        <Loading loading={loading} message="Loading locations..."/>
                        <Error error={error}/>

                        {!loading && !error && (tempLoc.length > 0 ?
                        (
                            <ul>
                                {filteredList.map(node =>(
                                    <li 
                                        key={node.id}>
                                            {node.node_name}
                                    </li>
                                ))}
                            </ul>
                        )
                        : 
                        (
                            <div 
                                className="text-gray-500 italic">   
                                    <EmptySearchUi/>
                            </div>
                        ))}
            </Modal>
        </>
    )
}