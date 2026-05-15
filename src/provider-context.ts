import { contextStore, getContextStoreSync } from './context-store.js';

export { contextStore };

export function providerCtx<T>() {
  return strictContextProxy as T;
}

export function providerCtxSafe<T>() {
  return safeContextProxy as Partial<T>;
}

export function runInContext<T>(context: object, fn: () => T): T {
  const store = getContextStoreSync();

  if (context === store.getStore()) {
    return fn();
  }

  return store.run({ ...context }, fn);
}

export function runWithExtraContext<T>(extra: object, fn: () => T): T {
  const store = getContextStoreSync();

  return store.run(
    {
      ...((store.getStore() as object | undefined) ?? {}),
      ...extra,
    },
    fn,
  );
}

export function runOutsideProviderCtx<T>(fn: () => T): T {
  const store = getContextStoreSync();
  return store.exit(() => fn());
}

const strictContextProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      if (
        typeof prop !== 'string' ||
        prop.startsWith('$$') ||
        prop.startsWith('@@') ||
        ['then', 'constructor', 'toJSON'].includes(prop)
      ) {
        return undefined;
      }

      const store = getContextStoreSync();
      const context = store.getStore() as Record<string, unknown> | undefined;

      if (!context) {
        panic(`No provider context present when accessing context key: ${String(prop)}`);
      }

      if (context[prop] == null) {
        panic(`Missing context key: ${String(prop)}; available keys: ${Object.keys(context).join(', ')}`);
      }

      return context[prop];
    },
    set() {
      panic('Cannot set properties on provider context. Use runWithProvider() instead.');
    },
    ownKeys() {
      const store = getContextStoreSync();
      const context = store.getStore() as object | undefined;
      return context ? Object.keys(context) : [];
    },
    getOwnPropertyDescriptor(_target, prop) {
      const store = getContextStoreSync();
      const context = store.getStore() as object | undefined;
      return context ? Object.getOwnPropertyDescriptor(context, prop) : undefined;
    },
    has(_target, prop) {
      const store = getContextStoreSync();
      const context = store.getStore() as object | undefined;
      return context ? prop in context : false;
    },
  },
);

const safeContextProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      const store = getContextStoreSync();
      const context = store.getStore() as Record<string | symbol, unknown> | undefined;
      return context?.[prop];
    },
    set() {
      panic('Cannot set properties on provider context. Use runWithProvider() instead.');
    },
    ownKeys() {
      const store = getContextStoreSync();
      return Object.keys((store.getStore() as object | undefined) ?? {});
    },
    getOwnPropertyDescriptor(_target, prop) {
      const store = getContextStoreSync();
      return Object.getOwnPropertyDescriptor((store.getStore() as object | undefined) ?? {}, prop);
    },
    has(_target, prop) {
      const store = getContextStoreSync();
      const context = store.getStore() as object | undefined;
      return context ? prop in context : false;
    },
  },
);

function panic(message: string): never {
  throw new Error(message);
}
