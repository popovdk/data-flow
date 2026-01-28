## Why

The codebase uses type assertions (`as Type`) and non-null assertions (`!`) in places where safer typing patterns could be applied. This reduces type safety and may lead to runtime errors that TypeScript could prevent at compile time.

## What Changes

- Replace type assertions with type guards and proper type narrowing
- Create typed wrappers for external libraries (dagre) with untyped APIs
- Eliminate non-null assertions through defensive programming and discriminated unions
- Improve error handling using Result pattern where appropriate

### Specific Improvements:

**Type assertions for libraries (dagre):**
- `layout.ts`: create typed wrapper for dagre graph API
- Replace `graph.node(id) as { x, y }` with safe accessor

**Redundant type assertions after null-checks:**
- `renderer.ts`: use type narrowing instead of `as DiagramModel` after null check

**Error type assertions:**
- `parser.ts`: create type guard for PEG.js errors instead of `error as { message?, location? }`

**DOM type assertions:**
- `exporters.ts`, `toolbarController.ts`: create type-safe DOM utilities
- Replace `cloneNode() as SVGSVGElement` on generic helper

**Non-null assertions:**
- ~15 places with `map.get(key)!` — replace with safe access patterns

## Capabilities

### New Capabilities

No new capabilities — this is an implementation refactoring without changing functional requirements.

### Modified Capabilities

No spec changes — application behavior remains unchanged.

## Impact

**Affected files:**
- `src/diagram/layout.ts` — dagre type wrappers
- `src/render/renderer.ts` — type narrowing improvements
- `src/dsl/parser.ts` — error type guards
- `src/shared/exporters.ts` — DOM type utilities
- `src/app/toolbarController.ts` — event target typing
- `src/app/dom.ts` — DOM query utilities
- `src/diagram/graph.ts` — Map access patterns

**Risks:**
- Minimal — changes do not affect logic, only typing
- All changes are verifiable by TypeScript compiler

**Dependencies:**
- May require `@types/dagre` or custom type definitions
