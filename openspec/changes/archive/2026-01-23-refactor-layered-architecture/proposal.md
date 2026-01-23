# Change: Refactor into layered architecture

## Why
The current `src/diagram` module mixes DSL parsing, validation, graph/layout logic, and DOM-specific rendering. This increases coupling and makes reuse in non-browser contexts (for example, CLI validation or server-side export) harder than necessary.

## What Changes
- Introduce explicit layers: DSL core, Diagram core, and Web UI, each with one-way dependencies.
- Move files into layer-focused folders (keeping diagram core in `src/diagram`) and add explicit public entry points for each layer.
- Keep behavior and UI output unchanged; this is a structural refactor only.

## Impact
- Affected specs: `data-flow-visualization` (Architecture modules requirement).
- Affected code: `src/diagram/*`, `src/app/*`, `src/editor/*`, `src/shared/*`, and architecture documentation.
