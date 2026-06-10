import { NavLink, Outlet, Link } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PlaceIcon from "@mui/icons-material/Place";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import RouteIcon from "@mui/icons-material/Route";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/admin/locations", label: "Locations", icon: PlaceIcon },
  { to: "/admin/hotspot-editor", label: "Hotspot Editor", icon: TouchAppIcon },
  { to: "/admin/graph", label: "Navigation Graph", icon: AccountTreeIcon },
  { to: "/admin/rooms", label: "Rooms", icon: MeetingRoomIcon },
  { to: "/admin/route-testing", label: "Route Testing", icon: RouteIcon },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: HistoryIcon },
  { to: "/admin/accounts", label: "Admin Accounts", icon: PersonAddIcon },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const dark = theme === "dark";

  return (
    <div
      className={`admin-root flex min-h-screen ${
        dark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r ${
          dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-inherit px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#800000] text-sm font-bold text-white">
            WF
          </div>
          <div>
            <p className="text-sm font-semibold">Wayfinder Admin</p>
            <p className="text-xs opacity-60">Navigation Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-[#800000] text-white"
                    : dark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon sx={{ fontSize: 20 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-inherit p-3">
          <Link
            to="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              dark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <HomeIcon sx={{ fontSize: 18 }} />
            Back to Viewer
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              dark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {dark ? (
              <LightModeIcon sx={{ fontSize: 18 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 18 }} />
            )}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen flex-1">
        <Outlet />
      </main>
    </div>
  );
}
