# Phase 2: Implement Core Provider Library

## Scope of Phase

Implement the reusable provider library under `src/`, based on the reference provider pattern.

Out of scope:

- Example app implementation.
- Long-form README writing.
- GitHub setup.

## Code Organization Reminders

- Prefer granular files with one main concept per file.
- Keep related functionality grouped together.
- Put helpers lower in the file when that improves readability.
- Mark any temporary code with a clear `TODO`, and remove it before final cleanup.

## Sub-Agent Reminders

- Do not commit.
- Do not expand scope.
- Do not suppress warnings or weaken tests to get green builds.
- If blocked, stop and report instead of improvising.
- Report what changed, what was validated, and any deviations.

## Implementation Details

Create:

- `src/types.ts`: `MaybePromise`.
- `src/wrapper.ts`: `Wrapper<TIn, TOut>`, constructor, `isWrapper`.
- `src/dispose.ts`: disposal extraction/execution for `Symbol.dispose` and `Symbol.asyncDispose`.
- `src/universal-async-local-store.ts`: Node/browser async-local abstraction.
- `src/context-store.ts`: global singleton context store.
- `src/provider-context.ts`: `providerCtx`, `providerCtxSafe`, `runInContext`, `runWithExtraContext`, `runOutsideProviderCtx`, `contextStore`.
- `src/providers.ts`: provider type helpers, `ChainInput`, overloads up to a practical count, and `Providers()` composition.
- `src/run-with-provider.ts`: scoped provider execution.
- `src/wrap-with-provider.ts`: convenience wrapper.
- `src/index.ts`: public exports.

Preserve the important API names from the reference:

- `Providers`
- `ProviderFn`
- `ProviderLike`
- `Wrapper`
- `runWithProvider`
- `wrapWithProvider`
- `providerCtx`
- `providerCtxSafe`
- Type helpers including `InputOfProvider`, `OutputOfProvider`, `InputOfChain`, `OutputOfChain`, `ProviderChain`, `ProvidedValue`.

Use Node `AsyncLocalStorage` in Node and the reference-style fallback in browsers. Document limitations later in README.

## Validate

Run:

```sh
pnpm typecheck
pnpm build
```
