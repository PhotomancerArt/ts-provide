# ts-provide Library Plan - Notes

## Scope of Work

Create a standalone TypeScript library and demo repository at `/Users/yona/dev/personal/providers`, intended for curious senior engineers who want a simpler dependency injection pattern for TypeScript apps.

The repo should become `ts-provide` on GitHub and be npm-publishable. It should include:

- A reusable TypeScript provider library.
- A small example app under `examples/`.
- Tests that demonstrate runtime behavior and type inference.
- A README that explains the pattern clearly for backend-focused TypeScript engineers, with enough frontend/browser notes to show applicability.
- Git initialization and GitHub remote/project creation.

## Current State of the Target Repo

`/Users/yona/dev/personal/providers` is currently empty and is not a git repository.

`gh auth status` succeeds for GitHub account `Yona-Appletree` with repo and workflow scopes, so GitHub repo creation should be possible during implementation.

## Reference Implementations

### `/Users/yona/dev/skybridge/skybridgeskills-monorepo/sbs/packages/lib-util/src/util/provider/`

This is the fuller utility implementation. Relevant files:

- `provider-ctx.ts`: exposes `providerCtx<T>()`, `providerCtxSafe<T>()`, `runInContext()`, `runWithExtraContext()`, `runOutsideProviderCtx()`, and a globally shared context store backed by `UniversalAsyncLocalStore`.
- `providers.ts`: defines `ProviderFn`, `ProviderLike`, `Providers()`, `ChainInput<T>()`, `InputOfProvider`, `OutputOfProvider`, `ProvidedValue`, and the chain input/output inference types.
- `run-with-provider.ts`: runs user code in the provider-built context and disposes resources afterward.
- `wrap-with-provider.ts`: converts a provider plus function into an input-accepting function.
- `wrapper.ts`: defines `Wrapper<TIn, TOut>` for around-the-call lifecycles.
- `README.test.ts`: acts as executable documentation and explains the pattern with provider functions, dependencies, factories, wrappers, disposal, `providerCtx()`, and override examples.
- `e2e-provider-store.ts`: test-app bridge for sharing provider context with a running app.

Notable behaviors:

- Providers are plain functions from accumulated context to new context keys.
- `Providers()` composes providers in order and enforces ordering through TypeScript overloads.
- Plain provider chains return a provider function; chains containing `Wrapper` return a `Wrapper`.
- Provider outputs may include `Symbol.dispose` and/or `Symbol.asyncDispose`, and disposal runs after scoped execution.
- `providerCtx<T>()` is strict and throws when no context/key exists; `providerCtxSafe<T>()` returns partial context.
- The implementation supports Node and browser via a universal async local storage abstraction, using real `AsyncLocalStorage` on Node and a module-level shim in browser.
- The global singleton exists to keep provider context shared across bundled/unbundled module instances.

### `/Users/yona/dev/skybridge/skills-verifier`

This has a portable, self-contained copy of the provider system under:

- `src/lib/server/util/provider/provider-ctx.ts`
- `src/lib/server/util/provider/providers.ts`
- `src/lib/server/util/provider/README.test.ts`

The earlier plan for that copy lives in:

- `docs/plans-done/2026-01-28-provider-injection-system/00-notes.md`
- `docs/plans-done/2026-01-28-provider-injection-system/00-design.md`

That implementation intentionally inlined dependencies for portability and included Blue Oak Model License notes. It is useful as a demo-friendly baseline, though the new standalone library should likely be split into maintainable source files rather than two copy-paste files.

Usage examples in `skills-verifier` show provider-backed app contexts, service accessors using `providerCtx()` / `providerCtxSafe()`, fake services for tests/dev, and app context factories.

## Notes From the User

- Build a quick implementation of the provider pattern used across several projects as a reusable demo / TypeScript library.
- A friend engineer at another company wants to understand the pattern.
- Need a working isolated version and a quick README write-up.
- Maybe publish to npm later.
- Need git setup and a new GitHub project called `ts-provide`.
- Audience: curious senior engineers trying for simpler DI in TypeScript apps, mostly backend-focused, but with frontend applications too.
- User asked for questions up front.

