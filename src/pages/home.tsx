import SearchUi from "../components/ui/Side_Panel/searchUI"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import { useState } from "react"
import Panorma from "../Panorma"
 
export default function HomePage(){
    const [selectedNodeId, setSelectedId] = useState<number | null>(null)
    const [selectedNodeName, setSelectedNodeName] = useState<string |null>(null) //use for displaying  details of the node in the side panel.
    const [renderLocationDetails, setRenderLocationDetails] = useState<boolean>(false)

    const testVar = "location"

    return(
        <>
            <div >
                <div className="absolute top-0 left-0  z-10" >
                    <SearchUi 
                        setCurrentNode={setSelectedId} 
                        setCurrentNodeName={setSelectedNodeName}
                    />    
                </div>
                <div className="absolute top-0 left-0 z-9">
                    <NodeLocationDetails selectedNodeName={selectedNodeName}/>  
                </div>
                
            </div>
            
            
            <div className="absolute bottom-0 left-0 right-0 z-0">
                <Panorma/>   
            </div>
            {/* <div className="flex justify-center ">
                <h1>the selected id is: {selectedNodeId} - {selectedNodeName}</h1>
            </div> */}

            
        </>
    )
}