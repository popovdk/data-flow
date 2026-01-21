## Context
We are building a static, client-only web application to visualize data flow diagrams described by a simple declarative DSL (similar in spirit to PlantUML online, but fully in-browser). The DSL text is the source of truth; the diagram is derived from it.

The spec includes:
- DSL parsing and validation
- Layout calculation (layered/hierarchical, left-to-right)
- SVG rendering with minimal visual noise (bundled connections by default)
- Interactive path highlighting when hovering/selecting a field
- Local persistence, import/export, and shareable links

## Goals / Non-Goals
- Goals:
  - Fast authoring of data-flow diagrams via a minimal DSL.
  - Field-level traceability: hover/select any field to see its path through the diagram.
  - Client-only architecture (no backend dependency).
  - Calm visualization by default via connection aggregation.
- Non-Goals:
  - A full general-purpose UML editor.
  - Collaborative editing (multi-user real-time).
  - Server-side storage (v1).

## Decisions
- Decision: **Client-only static site**
  - Why: Simplifies deployment, aligns with the requirement that all logic runs in the browser.
- Decision: **SVG-first rendering**
  - Why: Natural for diagrams, easy hit-testing, exporting to SVG is trivial. Canvas can be considered later if performance becomes a bottleneck.
- Decision: **PEG-based DSL parsing**
  - Why: The DSL is declarative and structured; PEG grammars are concise and maintainable. Prefer `peggy` (PEG.js successor), but allow alternatives if needed.
- Decision: **Layered layout via Dagre (or Elk.js alternative)**
  - Why: Directed data-flow fits hierarchical layout; Dagre is simple to integrate; Elk.js is a viable alternative.
- Decision: **Connection bundling (node-to-node) in calm state**
  - Why: Prevents “spider web” visuals; details appear only on hover/selection.
- Decision: **Cycle-safe traversal**
  - Why: Cycles are allowed; highlighting must not infinite-loop. Use visited sets and depth limits (if needed) for traversals.
- Decision: **Error strategy: keep last valid diagram + diagnostics**
  - Why: Better UX during editing; users can keep context while fixing syntax errors.

## Risks / Trade-offs
- Parser and diagnostics correctness vs speed:
  - Mitigation: debounce parsing; keep parser incremental-friendly in the future.
- Large diagrams may stress SVG performance:
  - Mitigation: bundling reduces edge count; optional debug mode to show 1:1 connections only when needed.

## Migration Plan
Not applicable (greenfield).

## Open Questions
- Whether to ship “full path” and “reverse path” highlighting in v1 or keep as optional toggles.
- How to best compress DSL for URL hash sharing (e.g., LZ-based compression + base64url).

