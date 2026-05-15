# Phase 3: Add Core Tests

## Scope of Phase

Add tests for the library behavior and type inference.

Out of scope:

- Example app tests except where required by imports.
- README prose.
- GitHub setup.

## Code Organization Reminders

- Prefer focused test files by behavior.
- Keep tests readable enough to serve as secondary examples.
- Avoid tests that assert implementation details unless needed for safety.

## Sub-Agent Reminders

- Do not commit.
- Do not expand scope.
- Do not suppress warnings or weaken tests to get green builds.
- If blocked, stop and report instead of improvising.
- Report what changed, what was validated, and any deviations.

## Implementation Details

Create:

- `test/providers.test.ts`
- `test/provider-context.test.ts`
- `test/type-inference.test.ts`
- `test/readme-examples.test.ts`

Cover:

- Provider chain ordering and accumulated context.
- Nested provider chains.
- Explicit `ChainInput<T>()`.
- Strict `providerCtx<T>()` and safe `providerCtxSafe<T>()`.
- `runWithProvider()` and `wrapWithProvider()`.
- `Wrapper()` lifecycle ordering.
- `Symbol.dispose` and `Symbol.asyncDispose`.
- Type inference for input/output helpers and chain requirements.

## Validate

Run:

```sh
pnpm test
pnpm typecheck
```
