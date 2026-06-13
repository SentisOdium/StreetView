import { useState } from "react";
import { adminApi, exportToCsv, exportToJson } from "../api/adminApi";
import type { ValidationResult } from "../api/types";
import PageHeader, {
  AdminButton,
  ErrorBanner,
} from "../components/shared/AdminUI";

export default function SettingsPage() {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");

  async function runValidation() {
    try {
      const result = await adminApi.validate();
      setValidation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation failed");
    }
  }

  async function handleExport(type: "all" | "locations" | "hotspots") {
    try {
      const data = await adminApi.exportAll();
      if (type === "all") {
        exportToJson(data, `wayfinder-export-${Date.now()}.json`);
      } else if (type === "locations") {
        exportToJson(data.locations, `locations-${Date.now()}.json`);
        exportToCsv(data.locations as Record<string, unknown>[], `locations-${Date.now()}.csv`);
      } else {
        exportToJson(data.hotspots, `hotspots-${Date.now()}.json`);
        exportToCsv(data.hotspots as Record<string, unknown>[], `hotspots-${Date.now()}.csv`);
      }
      setMsg("Export downloaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    }
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importJson);
      exportToJson(parsed, `import-backup-${Date.now()}.json`);
      setMsg("Import validated — full restore requires backend import endpoint (backup saved locally)");
    } catch {
      setError("Invalid JSON");
    }
  }

  return (
    <div className="p-8">
      <PageHeader title="Settings" subtitle="Configuration, validation, and data management" />

      {error && <ErrorBanner message={error} />}
      {msg && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


        <div className="admin-card space-y-4 rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold">Data Validation</h2>
          <p className="text-sm opacity-60">
            Check for duplicate connections, orphan nodes, missing images, and broken routes
          </p>
          <AdminButton onClick={runValidation}>Run Validation</AdminButton>
          {validation && (
            <div className="text-sm">
              <p className={validation.valid ? "text-green-600" : "text-red-500"}>
                {validation.valid ? "All checks passed" : `${validation.errors.length} errors found`}
              </p>
              <p className="opacity-60">{validation.warnings.length} warnings</p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                {[...validation.errors, ...validation.warnings].map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="admin-card space-y-4 rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold">Import / Export</h2>
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="secondary" onClick={() => handleExport("all")}>
              Export Full Graph (JSON)
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => handleExport("locations")}>
              Export Locations
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => handleExport("hotspots")}>
              Export Hotspots
            </AdminButton>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block opacity-70">Import JSON (validate)</span>
            <textarea
              className="admin-input w-full rounded-lg border px-3 py-2 font-mono text-xs"
              rows={5}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{"locations": [...], "hotspots": [...]}'
            />
          </label>
          <AdminButton variant="secondary" onClick={handleImport}>
            Validate & Backup Import
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
