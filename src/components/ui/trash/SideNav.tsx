//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER

//Split files Accordingly


import { LuChevronFirst } from "react-icons/lu";
import { createContext, useContext, useState } from "react";
import { BsChevronBarDown } from "react-icons/bs";
import { MdPlace } from "react-icons/md";

type SidebarItemProps = {
    text?: string,
    children?: React.ReactNode
    icon?: React.ReactNode
}

type SideNavProps = {
    children?: React.ReactNode;
};

type SidebarContextType = {
    expanded: boolean;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;

};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export default function SideNav({ children }: SideNavProps) {
    const [expanded, setExpanded] = useState(true);

    return (
        <aside className="h-screen">
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                {/* Header */}
                <div className="p-6 pb-2 flex justify-between items-center">
                    <img
                        src="/logoipsum-408.png"
                        alt="Logo"
                        className={`overflow-hidden transition-all duration-200 ease-in-out ${expanded ? "w-34" : "w-0"}`}
                    />
                    <button
                        onClick={() => setExpanded(curr => !curr)}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                        <LuChevronFirst
                            size={30}
                            className={`transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
                        />
                    </button>
                </div>

                {/* Navigation items */}
                <SidebarContext.Provider value={{ expanded, setExpanded}}>
                    <ul className="flex-1 px-3">{children}</ul>
                </SidebarContext.Provider>
                  
                
            </nav>
        </aside>
    );
}

export  function SidebarDropdown({ text, children,icon }: SidebarItemProps) {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("SidebarItem must be used within a SideNav");

    const { expanded } = context;
    const [open, setOpen] = useState(false);
    return (
        <li className="mb-2">
            <button 
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100" 
                onClick={() => setOpen(curr => !curr)}>
            {icon}

            { expanded && (
                <>
                    <span className={`overflow-hidden transition-all `}>
                        {text}  
                    </span>
                    
                    <BsChevronBarDown
                        size={20}
                        className={`ml-auto transform transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
                    />
                </>
            )}  
            </button>

            {open && expanded && (
                <ul className="mt-2 pl-8 border-l border-gray-200">
                    {children}
                </ul>
            )}
        </li>
    )
}

export function SidebarItem({ text, icon }: SidebarItemProps) {
   const [clicked, setClicked] = useState(false);
    return (
        <li className="mb-2">
            <button onClick={() => setClicked(true)} className="w-full flex items-center p-3  border-l-4 shadow-sm border-transparent hover:border-[#800000] hover:bg-gray-100">
                {icon}
                <span className={`overflow-hidden transition-all `}>
                    {text}  
                </span>

                { clicked && (<MdPlace size={20} className="ml-auto text-[#800000]"/> )}
            </button>
        </li>
    )
}
