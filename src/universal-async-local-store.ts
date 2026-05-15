import type { AsyncLocalStorage } from 'node:async_hooks';

type StoreApi<T> = Pick<AsyncLocalStorage<T>, 'getStore' | 'run' | 'exit'>;

export async function UniversalAsyncLocalStore<T>(): Promise<StoreApi<T>> {
  if (typeof window !== 'undefined') {
    return FakeAsyncLocalStore<T>();
  }

  const { AsyncLocalStorage } = await import('node:async_hooks');
  return new AsyncLocalStorage<T>();
}

function FakeAsyncLocalStore<T>(): StoreApi<T> {
  let currentStore: T | undefined;

  return {
    getStore: () => currentStore,
    run: <R>(store: T, callback: () => R): R => {
      const previousStore = currentStore;
      currentStore = store;

      try {
        const result = callback();
        if (isPromiseLike(result)) {
          return Promise.resolve(result).finally(() => {
            currentStore = previousStore;
          }) as R;
        }

        currentStore = previousStore;
        return result;
      } catch (error) {
        currentStore = previousStore;
        throw error;
      }
    },
    exit<R, TArgs extends unknown[]>(callback: (...args: TArgs) => R, ...args: TArgs): R {
      const previousStore = currentStore;
      currentStore = undefined;

      try {
        const result = callback(...args);
        if (isPromiseLike(result)) {
          return Promise.resolve(result).finally(() => {
            currentStore = previousStore;
          }) as R;
        }

        currentStore = previousStore;
        return result;
      } catch (error) {
        currentStore = previousStore;
        throw error;
      }
    },
  };
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return !!(
    value &&
    (typeof value === 'object' || typeof value === 'function') &&
    'then' in value &&
    typeof value.then === 'function'
  );
}
