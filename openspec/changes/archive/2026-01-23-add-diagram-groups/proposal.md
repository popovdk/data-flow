# Change: Add diagram groups for ordered layout

## Why
Large diagrams become difficult to read when related nodes are scattered. Grouping nodes into labeled regions and ordering those regions improves visual scanning and comprehension.

## What Changes
- Add a `group` DSL block with optional labels that can contain node declarations.
- Render group boundaries with labels and place grouped nodes vertically.
- Arrange groups horizontally in the order they are declared, with ungrouped nodes in an implicit trailing column.
- Extend parsing, validation, data model, layout, and rendering to support groups.

## Impact
- Affected specs: data-flow-visualization
- Affected code: `src/diagram/parser.ts`, `src/diagram/validator.ts`, `src/diagram/layout.ts`, `src/diagram/renderer.ts`, `src/diagram/types.ts`, `src/app/examples.ts`
