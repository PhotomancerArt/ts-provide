import { extractDispose } from './dispose.js';
import { runInContext } from './provider-context.js';
import { runWithProvider } from './run-with-provider.js';
import type { MaybePromise } from './types.js';
import type { Wrapper } from './wrapper.js';
import { isWrapper } from './wrapper.js';

export type EmptyCtx = Record<never, never>;
export type VoidOrEmpty = void | EmptyCtx;

export type ProviderFn<in TIn, out TOut> = (input: TIn) => MaybePromise<TOut>;
export type ProviderLike<TIn = any, TOut = any> = ProviderFn<TIn, TOut> | Wrapper<TIn, TOut>;

export type InputOfProvider<T extends ProviderLike> =
  T extends ProviderLike<infer TIn, infer _TOut> ? ToVoid<TIn> : void;

export type OutputOfProvider<T extends ProviderLike> =
  T extends ProviderLike<infer TIn, infer TOut> ? ToVoid<ToEmpty<TIn> & ToEmpty<TOut>> : void;

export type ProvidedValueError<TOut, THint extends string> = {
  __error: 'ProvidedValue expects a provider that returns a single-key object';
  __actualType: TOut;
  __hint: THint;
};

export type ProvidedValue<T extends ProviderLike> =
  T extends ProviderLike<infer _TIn, infer TOut>
    ? TOut extends Record<infer TName, infer TValue>
      ? [TName] extends [string]
        ? keyof TOut extends TName
          ? TName extends keyof TOut
            ? TValue
            : ProvidedValueError<TOut, 'Expected single key: { key: value }'>
          : ProvidedValueError<
              TOut,
              'Provider returns object with multiple keys. Expected single key: { key: value }'
            >
        : ProvidedValueError<TOut, 'Provider returns complex object structure. Expected: { key: value }'>
      : TOut extends Record<string, any>
        ? keyof TOut extends never
          ? ProvidedValueError<TOut, 'Provider returns an empty object. Expected: { key: value }'>
          : ProvidedValueError<TOut, 'Provider does not return an object. Expected: { key: value }'>
        : ProvidedValueError<TOut, 'Provider does not return an object. Expected: { key: value }'>
    : never;

