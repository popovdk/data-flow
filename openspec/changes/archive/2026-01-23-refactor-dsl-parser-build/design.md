## Context
The current DSL parser embeds the PEG grammar in `src/dsl/parser.ts` and calls `peggy.generate` at runtime. This hurts readability, complicates edits, and triggers an eval-related warning during Vite build.

## Goals / Non-Goals
- Goals:
  - Keep the grammar in a dedicated `.pegjs` file with syntax highlighting.
  - Precompile the parser during build/dev startup and import it at runtime.
  - Preserve existing DSL behavior and diagnostics.
- Non-Goals:
  - Changing DSL syntax or validation behavior.
  - Introducing runtime dependencies beyond the generated parser module.

## Decisions
- Store the grammar in `src/dsl/grammar.pegjs` and treat it as the source of truth.
- Add a build-time generator script that produces `src/dsl/parser.generated.ts` using `peggy` with ESM output.
- Update `src/dsl/parser.ts` to wrap the generated parser and keep existing diagnostic mapping.
- Wire generation into `npm run dev` and `npm run build` via pre-scripts to avoid stale artifacts.

## Alternatives Considered
- Keep runtime `peggy.generate`: rejected due to readability and build warnings.
- Use a Vite plugin to compile `.pegjs` on the fly: rejected to avoid an extra dependency and opaque build behavior.
- Commit a generated parser and update it manually: rejected due to drift risk.

## Risks / Trade-offs
- Generated parser may go stale if scripts are skipped → mitigated by predev/prebuild hooks.
- The generated file may produce TypeScript diagnostics → mitigated with a `// @ts-nocheck` header or `tsconfig` exclusion for the generated file.

## Migration Plan
1. Add `src/dsl/grammar.pegjs` and the generator script.
2. Generate `src/dsl/parser.generated.ts` and update `src/dsl/parser.ts` to import it.
3. Update `package.json` scripts and dependency placement.
4. Validate `npm run dev` and `npm run build` (no eval warning).

## Open Questions
- None.
