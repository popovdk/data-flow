import type { AstDiagram, Diagnostic, PegJsSyntaxError } from "./types";
import { parse } from "./parser.generated";

function isPegJsSyntaxError(error: unknown): error is PegJsSyntaxError {
  if (error === null || typeof error !== "object") {
    return false;
  }
  const obj = error as Record<string, unknown>;
  if (typeof obj.message !== "string") {
    return false;
  }
  if (typeof obj.location !== "object" || obj.location === null) {
    return false;
  }
  const location = obj.location as Record<string, unknown>;
  if (typeof location.start !== "object" || location.start === null) {
    return false;
  }
  const start = location.start as Record<string, unknown>;
  return typeof start.line === "number" && typeof start.column === "number";
}

export function parseDsl(input: string): {
  diagram: AstDiagram | null;
  diagnostics: Diagnostic[];
} {
  try {
    // Type assertion needed: generated parser returns untyped value
    const diagram = parse(input, {}) as AstDiagram;
    return { diagram, diagnostics: [] };
  } catch (error) {
    const diagnostics: Diagnostic[] = [];
    if (isPegJsSyntaxError(error)) {
      diagnostics.push({
        message: error.message,
        line: error.location.start.line,
        column: error.location.start.column,
        severity: "error",
      });
    } else {
      diagnostics.push({
        message: error instanceof Error ? error.message : "Syntax error",
        line: 1,
        column: 1,
        severity: "error",
      });
    }
    return { diagram: null, diagnostics };
  }
}
