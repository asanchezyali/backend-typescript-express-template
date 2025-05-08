export async function promiseWithTimeout<T>(
  task: Promise<T>,
  timeoutInMs: number,
  errorMessage = 'The operation timed out',
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutInMs);
  });

  try {
    return await Promise.race([task, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
