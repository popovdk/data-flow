/**
 * Type definitions and safe accessors for dagre graph library.
 * Centralizes type assertions for untyped dagre API returns.
 */

import type * as dagre from "dagre";

/** Position and dimensions returned by dagre for a node */
export interface DagreNodeData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Edge routing points returned by dagre */
export interface DagreEdgeData {
  points?: Array<{ x: number; y: number }>;
}

/** Graph bounds returned by dagre */
export interface DagreGraphBounds {
  width?: number;
  height?: number;
}

/**
 * Safe accessor for node position data from dagre graph.
 * Returns undefined if node doesn't exist or data is malformed.
 */
export function getNodePosition(
  graph: dagre.graphlib.Graph,
  nodeId: string,
): DagreNodeData | undefined {
  const data = graph.node(nodeId);
  if (
    data &&
    typeof data === "object" &&
    typeof data.x === "number" &&
    typeof data.y === "number"
  ) {
    return data as DagreNodeData;
  }
  return undefined;
}

/**
 * Safe accessor for edge routing points from dagre graph.
 * Returns undefined if edge doesn't exist or has no points.
 */
export function getEdgePoints(
  graph: dagre.graphlib.Graph,
  edge: dagre.Edge,
): Array<{ x: number; y: number }> | undefined {
  const data = graph.edge(edge);
  if (data && typeof data === "object" && Array.isArray(data.points)) {
    return data.points;
  }
  return undefined;
}

/**
 * Safe accessor for graph bounds from dagre graph.
 * Returns object with optional width/height.
 */
export function getGraphBounds(graph: dagre.graphlib.Graph): DagreGraphBounds {
  const data = graph.graph();
  if (data && typeof data === "object") {
    return {
      width: typeof data.width === "number" ? data.width : undefined,
      height: typeof data.height === "number" ? data.height : undefined,
    };
  }
  return {};
}
