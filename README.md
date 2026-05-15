# ts-provide

`ts-provide` is a small library demonstrating a minimalist dependency injection/
application context pattern in TypeScript.

If you like the pattern, I suggest you point your agents at
this repo, copy the ideas that fit, and adapt them to your own app. 

You can install the package if you want, but the pattern is small
enough that owning the code is often the better move.

## The Problem

I want to build TypeScript apps with good architecture and little ceremony.

Requirements:

- Type-safe dependency wiring.
- Good tests.
- Hexagonal / ports-and-adapters / anti-corruption boundaries.
- Composition of application contexts.
- A way to integrate with existing middleware and test frameworks.
- As little magic as possible.

I do not want:

- decorators
- scanning
- reflection
- codegen
- containers
- hidden registration steps

This pattern came from building the simplest thing I could that works well in modern TypeScript.

## The Core Idea

A provider is just a function that receives the context built so far and returns more context.

```ts
import { Providers, providerCtx, runWithProvider } from '@photomancerart/ts-provide';

// app config
const provideConfig = () => ({
  config: {
    appName: 'hextime',
  },
});
type ConfigCtx = ReturnType<typeof provideConfig>;

// logger
const provideLogger = ({ config }: ConfigCtx) => ({
  logger: {
    info: (message: string) => console.log(`[${config.appName}] ${message}`),
  },
});
type LogCtx = ReturnType<typeof provideLogger>;

type AppContext = ConfigCtx & LogCtx;

// app context
const appContext = () => providerCtx<AppContext>();

const appProvider = Providers(provideConfig, provideLogger);

// business logic
const logic = (ctx: AppContext = appContext()) => {
  ctx.logger.info('ready');

  // or use ambient access through AsyncLocalStorage
  appContext().logger.info('ready');
};

// entrypoint
async function main() {
  await runWithProvider(
    appProvider,
    () => {
      logic();
    },
    undefined,
  );
}

await main();
```

Each provider is ordinary code. Dependencies are function parameters. Output is a plain object. Composition is explicit.

The same shape works in tests. Build a smaller context, swap the things you need to control, and run the test inside that provider:

```ts
import assert from 'node:assert/strict';
import { test } from 'node:test';

test('uses injected context', async () => {
  const messages: string[] = [];

  const provideTestLogger = ({ config }: ConfigCtx): LogCtx => ({
    logger: {
      info: (message: string) => messages.push(`[${config.appName}] ${message}`),
    },
  });

  const testProvider = Providers(provideConfig, provideTestLogger);

  await runWithProvider(
    testProvider,
    () => {
      logic();
    },
    undefined,
  );

  assert.deepEqual(messages, ['[hextime] ready']);
});
```

That is a big part of the draw: the test context is just another provider chain.

## Why This Shape

The pattern is small, type-safe, and fully authored in code.

- No decorators.
- No scanning.
- No codegen.
- No framework-owned container.
- No string tokens unless you choose to use them.

The tradeoff is that you write provider functions and compose them directly. For me, that is a feature. The wiring is visible, searchable, testable TypeScript.

## Context Composition

Providers compose flat context objects:

```ts
const provider = Providers(
  provideConfig,
  provideLogger,
  provideDatabase,
  provideUserService,
);
```

Each provider can depend on keys produced earlier in the chain. TypeScript enforces the order. Chains are providers too, so you can build small contexts and extend them:

```ts
const baseProvider = Providers(provideConfig, provideLogger);
const testProvider = Providers(baseProvider, provideDebugClock);
```

## Tests

The test integration is one of the main reasons I like this pattern.

Instead of setting up a bunch of shared state in `beforeEach`, define the context for the test and run the test inside it:

```ts
await runWithProvider(
  Providers(provideConfig, provideDebugClock, provideElapsedTimeService),
  async () => {
    const service = providerCtx<ElapsedTimeServiceCtx>().elapsedTimeService;
    const token = await service.issueTimestampToken();

    providerCtx<DebugClockCtx>().debugClock.tick(12_000);

    assert.equal(await service.elapsedSecondsSince(token), 12);
  },
  undefined,
);
```

That scales nicely. Test context becomes a plain function you can compose and inject. Wrappers make this even better when you need scoped test behavior without spreading setup/teardown across `beforeAll` and `beforeEach`.

## Wrappers

Most providers return values. Sometimes you need to wrap the call stack.

That is what `Wrapper()` is for:

- Transactions.
- Async local storage.
- Express or other middleware integration.
- Mock servers.
- Fake timers.
- Test framework hooks that need setup around the body.

```ts
const TransactionWrapper = Wrapper<DbCtx, TransactionCtx>(async (fn, { db }) => {
  await db.transaction(async (tx) => {
    await fn({ tx });
  });
});
```

A wrapper is still part of the provider chain, but it controls the execution scope instead of only adding values.

## Dispose Collation

Providers can return `Symbol.dispose` and `Symbol.asyncDispose`.

When a provider chain runs, disposers are collected and exposed on the combined context. `runWithProvider()` calls them when the scope exits.

```ts
function provideConnection() {
  const connection = openConnection();

  return {
    connection,
    [Symbol.asyncDispose]: async () => {
      await connection.close();
    },
  };
}
```

This keeps resource cleanup near resource creation, while still letting the app compose many providers into one context.

## Hexagonal Apps

The `examples/hextime` app shows the pattern with a tiny hexagonal service:

- `time-service.ts` defines a `TimeService` port.
- `services/local-time-service.ts` uses `Date.now()`.
- `services/remote-time-service.ts` calls a server.
- `services/debug-time-service.ts` can be manually set and ticked in tests.
- `elapsed-time-service.ts` issues opaque timestamp tokens and calculates elapsed seconds.

Run it:

```sh
pnpm install
pnpm build
pnpm example:hextime
```

Try it:

```sh
curl -X POST http://localhost:3017/timestamps
curl "http://localhost:3017/elapsed?token=<token>"
```

Run the deterministic debug-clock test:

```sh
pnpm --filter @photomancerart/hextime-example test
```

## Using This Repo

For most teams, I would start by reading the code and adapting it:

- `src/providers.ts`
- `src/provider-context.ts`
- `src/run-with-provider.ts`
- `src/wrapper.ts`
- `examples/hextime`

If you do install it as a package:

```sh
pnpm add @photomancerart/ts-provide
```

The package is ESM-first and intentionally small.

## Browser Note

Node uses real `AsyncLocalStorage`. Browser environments do not have the same primitive, so the browser fallback is only a lightweight scope shim. It is useful for simple tests and synchronous-ish flows, but it is not a full async context propagation system.

For frontend apps, I usually treat this as a composition pattern first. Use the pieces that fit your framework and be honest about where your runtime stores request/component state.

## Commands

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm check
```
