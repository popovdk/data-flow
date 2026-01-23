## Context
The current DSL supports nodes and connections but lacks a way to visually group related nodes. For large diagrams, a deterministic grouping and ordering mechanism is needed to improve readability.

## Goals / Non-Goals
- Goals:
  - Introduce `group` blocks to cluster nodes with a visible label and boundary.
  - Provide deterministic horizontal ordering of groups based on DSL order.
  - Preserve existing behavior when no groups are declared.
- Non-Goals:
  - Nested groups or collapsible groups.
  - Automatic grouping or semantic inference.
  - Custom per-group layout algorithms.

## Decisions
- DSL introduces `group <GroupId> [label="..."] { ... }` containing node declarations only.
- Group order is the order of appearance in the DSL.
- Nodes inside a group are stacked vertically in declaration order.
- Nodes declared outside any group are placed in an implicit "Ungrouped" column after explicit groups.
- Connections remain unchanged; layout uses group positions as input to edge routing.

## Risks / Trade-offs
- Grouped column layout may increase edge crossings compared to a purely graph-driven layout.
- Empty groups consume space even if they contain no nodes.

## Migration Plan
- None required. Existing DSL without groups continues to render with the current layout behavior.

## Open Questions
- None at this time.
