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
import AdminLogin from "../pages/admin/AdminLogin";
import AdminAccountsPage from "./pages/AdminAccountsPage";
import MapEditorPage from "./pages/MapEditorPage";
import { useAuthStore } from "./store/authStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="hotspot-editor" element={<HotspotEditorPage />} />
        <Route path="graph" element={<NavigationGraphPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="route-testing" element={<RouteTestingPage />} />
        <Route path="map-editor" element={<MapEditorPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="accounts" element={<AdminAccountsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
