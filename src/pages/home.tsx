import { useState } from "react"

import SearchUi from "../components/ui/Side_Panel/searchUI"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import Panorma from "../components/ui/Panorama_Assests/Panorma"
 
export default function HomePage(){
    const [selectedNodeId, setSelectedId] = useState<number | null>(null)
    const [selectedNodeName, setSelectedNodeName] = useState<string |null>(null) //use for displaying  details of the node in the side panel.
    const [selectedNodeUrl, setSelectedNodeUrl] = useState<string | null>(null)
    const [renderLocationDetails, setRenderLocationDetails] = useState<boolean>(false)

    const testVar = "location"

    console.log("HomePage Rendered with selectedNodeId:", selectedNodeId, "selectedNodeName:", selectedNodeName, "selectedNodeUrl:", selectedNodeUrl)
    return(
        <>
            <div >
                <div className="absolute top-0 left-0  z-10" >
                    <SearchUi 
                        setCurrentNode={setSelectedId} 
                        setCurrentNodeName={setSelectedNodeName}
                        setCurrentNodeUrl={setSelectedNodeUrl}
                    />    
                </div>
                <div className="absolute top-0 left-0 z-9">
                    <NodeLocationDetails selectedNodeName={selectedNodeName}/>  
                </div>
                
            </div>
            
            
            <div className="absolute bottom-0 left-0 right-0 z-0">
                <Panorma 
                    nodeName={selectedNodeName || ""}
                />   
            </div>
            <div className="flex justify-center ">
                <h1>the selected id is: {selectedNodeId} - {selectedNodeName} - {selectedNodeUrl}</h1>
            </div>

            
        </>
    )
}