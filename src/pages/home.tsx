import SearchUi from "../components/ui/Side_Panel/searchUI"
import MainNode from "../components/ui/Panorama_Assests/mainNode"

import { useState } from "react"

export default function HomePage(){
    const [selectedNodeId, setSelectedId] = useState<number | null>(null)
    const [renderLocationDetails, setRenderLocationDetails] = useState<boolean>(false)
    return(
        <>
            <SearchUi setCurrentNode={setSelectedId}/>

            {/* <div className="z-20">
                <MainNode/>    
            </div> */}
            <div className="flex justify-center ">
                <h1>the selected id is: {selectedNodeId}</h1>
            </div>

            
        </>
    )
}