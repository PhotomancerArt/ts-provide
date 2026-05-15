# hextime

`hextime` is a tiny backend example for the provider pattern. It shows a hexagonal shape without much ceremony: app code depends on a `TimeService` port, and providers choose the implementation.

## Run It

From the repo root:

```sh
pnpm install
pnpm build
pnpm example:hextime
```

Issue an opaque timestamp token:

```sh
curl -X POST http://localhost:3017/timestamps
```

Ask how many seconds have elapsed:

```sh
curl "http://localhost:3017/elapsed?token=<token>"
```

## Shape

- `src/time-service.ts` defines the `TimeService` port.
- `src/services/local-time-service.ts` uses `Date.now()`.
- `src/services/remote-time-service.ts` calls a server endpoint for time.
- `src/services/debug-time-service.ts` is manually set and ticked by tests.
- `src/elapsed-time-service.ts` issues opaque timestamp tokens and calculates elapsed seconds.
- `src/app-provider.ts` composes the chosen time service with the elapsed-time service.

The test uses the debug clock to validate elapsed-time behavior without sleeping or mocking globals:

```sh
pnpm --filter @photomancerart/hextime-example test
```
