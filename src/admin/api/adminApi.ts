import axios from "axios";
import { BaseUrl } from "../../components/objects/baseUrl";
import type {
  AdminHotspot,
  AdminLocation,
  AdminRoom,
  ApiResponse,
  AuditLogEntry,
  DashboardStats,
  GraphEdge,
  GraphNode,
  RouteTestResult,
  ValidationResult,
} from "./types";

const adminBase = `${BaseUrl}/admin`;

// Removed legacy custom headers function. Authentication is now handled via HTTP-only cookies.

async function get<T>(path: string, params?: Record<string, string>) {
  const res = await axios.get<ApiResponse<T>>(`${adminBase}${path}`, {
    withCredentials: true,
    params,
  });
  return res.data.data;
}

async function post<T>(path: string, body: unknown) {
  const res = await axios.post<ApiResponse<T>>(`${adminBase}${path}`, body, {
    withCredentials: true,
  });
  return res.data.data;
}

async function put<T>(path: string, body: unknown) {
  const res = await axios.put<ApiResponse<T>>(`${adminBase}${path}`, body, {
    withCredentials: true,
  });
  return res.data.data;
}

async function del<T>(path: string) {
  const res = await axios.delete<ApiResponse<T>>(`${adminBase}${path}`, {
    withCredentials: true,
  });
  return res.data.data;
}

export const adminApi = {
  getDashboard: () => get<DashboardStats>("/dashboard"),
  getFloors: () => get<string[]>("/floors"),
  getLocations: (params?: { floor?: string; search?: string }) =>
    get<AdminLocation[]>("/locations", params),
  getLocation: (id: number) =>
    get<AdminLocation & { hotspots: AdminHotspot[]; rooms: AdminRoom[] }>(
      `/locations/${id}`
    ),
  createLocation: (data: Partial<AdminLocation>) =>
    post<{ id: number }>("/locations", data),
  updateLocation: (id: number, data: Partial<AdminLocation>) =>
    put<AdminLocation>(`/locations/${id}`, data),
  deleteLocation: (id: number) => del(`/locations/${id}`),

  getHotspots: (nodeId?: number) =>
    get<AdminHotspot[]>(
      nodeId ? `/hotspots/node/${nodeId}` : "/hotspots"
    ),
  createHotspot: (nodeId: number, data: Partial<AdminHotspot>) =>
    post<{ id: number }>(`/hotspots/node/${nodeId}`, data),
  updateHotspot: (id: number, data: Partial<AdminHotspot>) =>
    put(`/hotspots/${id}`, data),
  deleteHotspot: (id: number) => del(`/hotspots/${id}`),

  getRooms: (nodeId: number) => get<AdminRoom[]>(`/rooms/node/${nodeId}`),
  createRoom: (nodeId: number, data: Partial<AdminRoom>) =>
    post<{ id: number }>(`/rooms/node/${nodeId}`, data),
  updateRoom: (id: number, data: Partial<AdminRoom>) =>
    put(`/rooms/${id}`, data),
  deleteRoom: (id: number) => del(`/rooms/${id}`),

  getGraph: () =>
    get<{ nodes: GraphNode[]; edges: GraphEdge[] }>("/graph"),
  validate: () => get<ValidationResult>("/validate"),
  routeTest: (source: string, destination: string) =>
    get<RouteTestResult>("/route-test", { source, destination }),
  exportAll: () => get<Record<string, unknown>>("/export"),
  getAuditLogs: () => get<AuditLogEntry[]>("/audit-logs"),

  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await axios.post<ApiResponse<{ filename: string; path: string }>>(
      `${adminBase}/upload`,
      form,
      { 
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" } 
      }
    );
    return res.data.data;
  },

  createAdmin: async (data: any) => {
    const res = await axios.post<{ success: boolean; message: string }>(
      `${BaseUrl}/admin-auth/register`,
      data,
      { withCredentials: true }
    );
    return res.data;
  },
};

export function exportToJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
