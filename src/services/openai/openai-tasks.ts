import { OpenAIService } from '#services/openai/openai.service.js';

export class OpenAITasks {
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async analyzeSentiment(content: string) {
    const prompt = `
      +++Reasoning
      Classify the sentiment of this text as positive, negative, or neutral.
      Respond with a single word only, no explanations.

      TEXT TO ANALYZE:
      ${content}
    `;

    const sentiment = await this.openaiService.runRawResponse(prompt, 'neutral');
    const normalizedSentiment = sentiment.trim().toLowerCase();

    if (!['negative', 'neutral', 'positive'].includes(normalizedSentiment)) {
      console.warn(`Invalid sentiment received: "${normalizedSentiment}", using "neutral"`);
      return 'neutral';
    }

    return normalizedSentiment;
  }

  async categorize(content: string) {
    const prompt = `
      +++Reasoning
      +++OutputFormat(JSON array)
      Identify 1-5 relevant categories for this text.
      Return only a JSON array of lowercase category strings.
      Format: ["category1", "category2", ...]
      No explanations or additional text.

      TEXT TO CATEGORIZE:
      ${content}
    `;

    const result = await this.openaiService.runJsonResponse<string[]>(prompt, []);

    if (!Array.isArray(result) || result.length === 0 || result.length > 5) {
      console.warn('Invalid category format, using default value');
      return ['Uncategorized'];
    }

    return result;
  }

  async extractKeywords(content: string) {
    const prompt = `
      +++Reasoning
      +++OutputFormat(JSON)
      Extract one primary keyword (main topic) and 1-5 secondary keywords from this text.
      Return only this JSON format:
      {
        "primary": "main keyword",
        "secondary": ["keyword1", "keyword2", ...]
      }

      TEXT TO ANALYZE:
      ${content}
    `;

    const defaultResult = { primary: '', secondary: [] };
    const result = await this.openaiService.runJsonResponse(prompt, defaultResult);

    if (!result.primary || !Array.isArray(result.secondary)) {
      console.warn('Invalid keyword format, using default value');
      return defaultResult;
    }

    return result;
  }

  async summarize(content: string) {
    const prompt = `
      +++OutputFormat(plain text)
      Create a concise summary capturing the main points of this text.
      Keep it brief, coherent, and focused on essential information.

      TEXT TO SUMMARIZE:
      ${content}
    `;

    return this.openaiService.runRawResponse(prompt, '');
  }
}
