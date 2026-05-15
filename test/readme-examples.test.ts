import assert from 'node:assert/strict';
import { test } from 'node:test';

import { providerCtx, Providers, runWithProvider } from '../src/index.js';

test('readme-style service swap', async () => {
  type Clock = { now: () => number };
  type ClockCtx = { clock: Clock };

  const provideClock = () => ({
    clock: {
      now: () => 1000,
    },
  });

  function secondsSince(startMs: number) {
    const { clock } = providerCtx<ClockCtx>();
    return Math.floor((clock.now() - startMs) / 1000);
  }

  await runWithProvider(
    Providers(provideClock),
    () => {
      assert.equal(secondsSince(0), 1);
    },
    undefined,
  );
});
