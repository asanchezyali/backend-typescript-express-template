export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('JSON parsing error:', error);
    } else {
      console.error('Unexpected error:', error);
    }
    try {
      const cleaned = jsonString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch {
      const preview = jsonString.slice(0, 50) + (jsonString.length > 50 ? '...' : '');
      console.debug(`Notice: Using fallback value. Content preview: "${preview}"`);
      return fallback;
    }
  }
}
