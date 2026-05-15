import type { InputOfProvider, OutputOfProvider, ProviderLike } from './providers.js';
import { runWithProvider } from './run-with-provider.js';
import type { MaybePromise } from './types.js';

export function wrapWithProvider<TProvider extends ProviderLike<any, any>, TResult>(
  provider: TProvider,
  fn: (context: OutputOfProvider<TProvider>) => MaybePromise<TResult>,
) {
  return async (input: InputOfProvider<TProvider>) => runWithProvider(provider, fn, input);
}
