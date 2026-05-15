import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ChainInput,
  type InputOfChain,
  type InputOfProvider,
  type OutputOfProvider,
  type ProvidedValue,
  Providers,
  type ProviderFn,
} from '../src/index.js';

test('provider type helpers infer input and output', () => {
  const provideConfig = (_input: { env: 'dev' | 'prod' }) => ({
    config: { debug: _input.env === 'dev' },
  });

  type ConfigInput = InputOfProvider<typeof provideConfig>;
  type ConfigOutput = OutputOfProvider<typeof provideConfig>;

  const input: ConfigInput = { env: 'dev' };
  const output: ConfigOutput = {
    env: 'prod',
    config: { debug: false },
  };
  const expectedInput: { env: 'dev' | 'prod' } = input;
  const expectedOutput: {
    env: 'dev' | 'prod';
    config: { debug: boolean };
  } = output;

  assert.equal(expectedInput.env, 'dev');
  assert.equal(expectedOutput.config.debug, false);
});

test('provider chains only require input not produced by earlier providers', () => {
  const chain = Providers(
    ChainInput<{ env: 'dev' | 'prod' }>(),
    ({ env }) => ({ config: { debug: env === 'dev' } }),
    ({ config }) => ({ logger: { enabled: config.debug } }),
  );

  const input: InputOfProvider<typeof chain> = { env: 'dev' };
  const output: OutputOfProvider<typeof chain> = {
    env: 'prod',
    config: { debug: false },
    logger: { enabled: false },
  };
  const expectedInput: { env: 'dev' | 'prod' } = input;
  const expectedOutput: {
    env: 'dev' | 'prod';
    config: { debug: boolean };
    logger: { enabled: boolean };
  } = output;

  assert.equal(expectedInput.env, 'dev');
  assert.equal(expectedOutput.logger.enabled, false);
});

test('ProvidedValue extracts single-key provider values', () => {
  const provider = () => ({ clock: { now: () => 123 } });

  const value: ProvidedValue<typeof provider> = { now: () => 123 };
  const expectedValue: { now: () => number } = value;

  assert.equal(expectedValue.now(), 123);
});

test('InputOfChain supports manually declared provider tuples', () => {
  type ChainInputType = InputOfChain<
    [
      ProviderFn<{ a: number }, { b: number }>,
      ProviderFn<{ b: number }, { c: number }>,
    ]
  >;

  const input: ChainInputType = { a: 1 };
  const expectedInput: { a: number } = input;

  assert.equal(expectedInput.a, 1);
});
