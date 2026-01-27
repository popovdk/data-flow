## Context

The codebase already uses `strict: true` and has no explicit `any` types, which is excellent. However, several patterns reduce type safety:

1. **Type assertions for external libraries** — dagre returns untyped objects, forcing `as` casts
2. **Redundant assertions after null checks** — `if (!x) return; ... x as T` instead of narrowing
3. **Unsafe error handling** — catching `unknown` and casting to assumed shape
4. **DOM type assertions** — `cloneNode()`, `event.target` require casts
5. **Non-null assertions** — `map.get(key)!` assumes key exists

Current state: ~15 type assertions (`as`), ~15 non-null assertions (`!`).

## Goals / Non-Goals

**Goals:**
- Eliminate unsafe type assertions where type guards can be used
- Create typed wrappers for dagre API to centralize assertions
- Replace non-null assertions with safe access patterns
- Improve error handling with proper type guards
- Maintain zero `any` types

**Non-Goals:**
- Rewriting dagre integration (just wrapping it)
- Adding runtime validation beyond what exists
- Changing public API signatures
- Performance optimizations

## Decisions

### Decision 1: Typed dagre wrapper

**Problem:** `graph.node()`, `graph.edge()`, `graph.graph()` return untyped values.

**Solution:** Create `src/diagram/dagreTypes.ts` with typed accessor functions.

```typescript
// Type definitions for dagre graph results
interface DagreNodeData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DagreEdgeData {
  points?: Array<{ x: number; y: number }>;
}

interface DagreGraphData {
  width?: number;
  height?: number;
}

// Safe accessors that return T | undefined
function getNodePosition(graph: dagre.graphlib.Graph, nodeId: string): DagreNodeData | undefined {
  const data = graph.node(nodeId);
  if (data && typeof data.x === 'number' && typeof data.y === 'number') {
    return data as DagreNodeData;
  }
  return undefined;
}
```

**Alternatives considered:**
- Install `@types/dagre` — rejected: types are incomplete and unmaintained
- Use `unknown` + manual narrowing everywhere — rejected: repetitive, error-prone

**Rationale:** Centralizes the one place where we trust dagre's runtime behavior. Type assertions are contained in one module with runtime checks.

### Decision 2: Type narrowing in renderer

**Problem:** `renderer.ts` checks `if (!options.diagram) return` then uses `options.diagram as DiagramModel`.

**Solution:** Extract validated options into a separate interface and narrow once.

```typescript
interface ValidatedRenderOptions {
  diagram: DiagramModel;  // non-null after validation
  layout: LayoutResult;   // non-null after validation
  bundles: BundledEdge[];
  highlight: HighlightState;
  debugConnections: boolean;
}

private validateOptions(options: RenderOptions): ValidatedRenderOptions | null {
  if (!options.diagram || !options.layout) {
    return null;
  }
  return {
    diagram: options.diagram,
    layout: options.layout,
    bundles: options.bundles,
    highlight: options.highlight,
    debugConnections: options.debugConnections,
  };
}
```

**Alternatives considered:**
- Use assertion functions (`asserts options is ValidatedRenderOptions`) — acceptable but less explicit
- Keep current pattern — rejected: unnecessary casts

**Rationale:** TypeScript narrows the type through the return value, eliminating downstream casts.

### Decision 3: PEG.js error type guard

**Problem:** `parser.ts` catches `unknown` and casts to `{ message?, location? }`.

**Solution:** Create a type guard for PEG.js syntax errors.

```typescript
interface PegJsSyntaxError {
  message: string;
  location: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}

function isPegJsSyntaxError(error: unknown): error is PegJsSyntaxError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    'location' in error &&
    typeof (error as Record<string, unknown>).location === 'object'
  );
}
```

**Alternatives considered:**
- Import error type from peggy — rejected: generated parser doesn't export it reliably
- Keep current pattern — rejected: unsafe assumption about error shape

**Rationale:** Runtime check ensures we only access properties that exist.

### Decision 4: Safe Map access utility

**Problem:** Multiple places use `map.get(key)!` assuming key exists.

**Solution:** Two approaches depending on context:

**Option A: Return early when missing (defensive)**
```typescript
const value = map.get(key);
if (!value) {
  return; // or continue in loops
}
// value is now narrowed to non-undefined
```

**Option B: Use `??` with sensible default**
```typescript
const label = labelMap.get(nodeId) ?? nodeId;
```

**Decision:** Use Option A for critical paths (layout, rendering), Option B for display values only.

**Rationale:** Avoids hiding bugs with defaults in critical paths while keeping code concise for non-critical display logic.

### Decision 5: DOM type-safe utilities

**Problem:** `cloneNode(true) as SVGSVGElement`, `event.target as HTMLInputElement`.

**Solution:** Add utilities to `src/app/dom.ts`:

```typescript
function cloneSvgElement<T extends SVGElement>(element: T): T {
  return element.cloneNode(true) as T;
}

function getInputTarget(event: Event): HTMLInputElement | null {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    return target;
  }
  return null;
}
```

**Alternatives considered:**
- Use `instanceof` checks inline — acceptable for one-off uses
- Create generic DOM utilities library — overkill for current needs

**Rationale:** `cloneNode` always returns same type for Element subclasses per spec, so the cast is safe. Event target needs runtime check.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Dagre types may drift from actual API | Runtime checks in accessors catch mismatches |
| Added boilerplate for type safety | Contained to utility modules, main code becomes cleaner |
| Performance overhead from runtime checks | Negligible — checks are simple property access |
| Breaking changes if dagre updates | Already a risk; wrapper makes updates easier to handle |

## Migration Plan

1. Add new type utilities without changing existing code
2. Update each file one at a time, verifying compilation
3. Remove old patterns only after new ones are in place
4. Run manual testing on diagram rendering after each file

No rollback needed — changes are incremental and compile-time verified.

## Open Questions

- Should dagre types be extracted to a separate `@types` package for reuse? (Likely no — too specific to this project)
- Consider adding `noUncheckedIndexedAccess` to tsconfig later? (Out of scope for this change)
