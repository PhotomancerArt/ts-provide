import { disposeOf } from './dispose.js';
import { runWithExtraContext } from './provider-context.js';
import type { InputOfProvider, OutputOfProvider, ProviderFn, ProviderLike } from './providers.js';
import type { MaybePromise } from './types.js';
import { isWrapper } from './wrapper.js';

export async function runWithProvider<TProvider extends ProviderLike<any, any>, TResult>(
  provider: TProvider,
  fn: (context: OutputOfProvider<TProvider>) => MaybePromise<TResult>,
  input: InputOfProvider<TProvider>,
): Promise<TResult> {
  if (isWrapper(provider)) {
    let result: TResult | undefined;
    let called = false;

    await provider.wrapperFn(async (provided) => {
      const context = { ...(input ?? {}), ...(provided ?? {}) };
      await runWithExtraContext(context, async () => {
        called = true;
        result = await fn(context as OutputOfProvider<TProvider>);
      });
    }, input);

    if (!called) {
      throw new Error(`Wrapper function was not called. wrapperFn: ${provider.wrapperFn}`);
    }

    return result as TResult;
  }

  const provided = await (provider as ProviderFn<any, any>)(input);
  const context = { ...(input ?? {}), ...(provided ?? {}) };

  return await runWithExtraContext(context, async () => {
    try {
      return await fn(context as OutputOfProvider<TProvider>);
    } finally {
      await disposeOf(provided);
    }
  });
}
