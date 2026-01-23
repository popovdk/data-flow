import * as dagre from "dagre";

import type { DiagramModel } from "../dsl";
import type { BundledEdge, FieldLayout, LayoutNode, LayoutResult } from "./types";

const CHAR_WIDTH = 7;
const NODE_MIN_WIDTH = 160;
const NODE_PADDING_X = 14;
const NODE_PADDING_Y = 12;
const HEADER_HEIGHT = 24;
const ROW_HEIGHT = 18;
const ROW_GAP = 4;
const INDENT_SIZE = 12;

type FieldRow = { path: string; label: string; depth: number };

const buildFieldRows = (
  fields: DiagramModel["nodes"][number]["fields"],
  depth = 0,
): FieldRow[] => {
  const rows: FieldRow[] = [];
  for (const field of fields) {
    const label = field.type ? `${field.name}: ${field.type}` : field.name;
    rows.push({ path: field.path, label, depth });
    if (field.children?.length) {
      rows.push(...buildFieldRows(field.children, depth + 1));
    }
  }
  return rows;
};

const estimateNodeSize = (
  label: string,
  rows: FieldRow[],
): { width: number; height: number } => {
  let maxWidth = label.length * CHAR_WIDTH + NODE_PADDING_X * 2;
  for (const row of rows) {
    const rowWidth =
      NODE_PADDING_X * 2 +
      row.depth * INDENT_SIZE +
      row.label.length * CHAR_WIDTH;
    if (rowWidth > maxWidth) {
      maxWidth = rowWidth;
    }
  }
  const width = Math.max(NODE_MIN_WIDTH, maxWidth);
  const height =
    NODE_PADDING_Y * 2 +
    HEADER_HEIGHT +
    rows.length * ROW_HEIGHT +
    Math.max(0, rows.length - 1) * ROW_GAP;
  return { width, height };
};

export function computeLayout(
  diagram: DiagramModel,
  bundles: BundledEdge[],
): LayoutResult {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: "LR",
    nodesep: 50,
    ranksep: 100,
    edgesep: 10,
    marginx: 40,
    marginy: 40,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  const nodeSizing = new Map<
    string,
    { width: number; height: number; rows: FieldRow[] }
  >();

  for (const node of diagram.nodes) {
    const rows = buildFieldRows(node.fields);
    const size = estimateNodeSize(node.label ?? node.id, rows);
    nodeSizing.set(node.id, { ...size, rows });
    graph.setNode(node.id, { width: size.width, height: size.height });
  }

  for (const bundle of bundles) {
    graph.setEdge(bundle.source, bundle.target);
  }

  dagre.layout(graph);

  const nodes: LayoutNode[] = [];
  const nodeIndex = new Map<string, LayoutNode>();
  const fieldLayouts = new Map<string, FieldLayout>();

  for (const node of diagram.nodes) {
    const layoutNode = graph.node(node.id) as { x: number; y: number };
    const size = nodeSizing.get(node.id);
    if (!layoutNode || !size) {
      continue;
    }

    const x = layoutNode.x - size.width / 2;
    const y = layoutNode.y - size.height / 2;
    const fieldsStartY = y + NODE_PADDING_Y + HEADER_HEIGHT;

    const fields: FieldLayout[] = [];
    size.rows.forEach((row, index) => {
      const rowY = fieldsStartY + index * (ROW_HEIGHT + ROW_GAP);
      const layout: FieldLayout = {
        key: `${node.id}.${row.path}`,
        nodeId: node.id,
        path: row.path,
        label: row.label,
        depth: row.depth,
        x: x + NODE_PADDING_X,
        y: rowY,
        width: size.width - NODE_PADDING_X * 2,
        height: ROW_HEIGHT,
      };
      fields.push(layout);
      fieldLayouts.set(layout.key, layout);
    });

    const layout: LayoutNode = {
      id: node.id,
      x,
      y,
      width: size.width,
      height: size.height,
      fields,
    };
    nodes.push(layout);
    nodeIndex.set(node.id, layout);
  }

  const edges = new Map<string, { x: number; y: number }[]>();
  for (const edge of graph.edges()) {
    const edgeData = graph.edge(edge) as { points?: { x: number; y: number }[] };
    const key = `${edge.v}->${edge.w}`;
    if (edgeData?.points?.length) {
      edges.set(key, edgeData.points);
    }
  }

  const bounds = graph.graph() as { width?: number; height?: number };
  return {
    nodes,
    nodeIndex,
    edges,
    bounds: {
      width: (bounds.width ?? 0) + 80,
      height: (bounds.height ?? 0) + 80,
    },
    fieldLayouts,
  };
}
