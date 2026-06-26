import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import WayfinderLanding from "./pages/WayfinderLanding";
import AdminRoutes from "./admin/AdminRoutes";
import { TaskOverlay } from "./components/usability/TaskOverlay";
import { TaskOverlayErrorBoundary } from "./components/usability/TaskOverlayErrorBoundary";
import { TaskTestingProvider } from "./context/TaskTestingContext";

export default function App() {
  return (
    <BrowserRouter>
      <TaskTestingProvider>
        <TaskOverlayErrorBoundary>
          <TaskOverlay />
        </TaskOverlayErrorBoundary>
        <Routes>
          <Route path="/" element={<WayfinderLanding />} />
          <Route
            path="/tour"
            element={
              <div className="relative h-screen w-screen overflow-hidden">
                <HomePage />
              </div>
            }
          />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </TaskTestingProvider>
    </BrowserRouter>
  );
}

