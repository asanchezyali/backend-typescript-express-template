export async function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let retryCount = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;

      if (retryCount >= maxRetries) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.toString().toLowerCase() : '';
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('rate limit');

      if (isRateLimitError) {
        const backoffTime = Math.min(2 ** retryCount * 1000, 15000);
        console.warn(`Retry ${retryCount} after ${backoffTime}ms due to rate limiting`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      } else {
        throw error;
      }
    }
  }
}

export default { retryWithBackoff };
