import { useState, useMemo } from "react"
import useAutoCompleteFetch from "../../hooks/useAutocomplete";
import useShowModal from "../../hooks/useShowModal";
import useLoadingError from "../../hooks/useLoadingError";

import Modal from "../reusableUI/modal"
import { EmptySearchUi, Loading, Error } from "../reusableUI/emptySearchUi";
import { SearchIcon, DirectionsIcon, ClearIcon } from "../reusableUI/logo.exports";
import { resetSearch, handleEnterKey } from "../../utils/searchFunctions";
import type { SearchUiProps } from "./types/sidePanelProps";

export default function SearchUi({currentNode, currentNodeName, renderLocationPanel}: SearchUiProps) {
    const [search, setSearch] = useState(""); 
    const {showModal, setShowModal} = useShowModal();
    const { error, loading } = useLoadingError();
    const { list } = useAutoCompleteFetch()

    const filteredList = useMemo(() => {
        if (!list) return [];
         
        return list.filter(node =>
            (node.node_name ?? "").toLowerCase().includes(search.toLowerCase())
        );
    }, [search, list]);

//console.log("SearchUI Rendered with search:", search, "filteredList length:", filteredList.length, "showModal:", showModal)//remove after testing

    return(
    <div className="ml-14.75">
        <div 
            className = {`w-90 pt-1 pb-1 z-20 m-4 px-4 flex items-center justify-between bg-white  h-12
                            ${showModal?  
                                " rounded-t-2xl  rounded-b-none" : 
                                "  rounded-4xl shadow-xl "}`
                        } 
            >
                <input 
                    type="text" 
                    className="w-full flex-1 outline-none placeholder:italic"
                    placeholder="Enter your Destination"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                    onKeyDown={(e) => handleEnterKey(e, search, filteredList, {currentNode, currentNodeName})}
                    onClick={() => setShowModal(true)}
                />

            <div className="flex space-x-2 ml-2">
                <span onClick={() => setSearch(search)} className="hover:bg-gray-100 rounded-2xl p-1 cursor-pointer"><SearchIcon sx={{ color: '#800000' }}/></span>
                {!search ?(
                    <span onClick={() => alert('test')} className="hover:bg-gray-100 rounded-2xl p-1 cursor-pointer"><DirectionsIcon sx={{ color: '#800000' }}/></span>  
                ):(<span 
                onClick={() => resetSearch(setSearch, renderLocationPanel, {currentNode, currentNodeName})}
                className="hover:bg-gray-100 rounded cursor-pointer"><ClearIcon sx={{ color: '#800000'}} /></span> )}
            </div>  
        </div>       

        <Modal 
            isVisible={showModal} 
            onClose={() => setShowModal(false)}
            design="mt-[64.6px] ml-[74.9px] w-90 shadow-xl animate-slideDown">

                <Loading loading={loading} message="Loading locations..."/>
                <Error error={error} />

                {!loading && !error && (search.length > 0 ? 
                    (
                        <ul>
                            {filteredList.map(node =>(
                                <li 
                                    key={node.id}
                                    onClick={()=> {
                                        currentNode(node.id);
                                        currentNodeName(node.node_name);
                                        setSearch(node.node_name);
                                        setShowModal(false);
                                    }}
                                    className="hover:bg-gray-100 p-2 rounded-xl cursor-pointer"> 
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
                    ))
                }
                
        </Modal>
    </div>
    )
}