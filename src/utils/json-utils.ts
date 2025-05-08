export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  let initialParseError: Error | null = null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    initialParseError = error as Error;
    try {
      const cleaned = jsonString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch (innerError) {
      console.error('Error parsing JSON (attempt 1, without cleaning):', initialParseError);
      console.error('Error parsing JSON (attempt 2, after cleaning):', innerError);
      console.error('Returning fallback value.');
      return fallback;
    }
  }
}
