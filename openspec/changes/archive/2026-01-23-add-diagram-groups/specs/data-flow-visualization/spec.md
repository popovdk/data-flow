## ADDED Requirements
### Requirement: DSL group declarations
The DSL SHALL support group declarations using the following structure:
- `group <GroupId> { ... }`
- Optional modifiers in square brackets, currently supporting `label="..."`:
  - `group <GroupId> [label="Custom Label"] { ... }`

Group identifiers are case-sensitive and MUST be unique within a document. Group bodies SHALL contain node declarations only. Node declarations MAY appear either at the top level or inside a group.

#### Scenario: Declaring a group with a labeled node
- **WHEN** the DSL contains `group Backend [label="Backend API"] { node Api [label="API"] { id: String } }`
- **THEN** the model includes a group with id `Backend`, label `Backend API`, and a node `Api` that belongs to that group

### Requirement: Group visual representation
Groups SHALL be rendered as rectangular boundaries that enclose their member nodes. Each group SHALL display a label (the group label or id) near the top-left of the boundary.

Default style guidelines:
- Border: 1–2px solid `#bbb`
- Corner radius: 8–12px
- Padding around contained nodes: 20–30px

#### Scenario: Rendering a group boundary and label
- **WHEN** a group with a label is present in the model
- **THEN** the diagram shows an outlined region with the label and the group's nodes inside

## MODIFIED Requirements
### Requirement: Validation of uniqueness constraints
The validator SHALL enforce:
- Node ids are unique within a document.
- Group ids are unique within a document.
- Sibling field names at the same nesting level within a node are unique.

#### Scenario: Duplicate node id is rejected
- **WHEN** the DSL defines `node X { ... }` more than once
- **THEN** validation returns a semantic error indicating a duplicate node id

#### Scenario: Duplicate group id is rejected
- **WHEN** the DSL defines `group Backend { ... }` more than once
- **THEN** validation returns a semantic error indicating a duplicate group id

### Requirement: Automatic layout (left-to-right layered)
The system SHALL compute an automatic layout using a layered/hierarchical approach with a left-to-right flow direction.
When groups are declared, the layout SHALL arrange groups as columns from left to right in the order they appear in the DSL. Nodes within a group SHALL be stacked vertically in declaration order with consistent vertical spacing. Nodes declared outside any group SHALL be placed in an implicit "Ungrouped" column after all explicit groups.

Default spacing guidelines:
- Horizontal spacing between groups/columns: 80–120px
- Vertical spacing between nodes: 40–60px

#### Scenario: Layout places groups left-to-right
- **WHEN** the DSL declares multiple groups
- **THEN** the diagram places the groups in the declared order from left to right and stacks their nodes vertically

#### Scenario: Layout places nodes left-to-right when no groups exist
- **WHEN** a diagram contains no groups
- **THEN** nodes are positioned in layers from left to right to reflect flow direction

### Requirement: Core data model shape
The system SHALL represent diagrams using a model equivalent to the following TypeScript shapes:

```typescript
interface Group {
  id: string;
  label?: string;
  nodeIds: string[];
}

interface Node {
  id: string;
  label?: string;
  fields: Field[];
}

interface Field {
  name: string;
  type?: string;
  path: string; // full path including nesting
  children?: Field[];
}

interface Connection {
  source: { nodeId: string; fieldPath: string };
  target: { nodeId: string; fieldPath: string };
}

interface Diagram {
  nodes: Node[];
  groups?: Group[];
  connections: Connection[];
}
```

#### Scenario: Nested field has a full dot-path
- **WHEN** a nested field is declared (e.g., `body { username: String }`)
- **THEN** the normalized model stores the nested field with a full path (e.g., `body.username`)

#### Scenario: Group preserves declaration order
- **WHEN** the DSL declares `group A { node X { } node Y { } } group B { node Z { } }`
- **THEN** the model stores groups in the order `A`, `B` and the `nodeIds` for group `A` are `[X, Y]`
