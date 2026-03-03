import { WayfinderLogo1 } from "./logo.exports";

type LoadingErrorProps = {
    loading?: boolean;
    error?: string | null;
    message?: string | null;
}

function EmptySearchUi(){
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

function Loading({loading, message = "Loading..."}: LoadingErrorProps) {
    if(!loading) return null;
    return <div>{message}</div>;
    
}

function Error({error, message = "An error occurred."}: LoadingErrorProps) {
    if (!error) return null;
    return <div>Error: {message}</div>;
}

export { EmptySearchUi, Loading, Error };