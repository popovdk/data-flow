import type { Diagnostic } from "../diagram/types";

export class DiagnosticsRenderer {
  private readonly host: HTMLElement;
  private readonly emptyMessage: string;

  constructor(host: HTMLElement, emptyMessage: string) {
    this.host = host;
    this.emptyMessage = emptyMessage;
  }

  render(diagnostics: Diagnostic[]): void {
    this.host.innerHTML = "";
    if (diagnostics.length === 0) {
      this.host.textContent = this.emptyMessage;
      return;
    }
    diagnostics.forEach((diagnostic) => {
      const line = document.createElement("div");
      line.className = `diagnostic ${diagnostic.severity}`;
      line.textContent = this.formatDiagnostic(diagnostic);
      this.host.appendChild(line);
    });
  }

  private formatDiagnostic(diagnostic: Diagnostic): string {
    return `${diagnostic.severity.toUpperCase()} L${diagnostic.line} C${diagnostic.column}: ${diagnostic.message}`;
  }
}
