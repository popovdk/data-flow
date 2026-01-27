# TypeScript Type Safety Standards

This spec defines implementation standards for TypeScript type safety. These are non-functional requirements that do not change user-facing behavior.

## ADDED Requirements

### Requirement: No explicit any types
The codebase SHALL NOT contain explicit `any` type annotations. All types MUST be either explicitly typed or inferred by TypeScript.

#### Scenario: Compiler enforces no any
- **WHEN** code contains `any` type annotation
- **THEN** TypeScript compilation SHALL fail or produce a warning

### Requirement: Minimize type assertions
Type assertions (`as Type`) SHALL only be used when:
1. Wrapping external library APIs with incomplete types
2. DOM operations where runtime type is guaranteed by specification

#### Scenario: External library wrapper uses assertion
- **WHEN** calling dagre API that returns untyped data
- **THEN** type assertion SHALL be contained within a typed wrapper function with runtime validation

#### Scenario: DOM clone operation
- **WHEN** cloning an SVG element with `cloneNode(true)`
- **THEN** type assertion to same element type is acceptable (spec-guaranteed behavior)

### Requirement: No unsafe non-null assertions
Non-null assertions (`!`) SHALL NOT be used on Map/Set `.get()` results. Code MUST either:
1. Check for undefined and handle the missing case
2. Use nullish coalescing (`??`) with appropriate default

#### Scenario: Map lookup in critical path
- **WHEN** looking up a value from Map in layout/render code
- **THEN** code SHALL check for undefined and return early or skip if missing

#### Scenario: Map lookup for display value
- **WHEN** looking up a label or display string from Map
- **THEN** code MAY use nullish coalescing with sensible default (e.g., node ID as fallback label)

### Requirement: Type-safe error handling
Caught exceptions SHALL use type guards to narrow `unknown` to expected error shapes before accessing properties.

#### Scenario: Parser catches syntax error
- **WHEN** PEG.js parser throws an error
- **THEN** code SHALL use type guard to verify error has `message` and `location` properties before accessing them
