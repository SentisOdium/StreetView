import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import type { AuditLogEntry } from "../api/types";
import PageHeader, { AdminButton, LoadingSpinner, ErrorBanner } from "../components/shared/AdminUI";

function formatLogEntry(log: AuditLogEntry): string {
  const parts = [`${log.admin_user} ${log.action}`];
  if (log.location_name) parts.push(`Location: ${log.location_name}`);
  if (log.old_value && log.new_value) {
    const oldYaw = (log.old_value as { yaw?: number }).yaw;
    const newYaw = (log.new_value as { yaw?: number }).yaw;
    if (oldYaw !== undefined && newYaw !== undefined) {
      parts.push(`Old Position: yaw=${oldYaw}`);
      parts.push(`New Position: yaw=${newYaw}`);
    }
  }
  parts.push(`Time: ${new Date(log.created_at).toLocaleString()}`);
  return parts.join("\n");
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .getAuditLogs()
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all administrative changes"
        actions={<AdminButton variant="secondary" onClick={load}>Refresh</AdminButton>}
      />

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-sm opacity-50">No audit logs yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="admin-card rounded-xl border p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#800000]/10 px-3 py-0.5 text-xs font-medium text-[#800000]">
                    {log.entity_type}
                  </span>
                  <span className="text-xs opacity-50">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed opacity-80">
                  {formatLogEntry(log)}
                </pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
