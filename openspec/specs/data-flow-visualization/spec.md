# data-flow-visualization Specification

## Purpose
TBD - created by archiving change add-data-flow-visualization-initial-spec. Update Purpose after archive.
## Requirements
### Requirement: English-only documentation and comments
All project documentation, specifications, and code comments MUST be written in English, even if prompts or discussions are written in another language.

#### Scenario: Creating or updating documentation
- **WHEN** a contributor adds or edits documentation, specs, or code comments
- **THEN** the content is written in English

### Requirement: Client-only static web application
The system SHALL be a static web application that runs entirely in the browser. Parsing, validation, layout, and rendering SHALL execute on the client without requiring a backend service.

#### Scenario: Using the app offline after initial load
- **WHEN** the application assets are loaded in the browser
- **THEN** the user can edit DSL and render diagrams without server interaction

### Requirement: DSL is the source of truth with live preview
The DSL text SHALL be the single source of truth for a diagram. The UI SHALL provide a DSL editor and a live preview that updates automatically as the DSL changes.

#### Scenario: Editing DSL updates the diagram
- **WHEN** the user edits the DSL in the editor
- **THEN** the diagram preview updates automatically (after debouncing)

### Requirement: DSL node declarations
The DSL SHALL support node declarations using the following structure:
- `node <NodeId> { ... }`
- Optional modifiers in square brackets, currently supporting `label="..."`:
  - `node <NodeId> [label="Custom Label"] { ... }`

`NodeId` identifiers are case-sensitive.

#### Scenario: Declaring a node with a custom label
- **WHEN** the DSL contains `node Api [label="Public API"] { id: String }`
- **THEN** the model contains a node with id `Api` and label `Public API`

### Requirement: DSL fields and nested structures
Inside a node, the DSL SHALL support fields defined as `fieldName: Type`. Fields MAY contain nested objects using braces:
- A nested object is written as `nestedName { ... }`
- Nested fields are referenced via dot-separated paths (e.g., `nestedName.subfield`)

Field `Type` is for readability and rendering only; it SHALL NOT affect graph semantics or highlighting logic.

#### Scenario: Declaring nested fields
- **WHEN** a node contains a nested object with subfields
- **THEN** the model contains a hierarchical field structure and full dot-paths for nested fields

### Requirement: DSL connections between fields
The DSL SHALL support directed connections between fields using:
`<SourceNode>.<fieldPath> -> <TargetNode>.<fieldPath>`

The arrow direction SHALL represent the direction of data flow from source to target and SHALL be used for forward “full path” traversal.

#### Scenario: Declaring a connection
- **WHEN** the DSL contains `A.x -> B.y`
- **THEN** the model contains a directed connection from `A.x` to `B.y`

### Requirement: DSL lexical rules and comments
The DSL SHALL follow these rules:
- Identifiers (node ids and field names) default to ASCII pattern `[a-zA-Z_][a-zA-Z0-9_]*`.
- Field paths use dot notation (e.g., `field.subfield.subsubfield`).
- Whitespace and blank lines are ignored.
- Line comments are supported and ignored by the parser:
  - `// ...` to end of line
  - `# ...` to end of line

#### Scenario: Parsing a document containing comments and blank lines
- **WHEN** the DSL includes blank lines and `//` or `#` comments
- **THEN** parsing succeeds and comments do not affect the produced model

### Requirement: Validation of uniqueness constraints
The validator SHALL enforce:
- Node ids are unique within a document.
- Sibling field names at the same nesting level within a node are unique.

#### Scenario: Duplicate node id is rejected
- **WHEN** the DSL defines `node X { ... }` more than once
- **THEN** validation returns a semantic error indicating a duplicate node id

### Requirement: Validation of connection references
The validator SHALL enforce that each connection references existing nodes and existing field paths. If a connection references an unknown node or a non-existent field path, the system SHALL produce a semantic error.

#### Scenario: Connection to an unknown field path is rejected
- **WHEN** the DSL contains `A.unknown -> B.y`
- **THEN** validation returns a semantic error referencing the missing field path and its location

### Requirement: Cycles are allowed and traversals are cycle-safe
Cycles in the connection graph are allowed. All traversal algorithms used for highlighting (direct connections or full-path traversal) MUST be cycle-safe and MUST NOT loop infinitely.

#### Scenario: Full-path traversal does not infinite-loop on a cycle
- **WHEN** the diagram contains a cycle (e.g., `A.x -> B.y` and `B.y -> A.x`)
- **THEN** full-path highlighting terminates and produces a finite highlighted subgraph

