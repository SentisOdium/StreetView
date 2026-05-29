//remember to add the handleenterkey function. 
import { useState } from "react";
import Search from "../../reusableUI/search"
import type { SearchUiProps } from "../types/sidePanelProps";
import { SearchIcon, DirectionsIcon, ClearIcon } from "../../reusableUI/logo.exports";

export default function SearchUI2(props: SearchUiProps){
    const [search, setSearch] = useState("")

    return(
        <div className="ml-14.75">
            <div 
                className = {`w-90 pt-1 pb-1 z-20 m-4 px-4 flex items-center justify-between bg-white  h-12 
                                    ${ search.length > 0 ?  
                                            "rounded-2xl" : 
                                            "rounded-2xl shadow-xl"}`} >

                <Search
                    value={search}
                    onChange={setSearch}
                    placeholder="Enter your Destination"
                    items={props.list || []}
                    getLabel={(node: any) => node?.node_name ?? ""}                
                    onSelect={(node: any) => {
                        props.onSelect(node);
                        setSearch(node?.node_name ?? "")
                    }}
                    modalDesign="mt-[64.6px] ml-[74.9px] w-90 shadow-xl animate-slideDown max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                />


                <div className="flex space-x-2 ml-2">
                    <span 
                        onClick={() => {}} 
                        className="hover:bg-gray-100 rounded-2xl p-1 cursor-pointer">
                            <SearchIcon sx={{ color: '#800000' }}/>
                    </span>
                    
                    {!search ?(
                        <span 
                            onClick={() => {props.onDirections(); console.log("Directions clicked");}} 
                            className="hover:bg-gray-100 rounded-2xl p-1 cursor-pointer">
                                <DirectionsIcon sx={{ color: '#800000' }}/>
                        </span>  
                    ):(
                        <span 
                            onClick={() => {
                                setSearch("");
                                props.onClear?.();
                            }}
                            className="hover:bg-gray-100 rounded curor-pointer">
                                <ClearIcon sx={{ color: '#800000'}} />
                        </span> )
                    }
                </div>
            </div>

            
        </div>
        
    )
}
