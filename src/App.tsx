import SideNav from "./components/ui/trash/SideNav";
import Panorma from "./Panorma";
import { SidebarDropdown, SidebarItem } from "./components/ui/trash/SideNav";
import { PiStairsDuotone } from "react-icons/pi";
import { MdOutlineMeetingRoom } from "react-icons/md";
import NodeComponent from "./components/api/api";
export default function App() {
  return (
    <div className="relative  h-screen w-screen grid grid-cols-1 sm:grid-cols-2">
     

      <NodeComponent />
    
      <div className="relative">
        {/* <Panorma /> */}
      </div>
    </div>
  );
}