### Requirement: Diagnostics with line/column positions
The system SHALL provide diagnostics that include a human-readable message and a source position (line/column) for:
- Syntax/parser errors (unexpected token, malformed structure, unclosed braces)
- Semantic/validation errors (unknown node, missing field path, duplicates)

The UI MUST display diagnostics to the user, and the diagram MUST NOT crash the application.

#### Scenario: Parser error shows line/column
- **WHEN** the user types invalid DSL (e.g., missing closing `}`)
- **THEN** the UI shows an error message with line and column information

### Requirement: Error UX preserves usability during editing
On invalid DSL, the system SHALL keep rendering the last known valid diagram (if available) while showing current diagnostics. If no valid diagram exists yet, the system SHALL show an empty diagram area with diagnostics.

#### Scenario: Temporary syntax error does not clear the last valid diagram
- **WHEN** the user introduces a temporary syntax error during editing
- **THEN** the last valid diagram remains visible and diagnostics are shown

### Requirement: Input is treated as data and must be safe to render
The system MUST treat user-provided DSL strictly as data. Rendering MUST prevent script execution and mitigate XSS risks (e.g., by escaping text content rendered into SVG/HTML).

#### Scenario: Malicious text is rendered safely
- **WHEN** a field name contains characters that could be interpreted as markup
- **THEN** the diagram renders it as plain text and does not execute scripts

### Requirement: Node visual representation
Nodes SHALL be rendered as rectangles with rounded corners. Each node SHALL show:
- A header containing the node name (bold)
- A list of fields (including nested fields)

Default style guidelines:
- Background: white or light gray
- Border: 1–2px solid `#ccc`
- Padding: 12–16px

#### Scenario: Rendering a node with fields
- **WHEN** the diagram contains a node with a set of fields
- **THEN** the renderer displays a rounded rectangle with a header and a field list

### Requirement: Field visual representation
Fields SHALL be rendered in the format `fieldName: Type`. Nested fields SHALL be indented visually. Fields SHALL be interactive targets and SHALL display a hover affordance:
- Hover background (e.g., light blue)
- Cursor: pointer

Default spacing guideline between fields: 4–6px.

#### Scenario: Hovering a field provides a visual affordance
- **WHEN** the user hovers a field in the diagram
- **THEN** the field displays a hover style indicating interactivity

### Requirement: Connection rendering and default aggregation
Connections SHALL be rendered as directed edges.

Default “calm” state style guidelines:
- Color: `#ddd`
- Stroke width: 2px
- Curve: straight or smoothly bent (e.g., Bezier)

Active (highlighted) style guidelines:
- Color: `#4CAF50` or `#2196F3`
- Stroke width: 3–4px
- Smooth transition: ~0.2s

To avoid visual overload, the default view MUST aggregate (bundle) multiple field-level connections between the same pair of nodes into a single node-to-node edge in the calm state. When a specific field is hovered/selected, the system SHALL highlight the relevant bundled edge(s) and the participating fields.

#### Scenario: Multiple field connections are bundled in calm state
- **WHEN** there are many field-level connections from node A to node B
- **THEN** the calm view renders a single thin gray edge from A to B

### Requirement: Optional debug mode for 1:1 connections
The system SHALL provide a debug mode that, when enabled, displays all field-level connections 1:1 instead of bundled node-to-node edges. The default state SHALL be disabled.

#### Scenario: Enabling debug mode shows individual connections
- **WHEN** debug mode is enabled
- **THEN** the renderer shows individual field-to-field connections (1:1)

### Requirement: Automatic layout (left-to-right layered)
The system SHALL compute an automatic layout using a layered/hierarchical approach with a left-to-right flow direction.

Default spacing guidelines:
- Horizontal spacing between nodes: 80–120px
- Vertical spacing between nodes: 40–60px

#### Scenario: Layout places nodes left-to-right
- **WHEN** a diagram is rendered
- **THEN** nodes are positioned in layers from left to right to reflect flow direction

### Requirement: Field path highlighting (direct connections)
When the user hovers or selects a field, the system SHALL:
1. Highlight the field
2. Highlight all connections where the field is a source or a target
3. Highlight the corresponding connected fields
4. Dim unrelated elements (e.g., via reduced opacity) to improve readability

Selection behavior:
- Click (or tap) pins the highlight
- Clicking (or tapping) the same field again clears the selection