## Open Questions

### Q1: Package Name and Scope

**Context:** The GitHub repo should be called `ts-provide`, but the npm package name could be unscoped (`ts-provide`) or scoped (`@yona/ts-provide`, `@appletree/ts-provide`, etc.). The unscoped name may or may not be available on npm and could be awkward if already taken.

**Answer:** Use `@photomancerart/ts-provide` if a scope is needed. Keep the repository name `ts-provide`.

### Q2: GitHub Visibility

**Context:** `gh` is authenticated and can create the repo. Since this is intended to share with an engineer friend and maybe publish later, public visibility may be useful. A private repo is safer if you want to refine naming/API before sharing widely. The user clarified that the repo can be pushed to `https://github.com/photomancerart`.

**Suggested answer:** Create `photomancerart/ts-provide` as a public GitHub repo after the first implementation is validated.

### Q3: Library Shape

**Context:** The reference has both a fuller multi-file utility and a two-file portable copy. A library should be pleasant to maintain and publish, while the README can still include a “copy the concept” explanation.

**Suggested answer:** Build a small multi-file ESM library with a clean public export from `src/index.ts`, preserving the existing API names: `Providers`, `ProviderFn`, `ProviderLike`, `Wrapper`, `runWithProvider`, `wrapWithProvider`, `providerCtx`, `providerCtxSafe`, `runInContext`, `runWithExtraContext`, and the type helpers.

### Q4: Environment Support

**Context:** The user mentioned mostly backend apps, but frontend applications too. Node has real `AsyncLocalStorage`; browsers do not have equivalent async propagation, so the reference uses a limited fake store.

**Suggested answer:** Support Node first and include the browser fallback with clear docs: useful for simple browser/test scopes, not a full async context propagation substitute.

### Q5: Example App

**Context:** The audience is backend-focused, but frontend applicability matters. A CLI or tiny HTTP server is fastest and clearest for backend engineers; a frontend example could be added later.

**Answer:** Put a backend-oriented HTTP example in `examples/hextime`. The example should explicitly show a hexagonal approach with a `TimeService` port and three implementations. Naming should match the user's style:

- Example package/folder: `hextime`.
- Implementation folder: `services`, not `adapters`.
- Interface file: `time-service.ts`.
- Include an example-level README with setup and usage instructions.

The `TimeService` implementations are:

- A remote implementation that calls a server.
- A local implementation that uses `Date.now()`.
- A debug/manual clock implementation that can be set and ticked.

The example should be real-shaped but trivial:

- One request returns an opaque timestamp token.
- Another request accepts that token and returns how many seconds elapsed since it was issued.
- Tests should use the debug clock to validate elapsed-time behavior without sleeping.

### Q6: Tooling

**Context:** The repo is empty. The implementation needs fast TS build/test/type validation and publish-ready packaging.

**Answer:** Use `pnpm`. Keep tooling minimal. The implementation uses plain `tsc` for ESM builds and Node's built-in test runner through `tsx`, avoiding native bundler/test-runner dependencies for this small reference implementation. Turbo can be added later if orchestration becomes useful.

### Q7: Advanced Helpers

**Context:** The full reference includes `e2e-provider-store.ts`, useful for SvelteKit/e2e app testing, but it is more project-specific than the core provider pattern.

**Suggested answer:** Omit `e2e-provider-store` from v0.1. Include it in `future.md` as a possible add-on once the core library is stable.

### Q8: License

**Context:** The portable copy references Blue Oak Model License 1.0.0. If publishing to npm, a conventional SPDX license in `package.json` and a `LICENSE` file are needed.

**Answer:** Use MIT. The user wants the more familiar, company-friendly license for a library that may be shared with engineers at other organizations and eventually published to npm.

## Resolved Decisions

- GitHub target: `photomancerart/ts-provide`.
- NPM package name: `@photomancerart/ts-provide`.
- License: MIT.
- Initial repo should be public unless the user says otherwise before implementation.
- v0 should focus on the core provider API; project-specific helpers such as `e2e-provider-store` are future work.
