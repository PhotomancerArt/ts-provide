# ts-provide Library Plan - Summary

## What was built

- Created a new TypeScript workspace and package named `@photomancerart/ts-provide`.
- Implemented the provider pattern as a small ESM reference library.
- Added context access, provider composition, wrappers, scoped execution, and dispose/async-dispose collation.
- Added root tests for context behavior, provider chains, wrappers, disposal, type inference, and README-style usage.
- Added `examples/hextime`, a small hexagonal backend example with a `TimeService` port and local, remote, and debug implementations.
- Added deterministic hextime testing with a manually ticked debug clock.
- Wrote the root README as a pattern-first explanation focused on minimal ceremony, type safety, tests, composition, wrappers, and adapting the code.
- Renamed the planned project/package from `ts-provider` to `ts-provide`.

## Decisions for future reference

#### Pattern First

- **Decision:** Present this repo as a reference implementation of a pattern, not primarily as a library to install.
- **Why:** The code is small, architectural, and most useful when adapted to a project’s middleware, testing, and app shape.
- **Rejected alternatives:** Positioning the npm package as the primary artifact.
- **Revisit when:** The API stabilizes across multiple external users.

#### Minimal Tooling

- **Decision:** Use `tsc` and Node’s built-in test runner via `tsx` instead of bundler/test-runner tooling with native binaries.
- **Why:** The pattern is intentionally minimalist, and local Rollup/Rolldown native packages were brittle in this environment.
- **Rejected alternatives:** `tsup` and Vitest for the first pass.
- **Revisit when:** The package needs bundled CJS output or richer test runner features.

#### ESM First

- **Decision:** Publish/build as ESM-only for now.
- **Why:** The implementation uses top-level await for context-store initialization and modern Node supports ESM well.
- **Rejected alternatives:** Dual ESM/CJS output in v0.
- **Revisit when:** A concrete consumer needs CJS.

#### hextime Example

- **Decision:** Use a tiny elapsed-time HTTP example with a `TimeService` port and local/remote/debug services.
- **Why:** It demonstrates hexagonal composition, test-time service swapping, and provider ergonomics without becoming a framework demo.
- **Rejected alternatives:** A generic CLI or abstract service example.
