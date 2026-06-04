import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import LocationsPage from "./pages/LocationsPage";
import HotspotEditorPage from "./pages/HotspotEditorPage";
import NavigationGraphPage from "./pages/NavigationGraphPage";
import RoomsPage from "./pages/RoomsPage";
import RouteTestingPage from "./pages/RouteTestingPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import SettingsPage from "./pages/SettingsPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="hotspot-editor" element={<HotspotEditorPage />} />
        <Route path="graph" element={<NavigationGraphPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="route-testing" element={<RouteTestingPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
