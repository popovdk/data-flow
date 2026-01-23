## 1. Implementation
- [x] 1.1 Add layer folders and `index.ts` entry points (`src/dsl`, `src/diagram`, `src/render`).
- [x] 1.2 Move DSL parser/validator and AST/diagnostic types into `src/dsl`; update imports.
- [x] 1.3 Move graph/bundling/highlight/layout and `DiagramBuilder` into `src/diagram`; ensure no DOM imports.
- [x] 1.4 Move renderer and diagram controller into `src/render`; keep DOM and panzoom usage here.
- [x] 1.5 Update `src/app`, `src/editor`, and `src/shared` imports to use the new layer entry points.
- [x] 1.6 Update architecture documentation (`README.md`, `openspec/project.md`) to reflect the new structure.
- [x] 1.7 Run `npm run build` and fix any type errors.
