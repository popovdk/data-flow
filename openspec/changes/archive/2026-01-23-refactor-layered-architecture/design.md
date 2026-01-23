## Context
The codebase currently colocates parsing/validation, graph/layout logic, and DOM rendering under `src/diagram/`. The application is browser-only today, but core logic needs to be reusable in non-browser contexts without pulling DOM or pan/zoom dependencies.

## Goals / Non-Goals
- Goals:
  - Establish explicit layer boundaries with one-way dependencies.
  - Preserve existing behavior and UI output.
  - Keep DSL core and diagram core platform-agnostic (no DOM globals).
  - Keep the project as a single repository and package.
- Non-Goals:
  - Adding new DSL features (for example, node grouping/blocks).
  - Changing rendering styles or layout algorithms.
  - Introducing a monorepo or separate npm packages.

## Decisions
- Create three top-level layer folders under `src/`:
  - `dsl/` for parser, AST/diagnostics, and validation.
  - `diagram/` for graph/bundling/highlighting/layout and pipeline helpers.
  - `render/` for SVG renderer and interaction controller (DOM + panzoom).
- Keep normalized diagram model types in DSL core so validation is self-contained and diagram core consumes these types without circular dependencies.
- Provide `index.ts` entry points per layer to make imports explicit and stable.
- Keep `app/`, `editor/`, and `shared/` as the imperative shell that composes the layers.

## Risks / Trade-offs
- File moves can introduce path/import errors. Mitigation: move layer-by-layer and typecheck after each step.
- Type ownership may be unclear across layers. Mitigation: centralize model types in DSL core and re-export from its entry point.
- Vite build or tooling may rely on old paths. Mitigation: update imports and verify with `npm run build`.

## Migration Plan
1. Add new layer folders and barrel exports with no behavior change.
2. Move parser/validator/types into `src/dsl` and update imports.
3. Move graph/bundling/highlight/layout and `DiagramBuilder` into `src/diagram`.
4. Move renderer and diagram controller into `src/render`.
5. Update app/editor/shared imports to use new entry points.
6. Update documentation that references architecture and module locations.
7. Verify by running the build.

## Open Questions
- None for this change. Future feature requests (for example, node grouping) should be handled as separate proposals.
