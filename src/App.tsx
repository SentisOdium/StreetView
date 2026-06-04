import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/home";
import AdminRoutes from "./admin/AdminRoutes";
import { useThemeStore } from "./admin/store/themeStore";

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <Routes>
        <Route
          path="/"
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
