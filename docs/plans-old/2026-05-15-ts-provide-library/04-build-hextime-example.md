# Phase 4: Build hextime Example

## Scope of Phase

Create the `examples/hextime` backend-oriented hexagonal example.

Out of scope:

- Root README prose beyond links to the example.
- GitHub setup.
- npm publishing.

## Code Organization Reminders

- Use the user's naming style: `hextime`, `services/`, `time-service.ts`.
- Keep the example real-shaped but trivial.
- Prefer clear service boundaries over cleverness.
- Mark any temporary code with a clear `TODO`, and remove it before final cleanup.

## Sub-Agent Reminders

- Do not commit.
- Do not expand scope.
- Do not suppress warnings or weaken tests to get green builds.
- If blocked, stop and report instead of improvising.
- Report what changed, what was validated, and any deviations.

## Implementation Details

Create:

- `examples/hextime/package.json`
- `examples/hextime/tsconfig.json`
- `examples/hextime/README.md`
- `examples/hextime/src/time-service.ts`
- `examples/hextime/src/services/local-time-service.ts`
- `examples/hextime/src/services/remote-time-service.ts`
- `examples/hextime/src/services/debug-time-service.ts`
- `examples/hextime/src/timestamp-token.ts`
- `examples/hextime/src/elapsed-time-service.ts`
- `examples/hextime/src/app-provider.ts`
- `examples/hextime/src/http-server.ts`
- `examples/hextime/test/elapsed-time-service.test.ts`

Behavior:

- One HTTP request returns an opaque timestamp token.
- Another HTTP request accepts that token and returns elapsed seconds.
- `TimeService` is the port.
- Local service uses `Date.now()`.
- Remote service calls a server for current time.
- Debug service supports manual `set()` and `tick()` controls.
- Test wires providers with debug clock, issues a token, advances time, and verifies elapsed seconds without sleeping.

## Validate

Run:

```sh
pnpm --filter @photomancerart/hextime-example test
pnpm --filter @photomancerart/hextime-example typecheck
pnpm test
pnpm typecheck
```
