import assert from 'node:assert/strict';
import { test } from 'node:test';

import { providerCtx, runWithProvider } from '@photomancerart/ts-provide';

import { buildAppProvider } from '../src/app-provider.js';
import type { ElapsedTimeServiceCtx } from '../src/elapsed-time-service.js';
import { DebugTimeService, provideDebugTimeService } from '../src/services/debug-time-service.js';

test('elapsed time uses injected debug time service', async () => {
  const debugTimeService = new DebugTimeService(Date.UTC(2026, 0, 1, 0, 0, 0));
  const provider = buildAppProvider(provideDebugTimeService(debugTimeService));

  await runWithProvider(
    provider,
    async () => {
      const elapsedTimeService = providerCtx<ElapsedTimeServiceCtx>().elapsedTimeService;

      const token = await elapsedTimeService.issueTimestampToken();
      debugTimeService.tick(12_345);

      assert.equal(await elapsedTimeService.elapsedSecondsSince(token), 12);
    },
    undefined,
  );
});
