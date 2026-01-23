# Change: Refactor DSL grammar and parser build

## Why
The DSL grammar is currently embedded in `src/dsl/parser.ts` and generated at runtime, which reduces readability and triggers build-time eval warnings. We want a clearer grammar source and a precompiled parser module without changing DSL behavior.

## What Changes
- Move the PEG grammar into a standalone `src/dsl/grammar.pegjs` file as the authoritative source.
- Generate an ESM parser module during build/dev startup and import it at runtime instead of calling `peggy.generate`.
- Treat `peggy` as a build-time tool only (remove it from runtime bundles).

## Impact
- Affected specs: `openspec/specs/data-flow-visualization/spec.md`
- Affected code: `src/dsl/parser.ts`, `src/dsl/grammar.pegjs`, parser generator script, `package.json`
