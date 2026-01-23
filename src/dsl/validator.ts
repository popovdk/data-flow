import type {
  AstDiagram,
  Diagnostic,
  DiagramModel,
  FieldModel,
  GroupModel,
  NodeModel,
  SourceLocation,
} from "./types";

const makeDiagnostic = (
  message: string,
  loc: SourceLocation,
  severity: "error" | "warning",
): Diagnostic => ({
  message,
  line: loc.line,
  column: loc.column,
  severity,
});

const fieldKey = (nodeId: string, fieldPath: string) =>
  `${nodeId}.${fieldPath}`;

const flattenFields = (fields: FieldModel[]): FieldModel[] => {
  const result: FieldModel[] = [];
  for (const field of fields) {
    result.push(field);
    if (field.children?.length) {
      result.push(...flattenFields(field.children));
    }
  }
  return result;
};

const normalizeFields = (
  fields: AstDiagram["nodes"][number]["fields"],
  prefix = "",
): FieldModel[] =>
  fields.map((field) => {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    const children = field.children
      ? normalizeFields(field.children, path)
      : undefined;
    return {
      name: field.name,
      type: field.fieldType,
      path,
      children,
      loc: field.loc,
    };
  });

const validateFieldUniqueness = (
  fields: AstDiagram["nodes"][number]["fields"],
  diagnostics: Diagnostic[],
) => {
  const seen = new Map<string, SourceLocation>();
  for (const field of fields) {
    if (seen.has(field.name)) {
      diagnostics.push(
        makeDiagnostic(
          `Duplicate field name "${field.name}".`,
          field.loc,
          "error",
        ),
      );
    } else {
      seen.set(field.name, field.loc);
    }
    if (field.children?.length) {
      validateFieldUniqueness(field.children, diagnostics);
    }
  }
};

const fieldOrDescendantUsed = (
  field: FieldModel,
  nodeId: string,
  usedFields: Set<string>,
): boolean => {
  if (usedFields.has(fieldKey(nodeId, field.path))) {
    return true;
  }
  if (!field.children?.length) {
    return false;
  }
  return field.children.some((child) =>
    fieldOrDescendantUsed(child, nodeId, usedFields),
  );
};

export function validateDiagram(ast: AstDiagram): {
  diagram: DiagramModel;
  diagnostics: Diagnostic[];
} {
  const diagnostics: Diagnostic[] = [];
  const seenNodes = new Map<string, SourceLocation>();
  const seenGroups = new Map<string, SourceLocation>();

  for (const group of ast.groups) {
    if (seenGroups.has(group.id)) {
      diagnostics.push(
        makeDiagnostic(
          `Duplicate group id "${group.id}".`,
          group.loc,
          "error",
        ),
      );
    } else {
      seenGroups.set(group.id, group.loc);
    }
  }

  for (const node of ast.nodes) {
    if (seenNodes.has(node.id)) {
      diagnostics.push(
        makeDiagnostic(
          `Duplicate node id "${node.id}".`,
          node.loc,
          "error",
        ),
      );
    } else {
      seenNodes.set(node.id, node.loc);
    }
    validateFieldUniqueness(node.fields, diagnostics);
  }

  const nodes: NodeModel[] = ast.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    fields: normalizeFields(node.fields),
    loc: node.loc,
  }));

  const groups: GroupModel[] = ast.groups.map((group) => ({
    id: group.id,
    label: group.label,
    nodeIds: group.nodes.map((node) => node.id),
    loc: group.loc,
  }));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const fieldIndex = new Map<string, FieldModel>();

  for (const node of nodes) {
    for (const field of flattenFields(node.fields)) {
      fieldIndex.set(fieldKey(node.id, field.path), field);
    }
  }

  const connections = ast.connections.map((connection) => ({
    source: {
      nodeId: connection.source.nodeId,
      fieldPath: connection.source.path,
      loc: connection.source.loc,
    },
    target: {
      nodeId: connection.target.nodeId,
      fieldPath: connection.target.path,
      loc: connection.target.loc,
    },
    loc: connection.loc,
  }));

  for (const connection of connections) {
    if (!nodeMap.has(connection.source.nodeId)) {
      diagnostics.push(
        makeDiagnostic(
          `Unknown node "${connection.source.nodeId}" in connection source.`,
          connection.source.loc,
          "error",
        ),
      );
    }
    if (!nodeMap.has(connection.target.nodeId)) {
      diagnostics.push(
        makeDiagnostic(
          `Unknown node "${connection.target.nodeId}" in connection target.`,
          connection.target.loc,
          "error",
        ),
      );
    }

    const sourceKey = fieldKey(
      connection.source.nodeId,
      connection.source.fieldPath,
    );
    const targetKey = fieldKey(
      connection.target.nodeId,
      connection.target.fieldPath,
    );

    if (!fieldIndex.has(sourceKey)) {
      diagnostics.push(
        makeDiagnostic(
          `Unknown field path "${sourceKey}".`,
          connection.source.loc,
          "error",
        ),
      );
    }
    if (!fieldIndex.has(targetKey)) {
      diagnostics.push(
        makeDiagnostic(
          `Unknown field path "${targetKey}".`,
          connection.target.loc,
          "error",
        ),
      );
    }
  }

  const duplicateConnections = new Set<string>();
  for (const connection of connections) {
    const key = `${fieldKey(
      connection.source.nodeId,
      connection.source.fieldPath,
    )}->${fieldKey(connection.target.nodeId, connection.target.fieldPath)}`;
    if (duplicateConnections.has(key)) {
      diagnostics.push(
        makeDiagnostic(
          `Duplicate connection "${key}".`,
          connection.loc,
          "warning",
        ),
      );
    } else {
      duplicateConnections.add(key);
    }
  }

  const usedFields = new Set<string>();
  for (const connection of connections) {
    const sourceKey = fieldKey(
      connection.source.nodeId,
      connection.source.fieldPath,
    );
    const targetKey = fieldKey(
      connection.target.nodeId,
      connection.target.fieldPath,
    );
    if (fieldIndex.has(sourceKey)) {
      usedFields.add(sourceKey);
    }
    if (fieldIndex.has(targetKey)) {
      usedFields.add(targetKey);
    }
  }

  for (const node of nodes) {
    const allFields = flattenFields(node.fields);
    let nodeUsed = false;
    for (const field of allFields) {
      if (fieldOrDescendantUsed(field, node.id, usedFields)) {
        nodeUsed = true;
      } else {
        diagnostics.push(
          makeDiagnostic(
            `Unused field "${node.id}.${field.path}".`,
            field.loc,
            "warning",
          ),
        );
      }
    }
    if (!nodeUsed) {
      diagnostics.push(
        makeDiagnostic(
          `Node "${node.id}" has no incoming or outgoing connections.`,
          node.loc,
          "warning",
        ),
      );
    }
  }

  return {
    diagram: {
      nodes,
      groups: groups.length ? groups : undefined,
      connections,
    },
    diagnostics,
  };
}
