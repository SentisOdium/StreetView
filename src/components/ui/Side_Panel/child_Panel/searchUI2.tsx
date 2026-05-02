//remeber to add teh handleenterkey function. 
import { useState } from "react";
import type { SearchUiProps } from "../types/sidePanelProps";
import Search from "../../reusableUI/search"

import { SearchIcon, DirectionsIcon, ClearIcon } from "../../reusableUI/logo.exports";
import { renderDirections, handleEnterKey, resetSearch } from "../../../utils/searchFunctions";

export default function SearchUI2(props: SearchUiProps){
    const [search, setSearch] = useState("")
    const [round, setRound] = useState(true);


    return(
        <div className="ml-14.75">
            <div
                onClick={() => setRound(true)} 
                className = {`w-90 pt-1 pb-1 z-20 m-4 px-4 flex items-center justify-between bg-white  h-12 
                                    ${round && search === "" ?  
                                            "rounded-4xl shadow-xl" : 
                                            "rounded-t-2xl  rounded-b-none"}`} >

                <Search
                    value={search}
                    onChange={setSearch}
                    placeholder="Enter your Destination"
                    items={props.list || []}
                    getLabel={(node: any) => node?.node_name ?? ""}                
                    onSelect={(node: any) => {
                        props.currentNode(node?.id ?? null)
                        props.currentNodeName(node?.node_name ?? "")
                        setSearch(node?.node_name ?? "")
                    }}
                    modalDesign="mt-[64.6px] ml-[74.9px] w-90 shadow-xl animate-slideDown "
                />


                <div className="flex space-x-2 ml-2">
                    <span 
                        onClick={() => setSearch(search)} 
                        className="hover:bg-gray-100 rounded-2xl p-1 cursor-pointer">
                            <SearchIcon sx={{ color: '#800000' }}/>
                    </span>
                    
                    {!search ?(
                        <span 
                            onClick={() => {
                                renderDirections(props.renderDirectionsPanel, props.renderLocationPanel);
                                props.setShowSearchUI (false);
                            }} 
                            className="hover:bg-gray-100 rounded-2xl p-1 cursor-pointer">
                                <DirectionsIcon sx={{ color: '#800000' }}/>
                        </span>  
                    ):(
                        <span 
                            onClick={() => resetSearch(setSearch, props.renderLocationPanel, 
                                {currentNode: props.currentNode, currentNodeName: props.currentNodeName})}
                            className="hover:bg-gray-100 rounded curor-pointer">
                                <ClearIcon sx={{ color: '#800000'}} />
                        </span> )
                    }
                </div>
            </div>

            
        </div>
        
    )
}