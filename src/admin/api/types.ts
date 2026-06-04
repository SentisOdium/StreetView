export type AdminLocation = {
  id: number;
  node_name: string;
  coordinates: string;
  panorama_image: string;
  floor: string;
  description?: string;
  node_details_id?: number;
  image_alt?: string;
};

export type AdminHotspot = {
  id?: number;
  destination_id: number;
  destination_name: string;
  hotspot_label: string;
  yaw: number;
  pitch: number;
  path_weight?: number;
};

export type AdminRoom = {
  id?: number;
  room_number: number;
  room_type: string;
  room_img: string;
  room_description: string;
};

export type DashboardStats = {
  totalLocations: number;
  totalHotspots: number;
  totalRooms: number;
  totalFloors: number;
  recentlyModified: AdminLocation[];
  graphStats: {
    total_nodes: number;
    total_edges: number;
    orphan_nodes: number;
  };
};

export type GraphNode = {
  id: number;
  node_name: string;
  floor: string;
};

export type GraphEdge = {
  id: number;
  source: number;
  target: number;
  label: string;
};

export type ValidationIssue = {
  type: string;
  message: string;
  locationId?: number;
  hotspotId?: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: {
    errorCount: number;
    warningCount: number;
    totalLocations: number;
    totalHotspots: number;
  };
};

export type AuditLogEntry = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  location_name: string | null;
  admin_user: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

export type RouteTestResult = {
  path: { id: number; dist: number; name: string; type: string }[];
  routeLength: number;
  transitions: number;
  missingLinks: ValidationIssue[];
  invalidConnections: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
