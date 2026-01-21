# Project Context: Data Flow Visualization Tool

This document defines coding conventions and project rules for AI assistants and code-generation agents. It is intended to be read before implementing changes.

## Authoritative requirements (source of truth)
- During the proposal stage, requirements live in `openspec/changes/add-data-flow-visualization-initial-spec/specs/data-flow-visualization/spec.md`.
- After approval and archiving, requirements will live in `openspec/specs/data-flow-visualization/spec.md`.
- Do not implement features that are not covered by the OpenSpec requirements unless explicitly requested.

## Language policy (hard rule)
- All documentation, specifications, and code comments MUST be written in English, even if prompts/discussions are written in Russian.
- UI strings MAY be localized later, but code identifiers and comments stay English.

## Purpose
Build a client-only static web application that visualizes data-flow diagrams described by a small declarative DSL. The DSL text is the source of truth; parsing/validation/layout/rendering run entirely in the browser.

## Tech stack (target)
- Language: TypeScript (ESM)
- Build tooling: Vite
- Rendering: native SVG (Canvas is optional later)
- DSL parsing: PEG-based parser generator (`peggy` preferred)
- Layout: Dagre (preferred) or Elk.js
- Editor: CodeMirror 6 (preferred) or Monaco Editor
- Zoom/Pan: `panzoom` (preferred) or `d3-zoom`
- Utilities: Lodash (optional)

## Project conventions

### Code style (TypeScript)
- Use `strict: true`. Avoid `any`; prefer `unknown` + narrowing.
- Prefer **named exports**. Avoid default exports except for the app entry point if needed.
- Use `PascalCase` for types/classes, `camelCase` for values/functions, `SCREAMING_SNAKE_CASE` for constants.
- Use consistent file naming (recommended: `kebab-case.ts`).
- Keep functions small and single-purpose; prefer pure functions in the “core” modules (see architecture).
- Prefer `type` for unions/intersections and `interface` for object shapes that are expected to be extended.
- Use explicit return types for exported functions.

### Formatting
- Keep line length readable (recommended: ~100).
- Use one statement per line.
- Prefer early returns over deeply nested branching.

### Error handling and diagnostics (no exceptions in UI flow)
- The UI should not rely on exceptions for control flow.
- Parsing/validation results should be returned as explicit values:
  - `model` (or `null`) + `diagnostics: Diagnostic[]`
- Diagnostics should be stable and machine-friendly (agents will parse them):
  - `kind`: `"error"` | `"warning"`
  - `code`: short stable identifier (e.g., `DSL_SYNTAX_UNCLOSED_BRACE`)
  - `message`: human-readable English sentence
  - `loc`: `{ line: number; column: number }` (1-based)
- Prefer accumulating multiple diagnostics over failing fast (especially for validation).

### Security (XSS hard rules)
- Treat DSL input strictly as data.
- Do NOT use `innerHTML` for user-provided strings.
- For SVG text, set `textContent` and/or create `Text` nodes.
- Never evaluate user input (no `eval`, no dynamic `Function`, no script URLs).

## Architecture patterns (agents: follow these boundaries)
Prefer **Functional Core / Imperative Shell**:
- **Core (pure-ish, testable, no DOM access)**:
  - `dsl/` parser and token/AST utilities
  - `validate/` semantic validation
  - `graph/` field graph, traversal, bundling
  - `layout/` layout adapter that transforms a model to positioned nodes/edges
  - `model/` shared types
- **Shell (DOM/event-driven)**:
  - `ui/` editor integration (CodeMirror)
  - `render/` SVG rendering, export
  - `interaction/` hover/selection state, zoom/pan integration
  - `persistence/` localStorage, file import/export, URL hash sharing
  - `app/` composition, state wiring, debouncing

### Suggested directory structure
This is a guideline for consistency; adjust only with a clear reason.
```
src/
  app/
  dsl/
  validate/
  model/
  graph/
  layout/
  render/
  interaction/
  persistence/
  ui/
```

### Data model naming (glossary)
- **Node**: a diagram box with fields
- **Field**: a named datum, possibly nested
- **FieldPath**: dot path to a (nested) field, e.g., `body.username`
- **Connection**: directed edge `sourceField -> targetField`
- **Bundle edge**: node-to-node aggregated edge shown in calm state

## UI/UX rules (from product constraints)
- Keep “calm” view visually minimal: thin, gray bundled edges by default.
- On hover/selection, highlight the relevant path and dim unrelated elements (opacity).
- Keep the last valid diagram visible when the DSL temporarily becomes invalid.

## Performance guidelines
- Debounce parsing/validation/render updates (target 300–500ms).
- Prefer incremental DOM updates where easy; avoid full re-render if not necessary.
- Use event delegation where possible (avoid per-field listeners for large diagrams).

## Testing strategy (recommended for this stack)
- Unit tests (fast): parser, validator, graph traversal (cycle-safe), bundling logic.
- Use deterministic fixtures and snapshot-friendly outputs for AST/model where appropriate.
- E2E tests (optional): basic editor → render → hover highlight flow in a browser runner.

## Git workflow (recommended)
- Use feature branches.
- Keep changes small; prefer one capability per PR.
- Commit messages: imperative mood (e.g., `add dsl parser diagnostics`).

## Important constraints
- Client-only: no backend required for core functionality.
- SVG export is required; PNG export is optional later.
- Cycles in the field graph are allowed; traversal must be cycle-safe.

## External dependencies
- None required at runtime beyond the chosen libraries listed in “Tech stack”.
