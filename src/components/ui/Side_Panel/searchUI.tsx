import { useState, useMemo } from "react"
import Modal from "./modal"
import useAutoCompleteFetch from "../../hooks/useAutocomplete";
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import type { SearchUiProps } from "./types/sidePanelProps";
import EmptySearchUi from "./emptySearchUi";

export default function SearchUi({setCurrentNode}: SearchUiProps) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(""); 
    const { list, error, loading} = useAutoCompleteFetch()
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

        // Update search history using functional update


        // Clear input after updating history
        setSearch("");
    };

    if (loading) return <div>Loading...</div>; //refix to proper loading and error UI later
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
                    onKeyDown={handleKeyDown}
                />
                
                <div className="flex space-x-2 ml-2">
                    <span onClick={() => setSearch(search)}><SearchIcon sx={{ color: '#800000' }}/></span>
                    {!search ?(
                      <span onClick={() => alert('test')}><DirectionsIcon sx={{ color: '#800000' }}/></span>  
                    ):(<span><DirectionsIcon /></span> )}
                </div>  
        </div>
        
        <Modal 
            isVisible={showModal} 
            onClose={() => setShowModal(false)}
            design="mt-16 ml-7 w-90">
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