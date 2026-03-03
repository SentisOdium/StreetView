import useLoadingError from "../../../hooks/useLoadingError";
import useNodeDetailsFetch from "../../../hooks/useNodeDetailsFetch";

import type { NodeLocationDetailsProps } from "../types/sidePanelProps";
import {WayfinderLogo1, DirectionsIcon, ShareIcon } from "../../reusableUI/logo.exports";

export default function NodeLocationDetails({selectedNodeName}: NodeLocationDetailsProps) {

    const { error, loading } = useLoadingError();
    const { details } = useNodeDetailsFetch(selectedNodeName || "");

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!selectedNodeName) return null;
    if (!details) return <div>No details available.</div>;
    
    return (
        <div className="w-110 h-screen border-gray-600 shadow-lg overflow-y-auto ml-10 bg-white animate-slideDown">

            <img
                src={details.Current?.img?.src || WayfinderLogo1}
                alt={details.Current?.img.alt || "Node Image"}
                className="mb-2 border-amber-600 w-110 h-62.5 object-cover"
            />

            {/* change to reuable functional components */}
            {/* create variables for the design of the icons */}
            <div className="flex justify-center shadow-sm border-gray-300 mb-2 gap-6">
                <div className="flex flex-col items-center p-2 ">
                    <div className="group bg-[#800000]/10 rounded-full p-2 flex items-center justify-center 
                                    hover:bg-[#800000] cursor-pointer shadow-xl transition-colors duration-300">
                    <ShareIcon className="text-[#800000] text-2xl group-hover:text-white transition-colors duration-800" />
                    </div>
                    <p className="mt-1 text-center text-sm">Share</p>
                </div>
                
                <div className="flex flex-col items-center p-2 ">
                    <div className="group bg-[#800000] rounded-full p-2 flex items-center justify-center 
                                    hover:bg-[#800000]/10 cursor-pointer shadow-xl transition-colors duration-300">
                    <DirectionsIcon className="text-white text-2xl group-hover:text-[#800000] transition-colors duration-800" />
                    </div>
                    <p className="mt-1 text-center text-sm">Directions</p>
                </div>
            </div>
           
            <div className="px-4 py-2 shadow-sm">
                <h1 className="text-2xl font-semibold  mb-3">
                    {details.Current?.node_name}
                </h1>  
            
                {details.Room_Sprite?.map(room => (
                    <div key={room.room_number} className="mb-4">

                        <h3 className="font-medium text-sm">
                            {room.room_type}
                        </h3>

                        {/* <img
                            src={room.room_img}
                            alt={room.room_type}
                            className="rounded-md"
                        /> */}

                        <p className="text-sm text-gray-600">
                            {room.room_description}
                        </p>

                    </div>
                ))}    

            </div>
            

            

        </div>
    )
}