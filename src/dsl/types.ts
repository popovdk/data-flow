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

/** PEG.js/Peggy syntax error structure */
export interface PegJsSyntaxError {
  message: string;
  location: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}

export interface AstDiagram {
  nodes: AstNode[];
  groups: AstGroup[];
  connections: AstConnection[];
}

export interface AstGroup {
  type: "group";
  id: string;
  label?: string;
  nodes: AstNode[];
  loc: SourceLocation;
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

export interface GroupModel {
  id: string;
  label?: string;
  nodeIds: string[];
  loc: SourceLocation;
}

export interface ConnectionModel {
  source: { nodeId: string; fieldPath: string; loc: SourceLocation };
  target: { nodeId: string; fieldPath: string; loc: SourceLocation };
  loc: SourceLocation;
}

export interface DiagramModel {
  nodes: NodeModel[];
  groups?: GroupModel[];
  connections: ConnectionModel[];
}
