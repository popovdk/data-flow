# Change: Prevent implicit highlight jumps between unrelated fields

## Why
Hover highlighting currently traverses across nodes that have a single opposite-side field, which can surface fields that are not explicitly connected to the hovered field. This makes the diagram harder to read and can imply data flows that do not exist.

## What Changes
- Restrict full-path highlight traversal to explicit field-to-field connections.
- Avoid implicit cross-field traversal through nodes unless the connection is explicitly defined in the DSL.
- Clarify full-path traversal behavior in the specification.

## Impact
- Affected specs: data-flow-visualization
- Affected code: `src/diagram/graph.ts`
