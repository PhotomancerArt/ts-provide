import { UniversalAsyncLocalStore } from './universal-async-local-store.js';

const CONTEXT_STORE_KEY = '__photomancerart_ts_provide_contextStore';

export const contextStore = await createGlobalSingleton(CONTEXT_STORE_KEY, () =>
  UniversalAsyncLocalStore<unknown>(),
);

export function getContextStoreSync() {
  return getGlobalSingleton<Awaited<ReturnType<typeof UniversalAsyncLocalStore<unknown>>>>(
    CONTEXT_STORE_KEY,
  );
}

async function createGlobalSingleton<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const globalRef = globalThis as unknown as Record<string, T | Promise<T> | undefined>;
  const promiseKey = `${key}Promise`;

  const existing = globalRef[key];
  if (existing && !(existing instanceof Promise)) {
    return existing;
  }

  const existingPromise = globalRef[promiseKey];
  if (existingPromise instanceof Promise) {
    const instance = await existingPromise;
    globalRef[key] = instance;
    return instance;
  }

  const promise = factory();
  globalRef[promiseKey] = promise;

  try {
    const instance = await promise;
    globalRef[key] = instance;
    delete globalRef[promiseKey];
    return instance;
  } catch (error) {
    delete globalRef[promiseKey];
    throw error;
  }
}

function getGlobalSingleton<T>(key: string): T {
  const globalRef = globalThis as unknown as Record<string, T | undefined>;
  const instance = globalRef[key];

  if (!instance) {
    throw new Error(`Global singleton "${key}" not initialized. Ensure it is initialized before use.`);
  }

  return instance;
}
