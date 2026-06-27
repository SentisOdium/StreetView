import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import WayfinderLanding from "./pages/WayfinderLanding";
import AdminRoutes from "./admin/AdminRoutes";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
