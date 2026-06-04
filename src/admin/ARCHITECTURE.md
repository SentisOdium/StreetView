# Wayfinder Admin Panel — Architecture

## 1. UI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BrowserRouter                                              │
│  ├── / (Public Viewer — HomePage)                           │
│  └── /admin/* (Admin Panel — AdminLayout + Outlet)          │
│       ├── Dashboard                                         │
│       ├── Locations (CRUD)                                  │
│       ├── Hotspot Editor (R3F + Zustand)                    │
│       ├── Navigation Graph (React Flow)                     │
│       ├── Rooms (CRUD)                                      │
│       ├── Route Testing                                     │
│       ├── Audit Logs                                        │
│       └── Settings (theme, auth, import/export, validation) │
└─────────────────────────────────────────────────────────────┘
```

**Stack:** React 19, TypeScript, Tailwind CSS v4, Zustand, React Router v7, React Three Fiber, @xyflow/react.

---

## 2. Component Hierarchy

```
src/admin/
├── AdminRoutes.tsx
├── layout/
│   └── AdminLayout.tsx          # Sidebar + Outlet
├── pages/
│   ├── DashboardPage.tsx
│   ├── LocationsPage.tsx
│   ├── HotspotEditorPage.tsx    # Canvas + property panel
│   ├── NavigationGraphPage.tsx  # ReactFlow + tree view
│   ├── RoomsPage.tsx
│   ├── RouteTestingPage.tsx
│   ├── AuditLogsPage.tsx
│   └── SettingsPage.tsx
├── components/shared/
│   └── AdminUI.tsx              # StatCard, buttons, inputs
├── store/
│   ├── themeStore.ts            # Dark/light (persisted)
│   └── adminStore.ts            # Locations + hotspot editor state
├── api/
│   ├── adminApi.ts              # Axios client
│   └── types.ts
└── utils/
    └── hotspotMath.ts           # yaw/pitch ↔ 3D position
```

---

## 3. Database Schema Recommendations

Existing tables: `node`, `node_details`, `node_coordinates`, `node_img`, `node_hotspots`, `node_sprite`.

**Recommended additions** (see `streetview-backend/migrations/001_admin_extensions.sql`):

| Change | Purpose |
|--------|---------|
| `node_hotspots.yaw`, `node_hotspots.pitch` | Precise hotspot placement |
| `audit_log` table | Persistent audit trail |
| Optional `floors` table | Dedicated floor hierarchy vs. `node_details.type` |

---

## 4. API Endpoint Design

Base: `GET/POST/PUT/DELETE /api/admin/*`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Stats overview |
| `/locations` | GET, POST | List/create locations |
| `/locations/:id` | GET, PUT, DELETE | Location CRUD + hotspots/rooms |
| `/hotspots/node/:nodeId` | GET, POST | Hotspots per node |
| `/hotspots/:id` | PUT, DELETE | Update/delete hotspot |
| `/rooms/node/:nodeId` | GET, POST | Rooms per node |
| `/rooms/:id` | PUT, DELETE | Room CRUD |
| `/graph` | GET | Nodes + edges for visualization |
| `/validate` | GET | Full graph validation |
| `/route-test?source=&destination=` | GET | Route simulation |
| `/export` | GET | Full JSON export |
| `/audit-logs` | GET | Change history |
| `/upload` | POST | Image upload (multipart) |
| `/floors` | GET | Distinct floor list |

Auth: optional `x-admin-token` header when `ADMIN_TOKEN` env is set.

---

## 5. State Management Strategy

| Concern | Tool |
|---------|------|
| Theme (dark/light) | Zustand + localStorage persist |
| Location list cache | Zustand `useAdminStore` |
| Hotspot editor (undo/redo, dirty) | Zustand `useHotspotEditorStore` |
| Page-local form state | React `useState` |
| Server data | Admin API via axios |

---

## 6. Folder Structure

See component hierarchy above. Backend additions:

```
streetview-backend/
├── routes/admin/adminRouter.js
├── controllers/admin/adminController.js
├── services/admin/
│   ├── auditService.js
│   └── validationService.js
├── database/adminQuery/AdminQuery.js
├── middleware/adminAuth.js
└── migrations/001_admin_extensions.sql
```

---

## 7. Wireframe Layouts

### Dashboard
```
[Sidebar] | [Header: Dashboard + Quick Actions]
          | [4 stat cards: Locations | Hotspots | Rooms | Floors]
          | [Graph stats chart] [Quick action grid]
          | [Recently modified table]
```

### Hotspot Editor
```
[Sidebar] | [Toolbar: Undo | Redo | Reset | Save]
          | [Location selector | Destination | Label | Snap]
          | [3D Panorama Canvas ──────────────] [Properties Panel]
```

### Navigation Graph
```
[Sidebar] | [React Flow canvas (draggable nodes)] | [Tree view + issues]
```

---

## 8. Step-by-Step Implementation Plan

1. ✅ Backend admin router + CRUD queries
2. ✅ Frontend routing + layout + theme
3. ✅ Dashboard + Locations CRUD
4. ✅ Hotspot editor with R3F drag/click placement
5. ✅ React Flow graph + validation service
6. ✅ Rooms, route testing, audit logs
7. ✅ Import/export + settings
8. Run migration SQL on production DB
9. Configure S3/CloudFront upload pipeline for images
10. Add JWT auth + role-based access

---

## 9. Scalability Considerations

- **Caching:** Clear `apicache` on admin writes (implemented)
- **Pagination:** Add to `/locations` and `/audit-logs` for large datasets
- **WebSockets:** Real-time graph updates for multi-admin editing
- **CDN:** Upload to S3 → CloudFront (matches existing viewer)
- **Read replicas:** Separate admin write DB from public read API
- **Optimistic UI:** Hotspot editor can save incrementally per hotspot

---

## 10. Future Enhancements

- **Floor maps:** 2D floor plan overlay with node pins
- **Indoor positioning:** BLE/Wi-Fi triangulation integration
- **Analytics:** Heatmaps of popular routes, dwell time per node
- **Version control:** Snapshot/rollback of navigation graph
- **Multi-language:** i18n for labels and room descriptions
- **AI assist:** Auto-suggest hotspot placement from panorama analysis

---

## Access

- **Admin panel:** `http://localhost:5173/admin`
- **Backend API:** `http://localhost:5000/api/admin`
- **Optional auth:** Set `ADMIN_TOKEN` in backend `.env`, matching token in Settings page
