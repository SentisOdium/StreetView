import SideNav from "./components/ui/trash/SideNav";
import Search from "./components/ui/Search";
import Panorma from "./Panorma";
import { SidebarDropdown, SidebarItem } from "./components/ui/trash/SideNav";
import { PiStairsDuotone } from "react-icons/pi";
import { MdOutlineMeetingRoom } from "react-icons/md";

export default function App() {
  return (
    <div className="relative flex h-screen w-screen">
      {/* Sidebar overlaying */}
      <div className="absolute z-50">
        <SideNav>
          <SidebarDropdown text="First Floor" icon={<PiStairsDuotone size={24} className="mr-3" />} >
            <SidebarItem text="Room 101" icon={<MdOutlineMeetingRoom className="mr-0.5"/>} />
            <SidebarItem text="Room 102" icon={<MdOutlineMeetingRoom className="mr-0.5"/>}/> 
          </SidebarDropdown>

          <SidebarDropdown text="Second Floor" icon={<PiStairsDuotone size={24} className="mr-3" />} >
            <SidebarItem text="Room 201" icon={<MdOutlineMeetingRoom className="mr-0.5"/>}/>
            <SidebarItem text="Dean's Office" icon={<MdOutlineMeetingRoom className="mr-0.5"/>}/>
          </SidebarDropdown>
          
          <SidebarDropdown text="Third Floor" icon={<PiStairsDuotone size={24} className="mr-3" />} >
            <SidebarItem text="Registar's Office" icon={<MdOutlineMeetingRoom className="mr-0.5"/>}/>
            <SidebarItem text="Room 301" icon={<MdOutlineMeetingRoom className="mr-0.5"/>}/>
          </SidebarDropdown>
        </SideNav>
      </div>

      {/* Main area */}
      <div className="flex-1 relative">
        <Panorma />
      </div>
    </div>
  );
}
