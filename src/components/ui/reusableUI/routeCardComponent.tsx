import useRouteDirection from "../../hooks/useRouteDirection"

type RouteCardProps = {
    locA : string,
    locB : string
}

export default function RouteCardComponent({locA, locB}: RouteCardProps){
    const { route } = useRouteDirection({
        src: locA, 
        dest: locB})
        
    return(
        <div className=" mt-10  bg-white rounded-xl border p-3">
            <span className="border-b"></span>
            
            <div className="grid grid-cols-3 gap-1">

                <div className="col-span-2 border p-2">
                    <h3  className="text-2xl font-semibold">Location</h3>
                    <span>Directions</span>
                </div>

                <span className="col-span-1 grid place-items-center border">
                    Logo
                </span>

                <div className="col-span-3">
                    {route?.path?.map((node) =>(
                        <div key={node.id}>{node.dist} - {node.name} - {node.type}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}
