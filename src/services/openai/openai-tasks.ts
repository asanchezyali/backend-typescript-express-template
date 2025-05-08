import config from '#config.js';
import { OpenAIService } from '#services/openai/openai.service.js';
import { retryWithBackoff } from '#utils/retry-utils.js';
import pLimit from 'p-limit';

export class OpenAITasks {
  private limiter: ReturnType<typeof pLimit>;
  private openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
    this.limiter = pLimit(config.maxConcurrency);
  }

  async analyzeSentiment(content: string) {
    const prompt = `
      +++Reasoning
      Classify the sentiment of this text as positive, negative, or neutral.
      Respond with a single word only, no explanations.

      TEXT TO ANALYZE:
      ${content}
    `;
    try {
      const result = await this.limiter(() =>
        retryWithBackoff(async () => {
          const sentiment = await this.openaiService.runRawResponse(prompt, 'neutral');
          const normalizedSentiment = sentiment.trim().toLowerCase();
          if (!['negative', 'neutral', 'positive'].includes(normalizedSentiment)) {
            console.warn(`Invalid sentiment received: "${normalizedSentiment}", using "neutral"`);
            return 'neutral';
          }
          return normalizedSentiment;
        }),
      );

      return result;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
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
    const result = await this.limiter(() =>
      retryWithBackoff(async () => {
        const rawResponse = await this.openaiService.runJsonResponse<string[]>(prompt, []);
        return rawResponse;
      }),
    );
    if (!Array.isArray(result) || result.length === 0 || result.length > 5) {
      console.warn('Invalid category format, using default value');
      return ['Uncategorized'];
    }
    return result;
  }

  extractKeywords = async (content: string) => {
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
    const result = await this.limiter(() =>
      retryWithBackoff(async () => {
        const rawResponse = await this.openaiService.runJsonResponse<{ primary: string; secondary: string[] }>(
          prompt,
          defaultResult,
        );
        return rawResponse;
      }),
    );
    if (!result.primary || !Array.isArray(result.secondary)) {
      console.warn('Invalid keyword format, using default value');
      return defaultResult;
    }
    return result;
  };

  async summarize(content: string) {
    const prompt = `
      +++OutputFormat(plain text)
      Create a concise summary capturing the main points of this text.
      Keep it brief, coherent, and focused on essential information.

      TEXT TO SUMMARIZE:
      ${content}
    `;
    try {
      const result = await this.limiter(() =>
        retryWithBackoff(async () => {
          const rawResponse = await this.openaiService.runRawResponse(prompt, '');
          return rawResponse;
        }),
      );

      return result;
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  }
}
