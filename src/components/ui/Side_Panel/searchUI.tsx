import { useState, useMemo } from "react"
import Modal from "./modal"
import useAutoCompleteFetch from "../../hooks/autocomplete";
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import EmptySearchUi from "./emptySearchUi";
import type { SearchUiProps } from "./types/sidePanelProps";

export default function SearchUi({setCurrentNode}: SearchUiProps) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(""); 
    const { list, error, loading} = useAutoCompleteFetch()
    
        const filteredList = useMemo(() => {
            return list.filter(node => 
            node.node_name.toLowerCase().includes(search.toLowerCase())
        );
        }, [search, list ]) 

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return(
    <div className="p-3">
        <div 
            className = {`w-90 pt-1 pb-1 m-4 px-3 flex items-center justify-between 
                            ${showModal?  
                                "border-t border-l border-r rounded-t-xl rounded-b-none" : 
                                " border rounded-xl shadow-lg"}`
                        } 
            onClick={() => setShowModal(true)}>
                <input 
                    type="text" 
                    className="flex-1 outline-none placeholder:italic"
                    placeholder="Enter your Destination"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}  
                />
                
                <div className="flex space-x-2 ml-2">
                    <span><SearchIcon sx={{ color: '#800000' }}/></span>
                    <span onClick={() => alert('test')}><DirectionsIcon sx={{ color: '#800000' }}/></span>
                </div>  
        </div>
        
        <Modal 
            isVisible={showModal} 
            onClose={() => setShowModal(false)}
            design="mt-16 ml-7 w-90">

                {!search  && (<EmptySearchUi/>)}

                {loading && <div>Loading...</div>}  {/*change to proper loading and error UI */}
                {error && <div>Error: {error}</div>}

                {search && !loading && !error && (
                    <ul>
                        {filteredList.map(node =>(
                            <li 
                                key={node.id}
                                onClick={()=> {
                                    setCurrentNode(node.id);
                                    setSearch("");
                                }}
                                className="hover:bg-gray-100 p-2 rounded-xl"
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