export type HasWrappers<T extends readonly ProviderLike[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends Wrapper<any, any>
    ? true
    : Rest extends readonly ProviderLike[]
      ? HasWrappers<Rest>
      : false
  : false;

export type ToEmpty<T> = unknown extends T
  ? EmptyCtx
  : void extends T
    ? EmptyCtx
    : T extends object
      ? T
      : EmptyCtx;

export type ToVoid<T> = EmptyCtx extends T ? void : unknown extends T ? void : T;

export type ToVoidOrEmpty<T> = void extends T
  ? void | EmptyCtx
  : EmptyCtx extends T
    ? void | EmptyCtx
    : unknown extends T
      ? void | EmptyCtx
      : T;

export type _OutputOfChain<T extends readonly ProviderLike[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends ProviderLike<any, infer TOut>
    ? Rest extends readonly ProviderLike[]
      ? ToEmpty<TOut> & _OutputOfChain<Rest>
      : ToEmpty<TOut>
    : EmptyCtx
  : EmptyCtx;

export type OutputOfChain<T extends readonly ProviderLike[], TInput = EmptyCtx> = ToVoid<
  _OutputOfChain<T> & ToEmpty<TInput>
>;

type _InputOfChain<T extends readonly ProviderLike[], TChainOut = EmptyCtx> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends ProviderLike<infer TIn, infer TOut>
    ? Rest extends readonly ProviderLike[]
      ? Omit<ToEmpty<TIn>, keyof TChainOut> & _InputOfChain<Rest, TChainOut & TOut>
      : Omit<ToEmpty<TIn>, keyof TChainOut>
    : EmptyCtx
  : EmptyCtx;

export type InputOfChain<T extends readonly ProviderLike[], TChainOut = EmptyCtx> = ToVoid<
  _InputOfChain<T, TChainOut>
>;

export type ProviderChain<T extends readonly ProviderLike[]> =
  HasWrappers<T> extends true
    ? Wrapper<ToVoidOrEmpty<InputOfChain<T>>, ToVoid<OutputOfChain<T>>>
    : ProviderFn<ToVoidOrEmpty<InputOfChain<T>>, ToVoid<OutputOfChain<T>>>;

export function ChainInput<T extends object>(): ProviderFn<T, T> {
  return async (input: T) => input;
}

type ChainableFrom<T extends readonly ProviderLike[]> = ProviderLike<OutputOfChain<T>, any>;

export function Providers(): ProviderFn<void, void>;
export function Providers<A extends ProviderLike>(a: A): ProviderChain<[A]>;
export function Providers<A extends ProviderLike, B extends ChainableFrom<[A]>>(
  a: A,
  b: B,
): ProviderChain<[A, B]>;
export function Providers<
  A extends ProviderLike,
  B extends ChainableFrom<[A]>,
  C extends ChainableFrom<[A, B]>,
>(a: A, b: B, c: C): ProviderChain<[A, B, C]>;
export function Providers<
  A extends ProviderLike,
  B extends ChainableFrom<[A]>,
  C extends ChainableFrom<[A, B]>,
  D extends ChainableFrom<[A, B, C]>,
>(a: A, b: B, c: C, d: D): ProviderChain<[A, B, C, D]>;
export function Providers<
  A extends ProviderLike,
  B extends ChainableFrom<[A]>,
  C extends ChainableFrom<[A, B]>,
  D extends ChainableFrom<[A, B, C]>,
  E extends ChainableFrom<[A, B, C, D]>,
>(a: A, b: B, c: C, d: D, e: E): ProviderChain<[A, B, C, D, E]>;
export function Providers<
  A extends ProviderLike,
  B extends ChainableFrom<[A]>,
  C extends ChainableFrom<[A, B]>,
  D extends ChainableFrom<[A, B, C]>,
  E extends ChainableFrom<[A, B, C, D]>,
  F extends ChainableFrom<[A, B, C, D, E]>,
>(a: A, b: B, c: C, d: D, e: E, f: F): ProviderChain<[A, B, C, D, E, F]>;
export function Providers<
  A extends ProviderLike,
  B extends ChainableFrom<[A]>,
  C extends ChainableFrom<[A, B]>,
  D extends ChainableFrom<[A, B, C]>,
  E extends ChainableFrom<[A, B, C, D]>,
  F extends ChainableFrom<[A, B, C, D, E]>,
  G extends ChainableFrom<[A, B, C, D, E, F]>,
>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ProviderChain<[A, B, C, D, E, F, G]>;
export function Providers<
  A extends ProviderLike,
  B extends ChainableFrom<[A]>,
  C extends ChainableFrom<[A, B]>,
  D extends ChainableFrom<[A, B, C]>,
  E extends ChainableFrom<[A, B, C, D]>,
  F extends ChainableFrom<[A, B, C, D, E]>,
  G extends ChainableFrom<[A, B, C, D, E, F]>,
  H extends ChainableFrom<[A, B, C, D, E, F, G]>,
>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
): ProviderChain<[A, B, C, D, E, F, G, H]>;

export function Providers(...providers: ProviderLike[]): any {
  const hasWrappers = providers.some(isWrapper);

  if (hasWrappers) {
    return {
      $type: 'Wrapper',
      wrapperFn: async (userFn: (context: any) => any, input: any) => {
        const [firstProvider, ...remainingProviders] = providers;

        const handlerFn = async (handlerInput: any) => {
          const nextProvider = remainingProviders.shift();

          if (nextProvider) {
            return await runWithProvider(nextProvider, handlerFn as any, handlerInput);
          }

          return await userFn(handlerInput);
        };

        if (!firstProvider) {
          return await userFn(input);
        }

        return await runWithProvider(firstProvider, handlerFn as any, input);
      },
    } satisfies Wrapper<any, any>;
  }

  return async (input: any) => {
    const disposers: (() => void | Promise<void>)[] = [];
    const asyncDisposers: (() => Promise<void>)[] = [];
    let context = { ...(input ?? {}) };

    for (const provider of providers) {
      await runInContext(context, async () => {
        const { dispose, asyncDispose, rest } = extractDispose(
          (await (provider as ProviderFn<any, any>)(context)) ?? {},
        );

        context = { ...context, ...rest };

        if (dispose) {
          disposers.push(dispose);
        }

        if (asyncDispose) {
          asyncDisposers.push(asyncDispose);
        }
      });
    }

    return {
      ...context,
      ...(disposers.length > 0
        ? {
            [Symbol.dispose]: async () => {
              for (const dispose of [...disposers].reverse()) {
                await dispose();
              }
            },
          }
        : {}),
      ...(asyncDisposers.length > 0
        ? {
            [Symbol.asyncDispose]: async () => {
              for (const asyncDispose of [...asyncDisposers].reverse()) {
                await asyncDispose();
              }
            },
          }
        : {}),
    };
  };
}
