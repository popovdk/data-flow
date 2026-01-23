import type { AstDiagram, Diagnostic } from "./types";
import { parse } from "./parser.generated";

export function parseDsl(input: string): {
  diagram: AstDiagram | null;
  diagnostics: Diagnostic[];
} {
  try {
    const diagram = parse(input, {}) as AstDiagram;
    return { diagram, diagnostics: [] };
  } catch (error) {
    const diagnostics: Diagnostic[] = [];
    const maybeError = error as {
      message?: string;
      location?: { start: { line: number; column: number } };
    };
    if (maybeError?.location?.start) {
      diagnostics.push({
        message: maybeError.message ?? "Syntax error",
        line: maybeError.location.start.line,
        column: maybeError.location.start.column,
        severity: "error",
      });
    } else {
      diagnostics.push({
        message: "Syntax error",
        line: 1,
        column: 1,
        severity: "error",
      });
    }
    return { diagram: null, diagnostics };
  }
}
