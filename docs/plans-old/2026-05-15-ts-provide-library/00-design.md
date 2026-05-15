# ts-provide Library Plan - Design

## Scope of Work

Create a standalone TypeScript provider-pattern library in `/Users/yona/dev/personal/providers`.

The result should be a working, isolated repository suitable for sharing with senior engineers and preparing for eventual npm publication:

- Git repository initialized locally.
- GitHub repository created at `photomancerart/ts-provide`.
- NPM package name set to `@photomancerart/ts-provide`.
- MIT licensed.
- Core provider API implemented from the existing Skybridge pattern.
- Tests covering runtime behavior, type inference, context access, wrapper lifecycle, disposal, and README examples.
- A small but real-shaped backend example under `examples/hextime`.
- README written for backend-focused TypeScript engineers who want a simpler DI approach, with frontend/browser notes.

## File Structure

```text
/Users/yona/dev/personal/providers/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   └── plans/
│       └── 2026-05-15-ts-provide-library/
│           ├── 00-design.md
│           └── 00-notes.md
├── examples/
│   └── hextime/
│       ├── README.md
│       ├── package.json
│       ├── src/
│       │   ├── app-provider.ts
│       │   ├── elapsed-time-service.ts
│       │   ├── http-server.ts
│       │   ├── services/
│       │   │   ├── debug-time-service.ts
│       │   │   ├── local-time-service.ts
│       │   │   └── remote-time-service.ts
│       │   ├── time-service.ts
│       │   └── timestamp-token.ts
│       ├── test/
│       │   └── elapsed-time-service.test.ts
│       └── tsconfig.json
├── src/
│   ├── context-store.ts
│   ├── dispose.ts
│   ├── index.ts
│   ├── provider-context.ts
│   ├── providers.ts
│   ├── run-with-provider.ts
│   ├── types.ts
│   ├── universal-async-local-store.ts
│   ├── wrap-with-provider.ts
│   └── wrapper.ts
├── test/
│   ├── provider-context.test.ts
│   ├── providers.test.ts
│   ├── readme-examples.test.ts
│   └── type-inference.test.ts
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── tsconfig.build.json
```

## Architecture Summary

The library is a tiny typed context-composition system. It keeps dependency injection as plain TypeScript functions rather than classes, decorators, containers, or registration metadata.

Provider functions receive accumulated context and return new context keys. `Providers()` composes those functions into a single provider while preserving input/output inference. `runWithProvider()` executes a callback inside the built context, makes that context available through async-local storage, and disposes resources when the scope exits. `providerCtx<T>()` and `providerCtxSafe<T>()` give application code ergonomic access to the current context when threading `ctx` explicitly would create noise.

`Wrapper()` handles scoped around-the-call lifecycle cases. Examples include fake timers, request mocks, instrumentation, or setup/teardown APIs that need to wrap the consumer function rather than simply return a value.

The Node path uses `AsyncLocalStorage`. The browser path keeps the existing reference behavior: a lightweight fallback useful for simple scopes and tests, with clear documentation that it is not the same as full async context propagation.

## Main Components and Interactions

### Public API

Export from `src/index.ts`:

- `Providers`
- `ChainInput`
- `Wrapper`
- `runWithProvider`
- `wrapWithProvider`
- `providerCtx`
- `providerCtxSafe`
- `runInContext`
- `runWithExtraContext`
- `runOutsideProviderCtx`
- `contextStore`
- Type helpers: `ProviderFn`, `ProviderLike`, `InputOfProvider`, `OutputOfProvider`, `InputOfChain`, `OutputOfChain`, `ProviderChain`, `ProvidedValue`, `EmptyCtx`, `VoidOrEmpty`

### Library Internals

- `src/types.ts`: shared `MaybePromise` and small generic types.
- `src/wrapper.ts`: `Wrapper<TIn, TOut>` type, constructor, and type guard.
- `src/dispose.ts`: `Symbol.dispose` / `Symbol.asyncDispose` extraction and execution helpers.
- `src/universal-async-local-store.ts`: Node/browser async-local abstraction.
- `src/context-store.ts`: global singleton context store to avoid duplicate module-instance context drift.
- `src/provider-context.ts`: strict/safe context proxies and context-running helpers.
- `src/providers.ts`: provider chain types, overloads, `ChainInput<T>()`, and `Providers()` composition logic.
- `src/run-with-provider.ts`: scoped execution and disposal.
- `src/wrap-with-provider.ts`: convenience wrapper for provider-backed functions.

### hextime Example

`examples/hextime` demonstrates a hexagonal app shape without turning into a framework sample.

- `time-service.ts`: declares the `TimeService` port.
- `services/local-time-service.ts`: local implementation using `Date.now()`.
- `services/remote-time-service.ts`: remote implementation that calls a server for current time.
- `services/debug-time-service.ts`: manual implementation with `set()` and `tick()` controls for tests.
- `elapsed-time-service.ts`: domain/application service that issues opaque timestamp tokens and computes elapsed seconds.
- `timestamp-token.ts`: tiny opaque token encoding/decoding helper.
- `app-provider.ts`: provider chain wiring the selected `TimeService` and elapsed-time service.
- `http-server.ts`: small HTTP app exposing timestamp and elapsed endpoints.
- `test/elapsed-time-service.test.ts`: provider-backed test that swaps in `DebugTimeService`, issues a token, ticks time, and verifies elapsed seconds without sleeping.
- `README.md`: setup, commands, endpoint examples, and a short explanation of how the providers map ports to implementations.

## Tooling

Use `pnpm` as the package manager.

Use a workspace layout so the root library and `examples/hextime` can share local package references cleanly. Turbo can be added later if orchestration becomes useful, but the initial implementation should stay minimal.

Scripts:

- `pnpm build`: build root library and example if applicable.
- `pnpm test`: run Node's built-in test runner through `tsx`.
- `pnpm typecheck`: run TypeScript checking.
- `pnpm example:hextime`: start the example HTTP server.

CI should run install, typecheck, test, and build.

## Documentation

The root README should explain:

- The problem: needing dependency assembly without adopting a DI container.
- The core idea: providers are just functions returning context keys.
- How provider ordering and TypeScript inference work.
- How `providerCtx()` is used in app/service code.
- How tests swap implementations by changing provider chains.
- How wrappers and disposal fit in.
- When this pattern is a good fit and when a larger framework/container may still be useful.
- Backend-first examples, plus a browser/frontend note about the fallback async-local behavior.

The example README should explain:

- How to install and run the example.
- The `TimeService` port and its local/remote/debug implementations.
- How to call the HTTP endpoints.
- How the debug clock test proves behavior deterministically.

## Out of Scope for v0

- Publishing to npm.
- Complex frontend framework examples.
- Project-specific e2e provider sharing helpers.
- A full DI container feature set such as decorators, service discovery, reflection, or lifetime registration.
