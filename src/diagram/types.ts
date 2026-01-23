import type { ConnectionModel, DiagramModel, FieldModel } from "../dsl";

export interface FieldIndexEntry {
  key: string;
  nodeId: string;
  fieldPath: string;
  field: FieldModel;
}

export interface GraphConnection {
  key: string;
  sourceKey: string;
  targetKey: string;
  connection: ConnectionModel;
}

export interface GraphData {
  fieldIndex: Map<string, FieldIndexEntry>;
  outgoing: Map<string, Set<string>>;
  incoming: Map<string, Set<string>>;
  connections: GraphConnection[];
  edgeByPair: Map<string, string[]>;
  nodeSourceFields: Map<string, Set<string>>;
  nodeTargetFields: Map<string, Set<string>>;
}

export interface BundledEdge {
  key: string;
  source: string;
  target: string;
  connections: ConnectionModel[];
}

export interface FieldLayout {
  key: string;
  nodeId: string;
  path: string;
  label: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fields: FieldLayout[];
}

export interface LayoutResult {
  nodes: LayoutNode[];
  nodeIndex: Map<string, LayoutNode>;
  edges: Map<string, { x: number; y: number }[]>;
  bounds: { width: number; height: number };
  fieldLayouts: Map<string, FieldLayout>;
}

export interface DiagramData {
  diagram: DiagramModel;
  graph: GraphData;
  layout: LayoutResult;
  bundles: BundledEdge[];
}

export interface HighlightState {
  activeFieldKeys: Set<string>;
  reverseFieldKeys: Set<string>;
  activeEdgeKeys: Set<string>;
  reverseEdgeKeys: Set<string>;
  activeNodeIds: Set<string>;
  hasHighlight: boolean;
}
