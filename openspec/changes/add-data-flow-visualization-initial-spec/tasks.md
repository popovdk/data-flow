## 1. Spec lifecycle
- [x] 1.1 Establish OpenSpec as the single source of truth for requirements
- [ ] 1.2 (Optional) Add a short `README.md` with links to OpenSpec entry points (`openspec/specs`, `openspec/changes`)

## 2. Project bootstrap (static web app)
- [ ] 2.1 Scaffold a Vite + TypeScript project
- [ ] 2.2 Add an application shell with two panes: DSL editor (left) + diagram canvas (right)
- [ ] 2.3 Implement live preview with debounced parsing/validation/rendering

## 3. DSL: parsing + diagnostics
- [ ] 3.1 Implement a PEG-based parser (prefer `peggy`) for the DSL defined in the spec
- [ ] 3.2 Produce syntax diagnostics with line/column positions

## 4. Semantic model: validation + normalization
- [ ] 4.1 Validate node and field uniqueness constraints
- [ ] 4.2 Validate connections reference existing nodes and field paths
- [ ] 4.3 Build a normalized diagram model and a field-level graph for traversal (cycle-safe)
- [ ] 4.4 (Optional) Produce warnings (unused fields, nodes with no in/out, duplicate connections)

## 5. Layout + rendering
- [ ] 5.1 Integrate a layered left-to-right layout engine (Dagre or Elk.js)
- [ ] 5.2 Render nodes, fields, and connections in SVG
- [ ] 5.3 Implement connection bundling (node-to-node aggregation) as the default “calm” view
- [ ] 5.4 (Optional) Add a debug mode to show real 1:1 field connections

## 6. Interaction
- [ ] 6.1 Implement hover/tap behavior on fields to highlight related paths and dim unrelated elements
- [ ] 6.2 Implement click/tap-to-pin selection and click-again to clear
- [ ] 6.3 Implement zoom (wheel/pinch), pan (drag), and “Reset view”
- [ ] 6.4 (Optional) Implement “full path” traversal mode (forward, cycle-safe) and (optional) reverse traversal styling

## 7. Persistence, import/export, sharing
- [ ] 7.1 Autosave DSL to `localStorage` with debounce (300–500ms)
- [ ] 7.2 Add “Reset to example”
- [ ] 7.3 Implement “Download DSL” and “Upload DSL”
- [ ] 7.4 Implement diagram export to SVG (required) and PNG (optional, post-v1.0)
- [ ] 7.5 Implement URL hash sharing with compression/encoding and restoration on load

## 8. Security and hardening
- [ ] 8.1 Ensure user input is treated strictly as data (no execution); prevent XSS in rendering

