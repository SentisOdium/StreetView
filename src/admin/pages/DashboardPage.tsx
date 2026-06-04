import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import type { DashboardStats } from "../api/types";
import PageHeader, {
  StatCard,
  AdminButton,
  LoadingSpinner,
  ErrorBanner,
} from "../components/shared/AdminUI";
import PlaceIcon from "@mui/icons-material/Place";
import LinkIcon from "@mui/icons-material/Link";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LayersIcon from "@mui/icons-material/Layers";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><LoadingSpinner /></div>;

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your navigation network"
        actions={
          <>
            <Link to="/admin/locations">
              <AdminButton variant="secondary">Manage Locations</AdminButton>
            </Link>
            <Link to="/admin/hotspot-editor">
              <AdminButton>Open Hotspot Editor</AdminButton>
            </Link>
          </>
        }
      />

      {error && <ErrorBanner message={error} />}

      {stats && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Locations" value={stats.totalLocations} />
            <StatCard label="Total Hotspots" value={stats.totalHotspots} />
            <StatCard label="Total Rooms" value={stats.totalRooms} />
            <StatCard label="Total Floors" value={stats.totalFloors} />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="admin-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Navigation Graph Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Total Nodes</span>
                  <span className="font-medium">{stats.graphStats.total_nodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Total Connections</span>
                  <span className="font-medium">{stats.graphStats.total_edges}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Orphan Nodes</span>
                  <span className={`font-medium ${stats.graphStats.orphan_nodes > 0 ? "text-amber-500" : ""}`}>
                    {stats.graphStats.orphan_nodes}
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-[#800000]"
                    style={{
                      width: stats.graphStats.total_nodes
                        ? `${Math.min(100, (stats.graphStats.total_edges / stats.graphStats.total_nodes) * 50)}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-xs opacity-50">Connection density indicator</p>
              </div>
            </div>

            <div className="admin-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { to: "/admin/locations", icon: PlaceIcon, label: "Add Location" },
                  { to: "/admin/hotspot-editor", icon: LinkIcon, label: "Edit Hotspots" },
                  { to: "/admin/rooms", icon: MeetingRoomIcon, label: "Manage Rooms" },
                  { to: "/admin/graph", icon: LayersIcon, label: "View Graph" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="admin-card flex flex-col items-center gap-2 rounded-lg border p-4 text-center text-sm transition hover:border-[#800000]"
                  >
                    <Icon sx={{ fontSize: 28, color: "#800000" }} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Recently Modified Locations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b opacity-60">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Floor</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentlyModified.map((loc) => (
                    <tr key={loc.id} className="border-b border-inherit last:border-0">
                      <td className="py-3 pr-4 font-medium">{loc.node_name}</td>
                      <td className="py-3 pr-4 opacity-70">{loc.floor || "—"}</td>
                      <td className="py-3">
                        <Link
                          to={`/admin/locations?id=${loc.id}`}
                          className="text-[#800000] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
