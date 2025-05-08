import { OpenAIService } from '#services/openai/openai.service.js';

export interface KeywordResult {
  primary: string;
  secondary: string[];
}

export class OpenAITasks {
  private openaiService: OpenAIService;

  constructor(openaiService?: OpenAIService) {
    this.openaiService = openaiService ?? new OpenAIService();
  }

  async analyzeSentiment(content: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return 'neutral';
    }
  }

  async categorize(content: string): Promise<string[]> {
    try {
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
    } catch (error) {
      console.error('Categorization failed:', error);
      return ['Uncategorized'];
    }
  }

  async extractKeywords(content: string): Promise<KeywordResult> {
    try {
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
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return { primary: '', secondary: [] };
    }
  }

  async summarize(content: string): Promise<string> {
    try {
      const prompt = `
        +++OutputFormat(plain text)
        Create a concise summary capturing the main points of this text.
        Keep it brief, coherent, and focused on essential information.

        TEXT TO SUMMARIZE:
        ${content}
      `;

      return await this.openaiService.runRawResponse(prompt, '');
    } catch (error) {
      console.error('Summarization failed:', error);
      return '';
    }
  }
}
