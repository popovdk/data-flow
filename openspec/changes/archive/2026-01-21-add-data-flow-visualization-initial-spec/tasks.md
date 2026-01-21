## 1. Spec lifecycle
- [x] 1.1 Establish OpenSpec as the single source of truth for requirements
- [x] 1.2 (Optional) Add a short `README.md` with links to OpenSpec entry points (`openspec/specs`, `openspec/changes`)

## 2. Project bootstrap (static web app)
- [x] 2.1 Scaffold a Vite + TypeScript project
- [x] 2.2 Add an application shell with two panes: DSL editor (left) + diagram canvas (right)
- [x] 2.3 Implement live preview with debounced parsing/validation/rendering

## 3. DSL: parsing + diagnostics
- [x] 3.1 Implement a PEG-based parser (prefer `peggy`) for the DSL defined in the spec
- [x] 3.2 Produce syntax diagnostics with line/column positions

## 4. Semantic model: validation + normalization
- [x] 4.1 Validate node and field uniqueness constraints
- [x] 4.2 Validate connections reference existing nodes and field paths
- [x] 4.3 Build a normalized diagram model and a field-level graph for traversal (cycle-safe)
- [x] 4.4 (Optional) Produce warnings (unused fields, nodes with no in/out, duplicate connections)

## 5. Layout + rendering
- [x] 5.1 Integrate a layered left-to-right layout engine (Dagre or Elk.js)
- [x] 5.2 Render nodes, fields, and connections in SVG
- [x] 5.3 Implement connection bundling (node-to-node aggregation) as the default “calm” view
- [x] 5.4 (Optional) Add a debug mode to show real 1:1 field connections

## 6. Interaction
- [x] 6.1 Implement hover/tap behavior on fields to highlight related paths and dim unrelated elements
- [x] 6.2 Implement click/tap-to-pin selection and click-again to clear
- [x] 6.3 Implement zoom (wheel/pinch), pan (drag), and “Reset view”
- [x] 6.4 (Optional) Implement “full path” traversal mode (forward, cycle-safe) and (optional) reverse traversal styling

## 7. Persistence, import/export, sharing
- [x] 7.1 Autosave DSL to `localStorage` with debounce (300–500ms)
- [x] 7.2 Add “Reset to example”
- [x] 7.3 Implement “Download DSL” and “Upload DSL”
- [x] 7.4 Implement diagram export to SVG (required) and PNG (optional, post-v1.0)
- [x] 7.5 Implement URL hash sharing with compression/encoding and restoration on load

## 8. Security and hardening
- [x] 8.1 Ensure user input is treated strictly as data (no execution); prevent XSS in rendering

