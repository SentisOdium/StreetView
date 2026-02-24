import { useState, useMemo } from "react"
import useAutoCompleteFetch from "../../hooks/useAutocomplete";
import useLoadingError from "../../hooks/useLoadingError";
import useShowModal from "../../hooks/useShowModal";

import EmptySearchUi from "../reusableUI/emptySearchUi";
import Modal from "../reusableUI/modal"

import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import ClearIcon from '@mui/icons-material/Clear';

import type { SearchUiProps } from "./types/sidePanelProps";

export default function SearchUi({setCurrentNode, setCurrentNodeName}: SearchUiProps) {
    const [search, setSearch] = useState(""); 
    const {showModal, setShowModal} = useShowModal();
    const { list } = useAutoCompleteFetch()
    const { error, loading } = useLoadingError();

    const filteredList = useMemo(() => {
            return list.filter(node => 
            node.node_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, list ]) 

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key !== 'Enter' || filteredList.length === 0) return;

        const trimmedSearch = search.trim();
        if (!trimmedSearch) return;

        // Select first filtered node
        setCurrentNode(filteredList[0].id);
        setCurrentNodeName(filteredList[0].node_name);
        // Update search history using functional update

    };

    if (loading) return <div>Loading...</div>; //refix to proper loading and error UI later
    if (error) return <div>Error: {error}</div>;
 
    return(
    <div className="ml-14.75">
        <div 
            className = {`w-90 pt-1 pb-1 z-20 m-4 px-4 flex items-center justify-between bg-white  h-12
                            ${showModal?  
                                " rounded-t-2xl  rounded-b-none" : 
                                "  rounded-4xl shadow-xl"}`
                        } 
            >
                <input 
                    type="text" 
                    className="w-full flex-1 outline-none placeholder:italic"
                    placeholder="Enter your Destination"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    onClick={() => setShowModal(true)}
                />

            <div className="flex space-x-2 ml-2">
                <span onClick={() => setSearch(search)}><SearchIcon sx={{ color: '#800000' }}/></span>
                {!search ?(
                    <span onClick={() => alert('test')} className="hover:bg-gray-100 rounded"><DirectionsIcon sx={{ color: '#800000' }}/></span>  
                ):(<span onClick={() => setSearch("")} className="hover:bg-gray-100 rounded"><ClearIcon sx={{ color: '#800000'}} /></span> )}
            </div>  
        </div>       

        <Modal 
            isVisible={showModal} 
            onClose={() => setShowModal(false)}
            design="mt-[64.6px] ml-[74.9px] w-90 shadow-xl animate-slideDown">
                {search.length === 0 && <div className="text-gray-500 italic"><EmptySearchUi/></div>}
                {loading && <div>Loading...</div>}  {/*change to proper loading and error UI */}
                {error && <div>Error: {error}</div>}

                {search.length > 0 && !loading && !error && (
                    <ul>
                        {filteredList.map(node =>(
                            <li 
                                key={node.id}
                                onClick={()=> {
                                    setCurrentNode(node.id);
                                    setCurrentNodeName(node.node_name);
                                    setSearch(node.node_name);
                                    setShowModal(false);
                                }}
                                className="hover:bg-gray-100 p-2 rounded-xl cursor-pointer"
                                > 
                                    {node.node_name}
                            </li>
                        ))}
                    </ul>    
                )}
                
        </Modal>

    </div>
    )
}