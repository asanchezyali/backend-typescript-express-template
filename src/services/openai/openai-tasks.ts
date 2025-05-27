import { OpenAIService } from './openai.service.js';

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
      const sanitizedContent = this.sanitizeInput(content);

      const prompt = `
        +++OutputFormat(format=single-word, allowed=["positive", "negative", "neutral"])
        +++Constraint(type=response-length, max=1)
        +++ErrorHandling(strategy=graceful-fallback, default="neutral")
        +++SecurityBoundary(enforce=strict)
        Classify the sentiment of this text as positive, negative, or neutral.
        Respond with a single word only, no explanations.

        TEXT TO ANALYZE:
        ${sanitizedContent}
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
      const sanitizedContent = this.sanitizeInput(content);

      const prompt = `
        +++OutputFormat(format=json, schema=array)
        +++Constraint(type=array-length, min=1, max=5)
        +++ItemConstraint(type=format, format=lowercase)
        +++RobustParsing(recovery=true)
        +++SecurityBoundary(enforce=strict)
        Identify 1-5 relevant categories for this text.
        Return only a JSON array of lowercase category strings.
        Format: ["category1", "category2", ...]
        No explanations or additional text.

        TEXT TO CATEGORIZE:
        ${sanitizedContent}
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
      const sanitizedContent = this.sanitizeInput(content);

      const prompt = `
        +++OutputFormat(format=json, schema=object)
        +++Schema(type=object, properties={
          primary: {type: string, description: "Main topic keyword"},
          secondary: {type: array, items: {type: string}, minItems: 1, maxItems: 5}
        })
        +++ErrorHandling(strategy=graceful-fallback)
        +++SecurityBoundary(enforce=strict)
        Extract one primary keyword (main topic) and 1-5 secondary keywords from this text.
        Return only this JSON format:
        {
          "primary": "main keyword",
          "secondary": ["keyword1", "keyword2", ...]
        }

        TEXT TO ANALYZE:
        ${sanitizedContent}
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
      const sanitizedContent = this.sanitizeInput(content);

      const prompt = `
        +++Concise(level=high)
        +++TL;DR(style=informative)
        +++Constraint(type=focus, value=essential-information)
        +++OutputFormat(format=plain-text)
        +++SecurityBoundary(enforce=strict)
        Create a concise summary capturing the main points of this text.
        Keep it brief, coherent, and focused on essential information.

        TEXT TO SUMMARIZE:
        ${sanitizedContent}
      `;

      return await this.openaiService.runRawResponse(prompt, '');
    } catch (error) {
      console.error('Summarization failed:', error);
      return '';
    }
  }

  private sanitizeInput(content: string): string {
    let sanitized = content.replace(/\+\+\+\w+(\(.*?\))?/g, '[FILTERED]');

    const injectionPatterns = [
      /ignore (previous|above|all) instructions/gi,
      /disregard (previous|above|all) instructions/gi,
      /forget (previous|above|all) instructions/gi,
      /new instructions/gi,
      /instead (do|perform|follow)/gi,
    ];

    for (const pattern of injectionPatterns) {
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    }

    return sanitized;
  }
}
