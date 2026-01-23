## MODIFIED Requirements
### Requirement: Architecture modules
The implementation SHALL be structured into three layers with one-way dependencies (DSL core -> Diagram core -> Web UI):
- DSL core: parser (DSL text -> AST), diagnostics, and validator (AST -> diagnostics + normalized model). It MUST NOT depend on DOM, layout, or pan/zoom libraries.
- Diagram core: graph builder + bundling, highlight traversal, layout engine, and pipeline helpers. It MAY depend on layout libraries (for example, Dagre) but MUST NOT depend on DOM or browser-only APIs.
- Web UI: SVG renderer, interaction controller, editor wiring, and persistence/share/export utilities. It MAY depend on DOM and browser APIs.

The directory structure SHALL reflect these layers (for example, `src/dsl/`, `src/diagram/`, and `src/render/` or equivalent), and each layer SHALL expose an explicit entry point for imports.

#### Scenario: Parsing and rendering follow a clear pipeline
- **WHEN** the user edits the DSL
- **THEN** the system processes it through parse -> validate -> build graph/model -> layout -> render

#### Scenario: Core layers are platform-agnostic
- **WHEN** a consumer imports DSL core or diagram core from a Node.js runtime
- **THEN** the import does not require DOM globals or browser-only libraries
