import type { MaybePromise } from './types.js';

import type { ProviderLike, ToVoidOrEmpty } from './providers.js';

export type Wrapper<in TIn, out TOut> = {
  $type: 'Wrapper';
  wrapperFn: (fn: (ctx: TOut) => void, input: TIn) => MaybePromise<void>;
};

export function Wrapper<TIn, TOut>(
  wrapperFn: (fn: (ctx: TOut) => void, input: TIn) => MaybePromise<void>,
): Wrapper<ToVoidOrEmpty<TIn>, TOut> {
  return {
    $type: 'Wrapper',
    wrapperFn: wrapperFn as (fn: (ctx: TOut) => void, input: ToVoidOrEmpty<TIn>) => MaybePromise<void>,
  };
}

export function isWrapper(provider: ProviderLike<any, any>): provider is Wrapper<any, any> {
  return (provider as { $type?: unknown }).$type === 'Wrapper';
}
