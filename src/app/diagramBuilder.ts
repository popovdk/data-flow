import { buildGraph, bundleConnections } from "../diagram/graph";
import { computeLayout } from "../diagram/layout";
import { parseDsl } from "../diagram/parser";
import { validateDiagram } from "../diagram/validator";
import type { DiagramData, Diagnostic } from "../diagram/types";

export interface DiagramBuildResult {
  diagnostics: Diagnostic[];
  data: DiagramData | null;
  hasErrors: boolean;
}

export class DiagramBuilder {
  build(text: string): DiagramBuildResult {
    const parsed = parseDsl(text);
    if (!parsed.diagram) {
      return { diagnostics: parsed.diagnostics, data: null, hasErrors: true };
    }

    const validation = validateDiagram(parsed.diagram);
    const diagnostics = validation.diagnostics;
    const hasErrors = diagnostics.some(
      (diagnostic) => diagnostic.severity === "error",
    );
    if (hasErrors) {
      return { diagnostics, data: null, hasErrors: true };
    }

    const diagram = validation.diagram;
    const bundles = bundleConnections(diagram);
    const graph = buildGraph(diagram);
    const layout = computeLayout(diagram, bundles);

    return {
      diagnostics,
      data: { diagram, bundles, graph, layout },
      hasErrors: false,
    };
  }
}
