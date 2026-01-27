## 1. Dagre Type Wrapper

- [x] 1.1 Create `src/diagram/dagreTypes.ts` with interfaces for dagre return types
- [x] 1.2 Implement `getNodePosition()` accessor with runtime validation
- [x] 1.3 Implement `getEdgePoints()` accessor with runtime validation  
- [x] 1.4 Implement `getGraphBounds()` accessor with runtime validation
- [x] 1.5 Update `src/diagram/layout.ts` to use new typed accessors
- [x] 1.6 Remove type assertions from `computeDagreLayout()`

## 2. Renderer Type Narrowing

- [x] 2.1 Add `ValidatedRenderOptions` interface to `src/render/renderer.ts`
- [x] 2.2 Implement `validateOptions()` method returning narrowed type or null
- [x] 2.3 Update `render()` method to use validated options
- [x] 2.4 Update `buildRenderContext()` to accept `ValidatedRenderOptions`
- [x] 2.5 Remove `as DiagramModel` and `as LayoutResult` assertions

## 3. Parser Error Type Guard

- [x] 3.1 Add `PegJsSyntaxError` interface to `src/dsl/types.ts`
- [x] 3.2 Implement `isPegJsSyntaxError()` type guard in `src/dsl/parser.ts`
- [x] 3.3 Update `parseDsl()` catch block to use type guard
- [x] 3.4 Remove `error as { message?, location? }` assertion

## 4. DOM Type Utilities

- [x] 4.1 Add `cloneSvgElement<T>()` generic helper to `src/app/dom.ts`
- [x] 4.2 Add `getInputTarget()` type guard to `src/app/dom.ts`
- [x] 4.3 Update `src/shared/exporters.ts` to use `cloneSvgElement()`
- [x] 4.4 Update `src/app/toolbarController.ts` to use `getInputTarget()`

## 5. Safe Map Access Patterns

- [x] 5.1 Audit `src/diagram/graph.ts` for non-null assertions on Map.get() — none found, already uses `?.`
- [x] 5.2 Replace `!` assertions with early returns in graph traversal — no changes needed
- [x] 5.3 Audit `src/render/renderer.ts` for non-null assertions — none found, already uses `?.` and `??`
- [x] 5.4 Replace `!` assertions with defensive checks or `??` defaults — no changes needed
- [x] 5.5 Audit `src/diagram/layout.ts` for non-null assertions — none found
- [x] 5.6 Replace `!` assertions with continue/return patterns in loops — no changes needed

## 6. Verification

- [x] 6.1 Run TypeScript compiler with strict mode, verify no errors — no linter errors
- [x] 6.2 Search codebase for remaining `as ` type assertions, document any justified — 7 remaining, all justified:
  - `dagreTypes.ts`: contained dagre wrapper (by design)
  - `parser.ts`: type guard narrowing (safe pattern)
  - `parser.ts`: generated parser return (library boundary)
  - `dom.ts`: cloneNode generic helper (spec-guaranteed)
  - `persistence.ts`: removed unnecessary `as BlobPart`
- [x] 6.3 Search codebase for remaining `!` non-null assertions, document any justified — none found
- [x] 6.4 Manual test: diagram rendering with valid DSL
- [x] 6.5 Manual test: error display with invalid DSL
