import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { adminApi } from "../api/adminApi";
import type { GraphEdge, GraphNode, ValidationResult } from "../api/types";
import PageHeader, {
  AdminButton,
  LoadingSpinner,
  ErrorBanner,
} from "../components/shared/AdminUI";

function buildTreeText(nodes: GraphNode[], edges: GraphEdge[]): string {
  const children = new Map<number, { name: string; label: string }[]>();
  const hasParent = new Set<number>();

  for (const e of edges) {
    if (!children.has(e.source)) children.set(e.source, []);
    const node = nodes.find((n) => n.id === e.target);
    children.get(e.source)!.push({ name: node?.node_name || String(e.target), label: e.label });
    hasParent.add(e.target);
  }

  const roots = nodes.filter((n) => !hasParent.has(n.id));
  const lines: string[] = [];

  function walk(id: number, name: string, prefix: string, isLast: boolean) {
    lines.push(prefix + (isLast ? "└── " : "├── ") + name);
    const kids = children.get(id) || [];
    kids.forEach((k, i) => {
      const childNode = nodes.find((n) => n.node_name === k.name);
      if (childNode) {
        walk(childNode.id, `${k.name} (${k.label})`, prefix + (isLast ? "    " : "│   "), i === kids.length - 1);
      }
    });
  }

  roots.forEach((r, i) => walk(r.id, r.node_name, "", i === roots.length - 1));
  return lines.join("\n") || "No connections found";
}

export default function NavigationGraphPage() {
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treeText, setTreeText] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [graph, val] = await Promise.all([
        adminApi.getGraph(),
        adminApi.validate(),
      ]);
      setGraphNodes(graph.nodes);
      setGraphEdges(graph.edges);
      setValidation(val);
      setTreeText(buildTreeText(graph.nodes, graph.edges));

      const rfNodes: Node[] = graph.nodes.map((n, i) => ({
        id: String(n.id),
        data: { label: `${n.node_name}\n${n.floor || ""}` },
        position: { x: (i % 4) * 280, y: Math.floor(i / 4) * 200 },
        style: {
          background: "#800000",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 12,
          padding: 8,
          minWidth: 140,
          textAlign: "center" as const,
        },
      }));

      const rfEdges: Edge[] = graph.edges.map((e) => ({
        id: String(e.id),
        source: String(e.source),
        target: String(e.target),
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#800000" },
        style: { stroke: "#800000" },
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load graph");
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    load();
  }, [load]);

  const orphanCount = useMemo(
    () => validation?.warnings.filter((w) => w.type === "orphan_node").length ?? 0,
    [validation]
  );

  const styledNodes = useMemo(() => {
    if (!selectedNodeId) return nodes;

    const connectedIds = new Set<string>([selectedNodeId]);
    edges.forEach((e) => {
      if (e.source === selectedNodeId) connectedIds.add(e.target);
      if (e.target === selectedNodeId) connectedIds.add(e.source);
    });

    return nodes.map((node) => {
      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedIds.has(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isConnected ? 1 : 0.25,
          border: isSelected ? "3px solid #ffd700" : "none",
          boxShadow: isSelected ? "0 0 15px #ffd700" : "none",
        },
      };
    });
  }, [nodes, edges, selectedNodeId]);

  const styledEdges = useMemo(() => {
    if (!selectedNodeId) return edges;

    return edges.map((edge) => {
      const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;
      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: isConnected ? 1 : 0.08,
          strokeWidth: isConnected ? 3 : 1,
        },
        animated: isConnected,
      };
    });
  }, [edges, selectedNodeId]);

  return (
    <div className="flex h-screen flex-col p-8">
      <PageHeader
        title="Navigation Graph"
        subtitle="Visualize and analyze location connections (Click a node to highlight connections)"
        actions={<AdminButton variant="secondary" onClick={load}>Refresh</AdminButton>}
      />

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-3">
          <div className="admin-card overflow-hidden rounded-xl border lg:col-span-2" style={{ minHeight: 500 }}>
            <ReactFlow
              nodes={styledNodes}
              edges={styledEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_event, node) => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
              fitView
              nodesDraggable
              nodesConnectable={false}
            >
              <Background />
              <Controls />
              <MiniMap nodeColor="#800000" />
            </ReactFlow>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <div className="admin-card rounded-xl border p-4 shadow-sm">
              <h3 className="mb-2 font-semibold">Graph Summary</h3>
              <div className="space-y-1 text-sm">
                <p>Nodes: {graphNodes.length}</p>
                <p>Connections: {graphEdges.length}</p>
                <p className={orphanCount > 0 ? "text-amber-500" : ""}>
                  Orphan nodes: {orphanCount}
                </p>
                <p className={validation?.errors.length ? "text-red-500" : "text-green-600"}>
                  Errors: {validation?.errors.length ?? 0}
                </p>
              </div>
            </div>

            <div className="admin-card rounded-xl border p-4 shadow-sm">
              <h3 className="mb-2 font-semibold">Tree View</h3>
              <pre className="overflow-x-auto text-xs leading-relaxed opacity-80">{treeText}</pre>
            </div>

            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="admin-card rounded-xl border p-4 shadow-sm">
                <h3 className="mb-2 font-semibold">Issues Detected</h3>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
                  {[...validation.errors, ...validation.warnings].map((issue, i) => (
                    <li
                      key={i}
                      className={validation.errors.includes(issue) ? "text-red-500" : "text-amber-500"}
                    >
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
