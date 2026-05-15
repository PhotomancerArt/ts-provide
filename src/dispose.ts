type DisposableObject = {
  [Symbol.dispose]?: () => void | Promise<void>;
  [Symbol.asyncDispose]?: () => Promise<void>;
};

export function extractDispose<T>(obj: T): {
  dispose: (() => void | Promise<void>) | undefined;
  asyncDispose: (() => Promise<void>) | undefined;
  rest: Omit<T, typeof Symbol.dispose | typeof Symbol.asyncDispose>;
} {
  const { [Symbol.dispose]: dispose, [Symbol.asyncDispose]: asyncDispose, ...rest } =
    (obj ?? {}) as T & DisposableObject;

  return { dispose, asyncDispose, rest };
}

export async function disposeOf(provided: unknown) {
  if (provided == null || typeof provided !== 'object') {
    return;
  }

  const disposable = provided as DisposableObject;

  const dispose = disposable[Symbol.dispose];
  if (dispose) {
    await dispose();
  }

  const asyncDispose = disposable[Symbol.asyncDispose];
  if (asyncDispose) {
    await asyncDispose();
  }
}
