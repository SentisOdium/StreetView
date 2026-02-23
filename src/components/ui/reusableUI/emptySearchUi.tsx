import WayfinderLogo1 from "../../assets/logo/WayfinderLogo1.png" 

export default function EmptySearchUi(){
    return(
        <div className="items-center justify-items-center space-y-2 opacity-40 p-10">
            <img 
                src={WayfinderLogo1}
                alt="Pup Wafinder Logo"
                width={130}
                height={130}
                className=""
            />
            <h1 className="text-[#800000]"><i>Digitizing your Campus Experience</i></h1>
        </div>
    )
}