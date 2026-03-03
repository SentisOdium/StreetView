import { useState } from "react"
import { SwapVertIcon } from "../../reusableUI/logo.exports"
export default function NodeDirections() {

    const [locationA, setLocationA] = useState("")
    const [locationB, setLocationB] = useState("")

    const locationSwap = () => {

        if(!locationA || !locationB) return;

        const temp_locB = locationB;
        setLocationA(temp_locB)
        setLocationB(locationA)
    }
    return (
        <div className="w-110 h-screen border-gray-600 shadow-lg overflow-y-auto ml-10 animate-slideDown bg-white p-4">
            <form action="">
                <div className="grid grid-cols-3 gap-4 ">\
                    <div className="col-span-3 flex items-center  h-12 justify-center border rounded-xl shadow-sm">
                    other nav here  
                    </div>
                    
                    {/* Starting Point */}
                    <div className="col-span-2">
                        <div className="px-4 flex items-center bg-white h-12 rounded-xl shadow-sm">
                            <input 
                                type="text" 
                                value={locationA}
                                onChange={(e) => setLocationA(e.target.value)}
                                className="w-full outline-none placeholder:italic bg-transparent"
                                placeholder="Choose Starting Point"
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
                    <div className="col-span-2">
                        <div className="px-4 flex items-center bg-white h-12 rounded-xl shadow-sm">
                            <input 
                                type="text" 
                                value={locationB}
                                onChange={(e) => setLocationB(e.target.value)}
                                className="w-full outline-none placeholder:italic bg-transparent"
                                placeholder="Choose Destination"
                            />
                        </div>
                    </div>

                </div>
            </form>
        </div>
    )
}