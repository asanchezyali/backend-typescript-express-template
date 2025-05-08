export async function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= maxRetries - 1) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.toString().toLowerCase() : '';
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('rate limit');

      if (isRateLimitError) {
        const backoffTime = Math.min(2 ** retryCount * 1000, 15000);
        console.warn(`Retry ${String(retryCount + 1)} after ${String(backoffTime)}ms due to rate limiting`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        retryCount++;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries reached');
}

export default { retryWithBackoff };
