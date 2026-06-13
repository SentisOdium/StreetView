import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import type { AdminLocation, RouteTestResult } from "../api/types";
import { FaMapMarkerAlt, FaFlagCheckered } from "react-icons/fa";
import PageHeader, {
  AdminButton,
  ErrorBanner,
  CustomSelect,
} from "../components/shared/AdminUI";

export default function RouteTestingPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [result, setResult] = useState<RouteTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getLocations().then(setLocations).catch(() => {});
  }, []);

  async function runTest() {
    if (!source || !destination) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.routeTest(source, destination);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Route test failed");
    } finally {
      setLoading(false);
    }
  }

  const sourceName = locations.find((l) => String(l.id) === source)?.node_name;
  const destName = locations.find((l) => String(l.id) === destination)?.node_name;

  return (
    <div className="p-8">
      <PageHeader
        title="Route Testing"
        subtitle="Simulate navigation paths between locations"
        actions={
          <AdminButton onClick={runTest} disabled={!source || !destination || loading}>
            {loading ? "Testing..." : "Generate Route"}
          </AdminButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="text-sm">
          <span className="mb-2 block opacity-70 font-semibold">Start Location</span>
          <CustomSelect
            value={source}
            onChange={(val) => setSource(val ? String(val) : "")}
            options={locations.map((l) => ({ value: l.id, label: l.node_name }))}
            placeholder="Select start..."
            icon={<FaMapMarkerAlt className="w-4 h-4" />}
          />
        </div>
        <div className="text-sm">
          <span className="mb-2 block opacity-70 font-semibold">Destination</span>
          <CustomSelect
            value={destination}
            onChange={(val) => setDestination(val ? String(val) : "")}
            options={locations.map((l) => ({ value: l.id, label: l.node_name }))}
            placeholder="Select destination..."
            icon={<FaFlagCheckered className="w-4 h-4" />}
          />
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl">
            <div className="admin-card rounded-xl border p-4 text-center">
              <p className="text-sm opacity-60">Route Length</p>
              <p className="text-2xl font-bold text-[#800000]">{result.routeLength}</p>
            </div>
            <div className="admin-card rounded-xl border p-4 text-center">
              <p className="text-sm opacity-60">Transitions</p>
              <p className="text-2xl font-bold">{result.transitions}</p>
            </div>
            <div className="admin-card rounded-xl border p-4 text-center">
              <p className="text-sm opacity-60">Issues</p>
              <p className="text-2xl font-bold text-amber-500">
                {result.missingLinks.length + result.invalidConnections.length}
              </p>
            </div>
          </div>

          <div className="admin-card rounded-xl border p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">
              Route: {sourceName} → {destName}
            </h3>
            {result.path.length === 0 ? (
              <p className="text-sm text-red-500">No route found — check for missing links</p>
            ) : (
              <ol className="space-y-2">
                {result.path.map((step, i) => (
                  <li key={step.id} className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#800000] text-xs text-white">
                      {i + 1}
                    </span>
                    <span className="font-medium">{step.name}</span>
                    <span className="opacity-50">{step.type}</span>
                    {i < result.path.length - 1 && (
                      <Link
                        to={`/?node=${encodeURIComponent(step.name)}`}
                        className="ml-auto text-[#800000] hover:underline text-xs"
                      >
                        Preview
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {(result.missingLinks.length > 0 || result.warnings.length > 0) && (
            <div className="admin-card rounded-xl border p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-amber-600">Warnings & Missing Links</h3>
              <ul className="space-y-1 text-sm">
                {[...result.missingLinks, ...result.warnings].map((w, i) => (
                  <li key={i} className="text-amber-600">{w.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
