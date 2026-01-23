import type { DiagramModel, FieldModel } from "../dsl";
import type {
  BundledEdge,
  FieldIndexEntry,
  GraphConnection,
  GraphData,
  HighlightState,
} from "./types";

export const fieldKey = (nodeId: string, fieldPath: string) =>
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

const connectionKey = (sourceKey: string, targetKey: string) =>
  `${sourceKey}->${targetKey}`;

export function buildGraph(diagram: DiagramModel): GraphData {
  const fieldIndex = new Map<string, FieldIndexEntry>();
  for (const node of diagram.nodes) {
    for (const field of flattenFields(node.fields)) {
      const key = fieldKey(node.id, field.path);
      fieldIndex.set(key, { key, nodeId: node.id, fieldPath: field.path, field });
    }
  }

  const outgoing = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();
  const connections: GraphConnection[] = [];
  const edgeByPair = new Map<string, string[]>();
  const nodeSourceFields = new Map<string, Set<string>>();
  const nodeTargetFields = new Map<string, Set<string>>();

  for (const connection of diagram.connections) {
    const sourceKey = fieldKey(
      connection.source.nodeId,
      connection.source.fieldPath,
    );
    const targetKey = fieldKey(
      connection.target.nodeId,
      connection.target.fieldPath,
    );
    const key = connectionKey(sourceKey, targetKey);
    connections.push({ key, sourceKey, targetKey, connection });

    if (!outgoing.has(sourceKey)) {
      outgoing.set(sourceKey, new Set());
    }
    outgoing.get(sourceKey)?.add(targetKey);

    if (!incoming.has(targetKey)) {
      incoming.set(targetKey, new Set());
    }
    incoming.get(targetKey)?.add(sourceKey);

    if (!edgeByPair.has(key)) {
      edgeByPair.set(key, []);
    }
    edgeByPair.get(key)?.push(key);

    if (!nodeSourceFields.has(connection.source.nodeId)) {
      nodeSourceFields.set(connection.source.nodeId, new Set());
    }
    nodeSourceFields.get(connection.source.nodeId)?.add(sourceKey);

    if (!nodeTargetFields.has(connection.target.nodeId)) {
      nodeTargetFields.set(connection.target.nodeId, new Set());
    }
    nodeTargetFields.get(connection.target.nodeId)?.add(targetKey);
  }

  return {
    fieldIndex,
    outgoing,
    incoming,
    connections,
    edgeByPair,
    nodeSourceFields,
    nodeTargetFields,
  };
}

export function bundleConnections(diagram: DiagramModel): BundledEdge[] {
  const bundles = new Map<string, BundledEdge>();
  for (const connection of diagram.connections) {
    const key = `${connection.source.nodeId}->${connection.target.nodeId}`;
    if (!bundles.has(key)) {
      bundles.set(key, {
        key,
        source: connection.source.nodeId,
        target: connection.target.nodeId,
        connections: [],
      });
    }
    bundles.get(key)?.connections.push(connection);
  }
  return Array.from(bundles.values());
}

const collectNodesFromFields = (
  fieldKeys: Set<string>,
  fieldIndex: Map<string, FieldIndexEntry>,
): Set<string> => {
  const nodes = new Set<string>();
  for (const key of fieldKeys) {
    const entry = fieldIndex.get(key);
    if (entry) {
      nodes.add(entry.nodeId);
    }
  }
  return nodes;
};

const traverseFull = (
  start: string,
  adjacency: Map<string, Set<string>>,
  edgeByPair: Map<string, string[]>,
  fieldSet: Set<string>,
  edgeSet: Set<string>,
  graph: GraphData,
  reverse: boolean,
) => {
  const visited = new Set<string>();
  const queue: string[] = [start];
  visited.add(start);
  fieldSet.add(start);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const neighbors = adjacency.get(current) ?? new Set();
    for (const next of neighbors) {
      const key = reverse
        ? connectionKey(next, current)
        : connectionKey(current, next);
      const edgeKeys = edgeByPair.get(key) ?? [];
      edgeKeys.forEach((edge) => edgeSet.add(edge));
      if (!visited.has(next)) {
        visited.add(next);
        fieldSet.add(next);
        queue.push(next);
      }
    }

    const entry = graph.fieldIndex.get(current);
    if (!entry) {
      continue;
    }
    const nodeId = entry.nodeId;
    if (reverse) {
      const sources = graph.nodeSourceFields.get(nodeId);
      const targets = graph.nodeTargetFields.get(nodeId);
      if (sources?.has(current) && targets?.size === 1) {
        for (const next of targets) {
          if (!visited.has(next)) {
            visited.add(next);
            fieldSet.add(next);
            queue.push(next);
          }
        }
      }
    } else {
      const targets = graph.nodeTargetFields.get(nodeId);
      const sources = graph.nodeSourceFields.get(nodeId);
      if (targets?.has(current) && sources?.size === 1) {
        for (const next of sources) {
          if (!visited.has(next)) {
            visited.add(next);
            fieldSet.add(next);
            queue.push(next);
          }
        }
      }
    }
  }
};

export function computeHighlight(
  graph: GraphData,
  selectedFieldKey: string,
  reverse: boolean,
): HighlightState {
  const activeFieldKeys = new Set<string>();
  const reverseFieldKeys = new Set<string>();
  const activeEdgeKeys = new Set<string>();
  const reverseEdgeKeys = new Set<string>();

  if (!graph.fieldIndex.has(selectedFieldKey)) {
    return {
      activeFieldKeys,
      reverseFieldKeys,
      activeEdgeKeys,
      reverseEdgeKeys,
      activeNodeIds: new Set(),
      hasHighlight: false,
    };
  }

  activeFieldKeys.add(selectedFieldKey);

  const directOutgoing = graph.outgoing.get(selectedFieldKey) ?? new Set();
  for (const target of directOutgoing) {
    activeFieldKeys.add(target);
    const key = connectionKey(selectedFieldKey, target);
    graph.edgeByPair.get(key)?.forEach((edge) => activeEdgeKeys.add(edge));
  }

  const directIncoming = graph.incoming.get(selectedFieldKey) ?? new Set();
  for (const source of directIncoming) {
    activeFieldKeys.add(source);
    const key = connectionKey(source, selectedFieldKey);
    graph.edgeByPair.get(key)?.forEach((edge) => activeEdgeKeys.add(edge));
  }

  traverseFull(
    selectedFieldKey,
    graph.outgoing,
    graph.edgeByPair,
    activeFieldKeys,
    activeEdgeKeys,
    graph,
    false,
  );
  if (reverse) {
    traverseFull(
      selectedFieldKey,
      graph.incoming,
      graph.edgeByPair,
      reverseFieldKeys,
      reverseEdgeKeys,
      graph,
      true,
    );
  }

  const activeNodeIds = new Set([
    ...collectNodesFromFields(activeFieldKeys, graph.fieldIndex),
    ...collectNodesFromFields(reverseFieldKeys, graph.fieldIndex),
  ]);

  const hasHighlight =
    activeFieldKeys.size > 0 || reverseFieldKeys.size > 0;

  return {
    activeFieldKeys,
    reverseFieldKeys,
    activeEdgeKeys,
    reverseEdgeKeys,
    activeNodeIds,
    hasHighlight,
  };
}
