import { useState } from "react"
import { SwapVertIcon } from "../../reusableUI/logo.exports"
import RouteCardComponent from "../../reusableUI/routeCardComponent"
import type { NodeDirectionsProps } from "../types/sidePanelProps"
import useAutoCompleteFetch from "../../../hooks/useAutocomplete"

import Search from "../../reusableUI/search"

export default function NodeDirections({ setShowSearchUI, renderDirectionsPanel}: NodeDirectionsProps) {
    const { list } = useAutoCompleteFetch()
    const [locationA, setLocationA] = useState("");
    const [locationB, setLocationB] = useState("");
    const [round, setRound] = useState(true);


    const locationSwap = () => {
        if (!locationA || !locationB) return;
        
        setLocationA(locationB);
        setLocationB(locationA);
    };


    return (
        <>
            <div className="w-110 h-screen border-gray-600 shadow-lg overflow-y-auto ml-10 animate-slideDown bg-white p-4 -z-10">
                <form >
                    <div className="grid grid-cols-3 gap-4 ">
                        <div 
                            onClick={() => {
                                setShowSearchUI(true);
                                renderDirectionsPanel(false);
                            }}
                            className="col-span-3 flex items-center  h-12 justify-center border rounded-xl shadow-sm">
                        other nav here  
                        </div>
                        
                        {/* Starting Point */}
                        <div  className="col-span-2 z-10">
                            <div onClick={() => setRound(true)}  className={`px-4 flex items-center bg-white h-12 
                                ${round && locationA === "" ?  
                                    "rounded-4xl shadow-xl" : 
                                    "rounded-t-2xl  rounded-b-none"}`}>
                                <Search
                                    value={locationA}
                                    onChange={setLocationA}
                                    placeholder="Choose Starting Point"
                                    items={list || []}
                                    getLabel={(node: any) => node?.node_name ?? ""}    
                                    onSelect={(node: any) => {
                                        setLocationA(node?.node_name ?? "");
                                    }} 
                                    modalDesign="mt-32 ml-4 w-66 shadow-xl animate-slideDown"
                                />
                            </div>
                        </div>

                        {/* Icon / Swap / Action */}
                        <div 
                            className="row-span-2 flex items-center justify-center bg-white rounded-lg"
                            onClick={locationSwap}>
                                <span
                                    className="p-1 hover:bg-gray-100 rounded-xl cursor-pointer ">
                                        <SwapVertIcon 
                                            sx={{ 
                                                color: '#800000', 
                                                fontSize: 28}} 
                                                />
                                </span>
                        </div>

                        {/* Destination */}
                        <div className="col-span-2 z-10">
                            <div onClick={() => setRound(true)}  className={`px-4 flex items-center bg-white h-12 
                                ${round && locationB === "" ?  
                                    "rounded-4xl shadow-xl" : 
                                    "rounded-t-2xl  rounded-b-none"}`}>
                                <Search
                                    value={locationB}
                                    onChange={setLocationB}
                                    placeholder="Choose Destination Point"
                                    items={list || []}
                                    getLabel={(node: any) => node?.node_name ?? ""}    
                                    onSelect={(node: any) => {
                                        setLocationB(node?.node_name ?? "");
                                        }} 
                                    modalDesign="mt-47 ml-4 w-66.5 shadow-xl animate-slideDown"
                                />
                            </div>
                        </div>

                    </div>
                </form>

                <div className="mt-10">
                    <RouteCardComponent locA={locationA} locB={locationB}/>
                </div>
            </div>

            
        </>
    )
}