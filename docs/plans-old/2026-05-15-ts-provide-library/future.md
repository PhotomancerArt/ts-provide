## E2E Provider Bridge

- **Idea:** Add an optional helper like `e2e-provider-store` for sharing test-owned provider context with a running app.
- **Why not now:** The first version should stay focused on the core pattern and the hextime example.
- **Useful context:** Reference implementation: `/Users/yona/dev/skybridge/skybridgeskills-monorepo/sbs/packages/lib-util/src/util/provider/e2e-provider-store.ts`.

## Frontend Framework Examples

- **Idea:** Add examples for React, SvelteKit, or another frontend app shape.
- **Why not now:** The immediate audience is backend-focused, and browser async context semantics need careful framing.
- **Useful context:** The README already notes that browser fallback behavior is not equivalent to Node `AsyncLocalStorage`.
