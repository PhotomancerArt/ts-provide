import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { providerCtx, Providers, runWithProvider, wrapWithProvider, Wrapper } from '../src/index.js';

describe('Providers', () => {
  it('builds accumulated context in order', async () => {
    const provideConfig = () => ({ config: { prefix: 'user' } });
    const provideUser = ({ config }: { config: { prefix: string } }) => ({
      user: { id: `${config.prefix}-1` },
    });

    const provider = Providers(provideConfig, provideUser);

    await runWithProvider(
      provider,
      (ctx) => {
        assert.equal(ctx.user.id, 'user-1');
        assert.equal(providerCtx<typeof ctx>().config.prefix, 'user');
      },
      undefined,
    );
  });

  it('supports nested provider chains', async () => {
    const base = Providers(
      () => ({ a: 1 }),
      ({ a }) => ({ b: a + 1 }),
    );
    const extended = Providers(base, ({ b }) => ({ c: b + 1 }));

    assert.deepEqual(await runWithProvider(extended, (ctx) => ctx, undefined), {
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('wraps provider-backed functions', async () => {
    const provider = Providers(() => ({ value: 5 }));
    const fn = wrapWithProvider(provider, ({ value }) => value * 2);

    assert.equal(await fn(undefined), 10);
  });

  it('runs wrappers around later providers and user code', async () => {
    const log: string[] = [];
    const provider = Providers(
      () => {
        log.push('a');
        return { a: 2 };
      },
      Wrapper<{ a: number }, { b: number }>((fn, { a }) => {
        log.push('wrapper:start');
        fn({ b: a * 3 });
        log.push('wrapper:end');
      }),
      ({ b }) => {
        log.push('c');
        return { c: b + 1 };
      },
    );

    const result = await runWithProvider(provider, (ctx) => ctx, undefined);

    assert.deepEqual(result, { a: 2, b: 6, c: 7 });
    assert.deepEqual(log, ['a', 'wrapper:start', 'c', 'wrapper:end']);
  });

  it('disposes provider resources after the scope exits', async () => {
    const log: string[] = [];
    const provider = Providers(
      () => ({
        first: true,
        [Symbol.dispose]: () => log.push('dispose:first'),
      }),
      () => ({
        second: true,
        [Symbol.asyncDispose]: async () => {
          log.push('dispose:second');
        },
      }),
    );

    await runWithProvider(provider, (ctx) => {
      assert.equal(ctx.first, true);
      assert.equal(ctx.second, true);
      assert.deepEqual(log, []);
    }, undefined);

    assert.deepEqual(log, ['dispose:first', 'dispose:second']);
  });
});