#### Scenario: Hovering highlights direct neighbors and dims unrelated elements
- **WHEN** the user hovers a field with direct connections
- **THEN** only the related path elements are emphasized and others are dimmed

### Requirement: Optional full-path and reverse-path highlighting modes
The system SHALL support a default “simple” highlight mode that includes only direct (one-step) connections.

Optionally, the system MAY support:
- Forward full-path traversal: highlight the entire downstream chain following connection direction
- Reverse traversal: highlight upstream inputs in a distinct style

#### Scenario: Simple mode highlights only one step
- **WHEN** simple mode is active and a field is highlighted
- **THEN** only direct connections (one hop) are highlighted

### Requirement: View controls (zoom, pan, reset) including touch behavior
The diagram view SHALL support:
- Zoom via mouse wheel and touchpad pinch
- Panning by dragging the background
- A “Reset view” control to return to the initial view

On touch devices:
- Tapping a field pins the highlight
- Tapping empty space clears the highlight

#### Scenario: User can zoom, pan, and reset the view
- **WHEN** the user zooms or pans the diagram
- **THEN** the view updates accordingly and can be restored via “Reset view”

### Requirement: Local persistence of DSL
The system SHALL autosave the DSL text to `localStorage` with a debounce of approximately 300–500ms. The UI SHALL provide a “Reset to example” action that restores a demo diagram.

#### Scenario: DSL is restored after reload
- **WHEN** the user reloads the page after editing the DSL
- **THEN** the editor restores the most recently autosaved DSL from `localStorage`

### Requirement: Import and export DSL files
The system SHALL allow:
- Downloading the current DSL as a file (e.g., `.txt` or `.dfd`)
- Uploading DSL from a local file

#### Scenario: User downloads and re-uploads a DSL file
- **WHEN** the user downloads the DSL and later uploads it back
- **THEN** the editor content is replaced with the uploaded DSL and the diagram updates

### Requirement: Diagram export
The system SHALL support exporting the diagram as SVG. The system MAY support exporting as PNG (optional, post-v1.0).

#### Scenario: Exporting to SVG
- **WHEN** the user triggers “Export SVG”
- **THEN** the system downloads an SVG representation of the current diagram

### Requirement: Shareable links via URL hash
The system SHALL support sharing a diagram via a URL containing the DSL encoded (and compressed) in the URL hash (e.g., `#...`). When opening such a link, the application SHALL restore the DSL and render the diagram.

#### Scenario: Opening a shared link restores the diagram
- **WHEN** a user opens a URL with an encoded DSL hash
- **THEN** the editor and diagram are restored to the shared state

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

### Requirement: Core data model shape
The system SHALL represent diagrams using a model equivalent to the following TypeScript shapes:

```typescript
interface Node {
  id: string;
  label?: string;
  fields: Field[];
}

interface Field {
  name: string;
  type?: string;
  path: string; // full path including nesting
  children?: Field[];
}

interface Connection {
  source: { nodeId: string; fieldPath: string };
  target: { nodeId: string; fieldPath: string };
}

interface Diagram {
  nodes: Node[];
  connections: Connection[];
}
```

#### Scenario: Nested field has a full dot-path
- **WHEN** a nested field is declared (e.g., `body { username: String }`)
- **THEN** the normalized model stores the nested field with a full path (e.g., `body.username`)

### Requirement: Recommended technology stack
The initial implementation SHALL use a minimal, frameworkless frontend stack:
- TypeScript
- Vite (build tooling)
- Code editor: CodeMirror 6 (or Monaco Editor as an alternative)
- Parser generator: `peggy` (or an equivalent PEG parser generator)
- Layout: Dagre (or Elk.js)
- Zoom/Pan: `panzoom` (or `d3-zoom`)
- Rendering: native SVG (Canvas/Konva optional if needed)
- Utility libraries: Lodash (optional)

#### Scenario: Project can be built and run as a static site
- **WHEN** the project is built
- **THEN** it produces static assets that can be hosted on any static file server

### Requirement: Minimum viable product scope
The MVP MUST include:
1. A text editor for DSL input
2. Parsing and rendering of nodes and fields
3. Rendering of connections (thin gray lines)
4. Hover on a field highlights its related connections

#### Scenario: MVP supports basic authoring and inspection
- **WHEN** a user enters a valid DSL diagram
- **THEN** the diagram renders and field hover highlights related connections

