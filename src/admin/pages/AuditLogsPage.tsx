import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import type { AuditLogEntry } from "../api/types";
import PageHeader, { AdminButton, LoadingSpinner, ErrorBanner } from "../components/shared/AdminUI";

function renderLogDetails(log: AuditLogEntry) {
  const oldVal = log.old_value;
  const newVal = log.new_value;

  const getFriendlyFieldName = (key: string) => {
    const map: Record<string, string> = {
      node_name: "Location Name",
      floor: "Floor / Level",
      type: "Type",
      coordinates: "Coordinates",
      panorama_image: "Panorama Image",
      src: "Image Source",
      rotation_offset: "Yaw Offset (Y)",
      rotation_offset_x: "Pitch Offset (X)",
      rotation_offset_z: "Roll Offset (Z)",
      hotspot_label: "Direction Label",
      direction: "Direction Label",
      destination_id: "Destination ID",
      target_node_id: "Destination Details ID",
      destination_name: "Destination Name",
      yaw: "Yaw (Y)",
      pitch: "Pitch (X)",
      path_weight: "Path Weight",
      room_number: "Room Number",
      room_type: "Room Type",
      room_img: "Room Image",
      room_description: "Room Description",
    };
    return map[key] ?? key;
  };

  const formatVal = (v: any) => {
    if (v === null || v === undefined) return "None";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  if (oldVal && newVal) {
    const allKeys = Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)]))
      .filter(k => k !== "id" && k !== "node_details_id" && k !== "created_at" && k !== "_old" && k !== "node_name");

    const diffs = allKeys.filter(k => {
      const o = oldVal[k];
      const n = newVal[k];
      return formatVal(o) !== formatVal(n);
    });

    if (diffs.length > 0) {
      return (
        <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2 text-sm text-black">
          <div className="font-bold text-black mb-1">Modified Fields</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
            {diffs.map(k => (
              <div key={k} className="flex justify-between items-center py-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-black">{getFriendlyFieldName(k)}</span>
                <span className="text-black">
                  <span className="line-through text-red-500 mr-2 text-[11px]">{formatVal(oldVal[k])}</span>
                  <span className="text-green-700 font-bold">→ {formatVal(newVal[k])}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  const val = newVal || oldVal;
  if (val) {
    const keysToShow = Object.keys(val).filter(
      k => k !== "id" && k !== "node_details_id" && k !== "created_at" && k !== "_old"
    );

    return (
      <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2 text-sm text-black">
        <div className="font-bold text-black mb-1">
          {newVal ? "Entity Details" : "Deleted Entity Details"}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
          {keysToShow.map(k => (
            <div key={k} className="flex justify-between items-center py-1 border-b border-dashed border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-black">{getFriendlyFieldName(k)}</span>
              <span className="text-black font-bold">{formatVal(val[k])}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = (currentPage: number, currentLimit: number) => {
    setLoading(true);
    setError(null);
    const offset = (currentPage - 1) * currentLimit;
    adminApi
      .getAuditLogs(currentLimit, offset)
      .then((res) => {
        setLogs(res.logs);
        setTotal(res.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, limit);
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all administrative changes"
        actions={
          <AdminButton variant="secondary" onClick={() => load(page, limit)}>
            Refresh
          </AdminButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{logs.length}</span> of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> total logs
            </div>
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm opacity-50">No audit logs found</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="admin-card rounded-xl border p-4 shadow-sm text-black">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#800000]/10 px-3 py-0.5 text-xs font-semibold text-[#800000] capitalize">
                        {log.entity_type}
                      </span>
                      <span className="text-base font-bold text-black">
                        {log.admin_user} <span className="text-black font-normal"> {log.action}</span>
                      </span>
                      {log.location_name && (
                        <span className="text-sm text-black">
                          at <span className="font-bold text-black">{log.location_name}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-black">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {renderLogDetails(log)}
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <AdminButton
                  variant="secondary"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  Previous
                </AdminButton>
                <AdminButton
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
