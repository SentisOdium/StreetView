import { useState } from "react"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import Panorma from "../components/ui/Panorama_Assests/Panorma"
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections"
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2"
import useAutoCompleteFetch from "../components/hooks/useAutocomplete"

export default function HomePage(){
    const [selectedNodeId, setSelectedId] = useState<number | null>(null)
    const [selectedNodeName, setSelectedNodeName] = useState<string |null>(null) 
    const [renderLocationDetails, setRenderLocationDetails] = useState<boolean>(true)
    const [renderNodeDirections, setRenderNodeDirections] = useState<boolean>(false)
    const [showSearchUI, setShowSearchUI] = useState<boolean>(true);

    const {list, loading, error} = useAutoCompleteFetch()

    return(
        <>
            <div >
                <div className="absolute top-0 left-0  z-10" >
                   {showSearchUI === true && (
                        <SearchUI2
                            currentNode={setSelectedId}
                            currentNodeName={setSelectedNodeName}
                            renderLocationPanel={setRenderLocationDetails}
                            renderDirectionsPanel={setRenderNodeDirections}
                            setShowSearchUI={setShowSearchUI}
                            list={list}
                            loading={loading}
                            error={error}
                        />
                    )}
                </div>

                <div className="flex items-center justify-center">render SearchUI status: {showSearchUI.toString()}</div>

                {renderLocationDetails === true && (
                    <div className="absolute top-0 left-0 z-9">
                        <NodeLocationDetails 
                            selectedNodeName={selectedNodeName}
                            />  
                    </div>
                )}
                
                {renderNodeDirections === true && (
                    <div className="absolute top-0 left-0 z-9">
                        <NodeDirections
                            renderDirectionsPanel={setRenderNodeDirections}
                            setShowSearchUI={setShowSearchUI}
                            list={list}
                        />  
                    </div>
                )}
                
            
            </div>
            
            

            <div className="absolute inset-0 z-0">
                <Panorma 
                    nodeName={selectedNodeName || ""}
                />   
            </div>

            <div className="flex justify-center z-50">
                
            </div>        
        </>
    )
}