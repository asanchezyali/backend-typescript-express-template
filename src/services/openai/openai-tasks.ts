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
      You are a sentiment analysis expert. Your task is to determine the sentiment of the text provided.
      Sentiment can be classified as:
      - Positive: Indicates a favorable or optimistic sentiment.
      - Negative: Indicates an unfavorable or pessimistic sentiment.
      - Neutral: Indicates a sentiment that is neither positive nor negative.
      Your task is to analyze the text and classify it into one of these three categories.
      Respond with a single word, with no explanations or extra punctuation.

      TEXT TO ANALYZE:
      ${content}
    `;
    const sentiment = await this.limiter(() =>
      retryWithBackoff(async () => {
        const rawResponse = await this.openaiService.run<string>(prompt, 'neutral');
        console.log('Raw sentiment response:', rawResponse);
        return rawResponse;
      }),
    );
    const normalizedSentiment = sentiment.trim().toLowerCase();
    if (!['negative', 'neutral', 'positive'].includes(normalizedSentiment)) {
      console.warn(`Invalid sentiment received: "${sentiment}", using "neutral"`);
      return 'neutral';
    }
    return normalizedSentiment;
  }

  async categorize(content: string) {
    const prompt = `
      +++Reasoning
      +++OutputFormat(JSON array)
      You are a content categorization expert. Your task is to analyze the text provided and categorize it into relevant topics.
      The categories should be concise names that describe the main topic.
      The categories should be in a JSON array format, with each category being a string.
      The categories should be relevant to the content and should not include any additional explanations or text.
      The categories should be in lowercase and should not include any special characters or numbers.
      Return EXACTLY between 1 and 5 categories as a JSON array of strings.
      The categories should be concise names that describe the main topic.
      The response format must be only: ["Category1", "Category2", ...]
      Do not include any additional explanation, just the JSON array.

      TEXT TO CATEGORIZE:
      ${content}
    `;
    const result = await this.limiter(() =>
      retryWithBackoff(async () => {
        const rawResponse = await this.openaiService.run<string[]>(prompt, []);
        console.log('Raw categories response:', rawResponse);
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
      You are a keyword extraction expert. Your task is to analyze the text provided and extract the main keywords.
      The primary keyword should represent the main topic of the text.
      The secondary keywords should represent important concepts related to the primary keyword.
      The primary keyword should be a single word or a short phrase.
      The secondary keywords should be a list of 1 to 5 words or short phrases.
      The response format must be a JSON object with the following structure:
      {
        "primary": "main keyword",
        "secondary": ["secondary keyword 1", "secondary keyword 2", ...]
      }  
      Do not include explanations, just the JSON object.

      TEXT TO ANALYZE:
      ${content}
    `;
    const defaultResult = { primary: '', secondary: [] };
    const result = await this.limiter(() =>
      retryWithBackoff(async () => {
        const rawResponse = await this.openaiService.run<{ primary: string; secondary: string[] }>(
          prompt,
          defaultResult,
        );
        console.log('Raw keywords response:', rawResponse);
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
    console.log('Content to summarize:', content);
    const prompt = `
      +++OutputFormat(plain text)
      You are a summarization expert. Your task is to summarize the text provided.
      The summary should be concise and capture the main points of the text.
      The summary should be in plain text format, with no additional explanations or text.
      The summary should be coherent and easy to read.
    
      TEXT TO SUMMARIZE:
      ${content}
    `;
    return this.limiter(() =>
      retryWithBackoff(async () => {
        const rawResponse = await this.openaiService.run<string>(prompt, '');
        console.log('Raw summary response:', rawResponse);
        return rawResponse;
      }),
    );
  }
}
