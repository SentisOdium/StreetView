import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function DirectionsFlow() {
  return (
    <div className="w-full h-full relative flex-1" style={{ minHeight: 250 }}>
      <ReactFlow
        nodes={[
          {
            id: "entrance",
            data: { label: "Entrance main" },
            position: { x: 30, y: 120 },
            style: {
              background: "#6b0f0f",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 9.5,
              fontWeight: "600",
              padding: "7px 12px",
              textAlign: "center" as const,
              boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
              minWidth: 115,
            },
          },
          {
            id: "driveway1",
            data: { label: "Driveway_1" },
            position: { x: 190, y: 50 },
            style: {
              background: "#6b0f0f",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 9.5,
              fontWeight: "600",
              padding: "7px 12px",
              textAlign: "center" as const,
              boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
              minWidth: 115,
            },
          },
          {
            id: "driveway3",
            data: { label: "Driveway_3" },
            position: { x: 190, y: 190 },
            style: {
              background: "#6b0f0f",
              color: "#fff",
              border: "2.5px solid #ffcc00",
              borderRadius: 10,
              fontSize: 9.5,
              fontWeight: "700",
              padding: "6px 11px",
              textAlign: "center" as const,
              boxShadow: "0 0 12px #ffcc00, 0 2px 5px rgba(0,0,0,0.12)",
              minWidth: 115,
            },
          },
          {
            id: "itech",
            data: { label: "Itech Center" },
            position: { x: 350, y: 50 },
            style: {
              background: "#e8d3d3",
              color: "#a37a7a",
              border: "none",
              borderRadius: 10,
              fontSize: 9,
              padding: "7px 12px",
              textAlign: "center" as const,
              opacity: 0.65,
              minWidth: 110,
            },
          },
          {
            id: "mdriveway",
            data: { label: "M.Driveway" },
            position: { x: 350, y: 190 },
            style: {
              background: "#6b0f0f",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 9.5,
              fontWeight: "600",
              padding: "7px 12px",
              textAlign: "center" as const,
              boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
              minWidth: 115,
            },
          },
        ]}
        edges={[
          {
            id: "e-ent-dw1",
            source: "entrance",
            target: "driveway1",
            style: { stroke: "#800000", strokeWidth: 2, strokeDasharray: "4 4" },
            animated: true,
          },
          {
            id: "e-ent-dw3",
            source: "entrance",
            target: "driveway3",
            style: { stroke: "#800000", strokeWidth: 2.5, strokeDasharray: "4 4" },
            animated: true,
          },
          {
            id: "e-dw1-itech",
            source: "driveway1",
            target: "itech",
            style: { stroke: "#e8d3d3", strokeWidth: 1.2 },
          },
          {
            id: "e-dw3-mdrv",
            source: "driveway3",
            target: "mdriveway",
            style: { stroke: "#800000", strokeWidth: 2.5, strokeDasharray: "4 4" },
            animated: true,
          },
        ]}
        fitView
        fitViewOptions={{ padding: 0.65 }}
        nodesConnectable={false}
        nodesDraggable={true}
        zoomOnScroll={false}
        panOnDrag={true}
      >
        <Background color="#f1f5f9" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
