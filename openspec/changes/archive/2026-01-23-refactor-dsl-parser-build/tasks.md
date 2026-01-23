## 1. Implementation
- [x] 1.1 Add `src/dsl/grammar.pegjs` with the current PEG grammar content.
- [x] 1.2 Create a build-time generator script that outputs `src/dsl/parser.generated.ts` using `peggy` ESM output.
- [x] 1.3 Update `src/dsl/parser.ts` to import the generated parser and remove runtime `peggy.generate`.
- [x] 1.4 Wire `generate:parser` into `npm run dev` and `npm run build`, and move `peggy` to devDependencies.
- [x] 1.5 Run `npm run dev` and `npm run build` to confirm parsing works and eval warnings are gone.
- [x] 1.6 Ignore the generated parser file in git.
