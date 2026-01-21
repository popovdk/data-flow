export type DiagnosticSeverity = "error" | "warning";

export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
}

export interface Diagnostic {
  message: string;
  line: number;
  column: number;
  severity: DiagnosticSeverity;
}

export interface AstDiagram {
  nodes: AstNode[];
  connections: AstConnection[];
}

export interface AstNode {
  type: "node";
  id: string;
  label?: string;
  fields: AstField[];
  loc: SourceLocation;
}

export interface AstField {
  type: "field";
  name: string;
  fieldType?: string;
  children?: AstField[];
  loc: SourceLocation;
}

export interface AstFieldRef {
  nodeId: string;
  path: string;
  loc: SourceLocation;
}

export interface AstConnection {
  type: "connection";
  source: AstFieldRef;
  target: AstFieldRef;
  loc: SourceLocation;
}

export interface FieldModel {
  name: string;
  type?: string;
  path: string;
  children?: FieldModel[];
  loc: SourceLocation;
}

export interface NodeModel {
  id: string;
  label?: string;
  fields: FieldModel[];
  loc: SourceLocation;
}

export interface ConnectionModel {
  source: { nodeId: string; fieldPath: string; loc: SourceLocation };
  target: { nodeId: string; fieldPath: string; loc: SourceLocation };
  loc: SourceLocation;
}

export interface DiagramModel {
  nodes: NodeModel[];
  connections: ConnectionModel[];
}

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
