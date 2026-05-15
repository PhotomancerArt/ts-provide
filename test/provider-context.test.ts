import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  providerCtx,
  providerCtxSafe,
  runInContext,
  runOutsideProviderCtx,
  runWithExtraContext,
} from '../src/index.js';

describe('provider context', () => {
  it('reads strict and safe context values', () => {
    runInContext({ config: { appName: 'demo' } }, () => {
      assert.equal(providerCtx<{ config: { appName: string } }>().config.appName, 'demo');
      assert.equal(providerCtxSafe<{ missing: string }>().missing, undefined);
    });
  });

  it('throws useful errors for missing strict context keys', () => {
    assert.throws(() =>
      runInContext({ config: {} }, () => {
        providerCtx<{ logger: unknown }>().logger;
      }),
    /Missing context key: logger/);
  });

  it('extends and exits context scopes', () => {
    runInContext({ a: 1 }, () => {
      runWithExtraContext({ b: 2 }, () => {
        assert.equal(providerCtx<{ a: number; b: number }>().a, 1);
        assert.equal(providerCtx<{ a: number; b: number }>().b, 2);
      });

      runOutsideProviderCtx(() => {
        assert.equal(providerCtxSafe<{ a: number }>().a, undefined);
      });
    });
  });
});
