import { OpenAIService } from '#services/openai-services.js';
import { retryWithBackoff } from '#utils/retry-utils.js';
import pLimit from 'p-limit';
import config from '#config.js';

const openaiService = new OpenAIService(config);
const limiter = pLimit(config.maxConcurrency);

export const summarize = async (content: string) => {
  const prompt = `
    Provide a concise and clear summary of the following text, capturing the main points 
    and preserving the essential meaning. The summary should be coherent and easy to read.

    TEXT TO SUMMARIZE:
    ${content}
  `;
  return limiter(() => retryWithBackoff(() => openaiService.run<string>(prompt, '')));
};

export const categorize = async (content: string) => {
  const prompt = `
    Analyze the following text and determine the most relevant categories it belongs to.
    Return EXACTLY between 1 and 5 categories as a JSON array of strings.
    The categories should be concise names that describe the main topic.
    The response format must be only: ["Category1", "Category2", ...]
    Do not include any additional explanation, just the JSON array.

    TEXT TO CATEGORIZE:
    ${content}
  `;
  const result = await limiter(() => retryWithBackoff(() => openaiService.run<string[]>(prompt, [])));
  if (!Array.isArray(result) || result.length === 0 || result.length > 5) {
    console.warn('Invalid category format, using default value');
    return ['Uncategorized'];
  }
  return result;
};

export const extractKeywords = async (content: string) => {
  const prompt = `
    Analyze the following text and extract:
    1. A single primary keyword that represents the main topic.
    2. Between 1 and 5 secondary keywords that represent important concepts.

    Return only a JSON object with the following exact format:
    {
      "primary": "main keyword",
      "secondary": ["secondary keyword 1", "secondary keyword 2", ...]
    }

    Do not include explanations, just the JSON object.

    TEXT TO ANALYZE:
    ${content}
      `;
  const defaultResult = { primary: '', secondary: [] };
  const result = await limiter(() =>
    retryWithBackoff(() => openaiService.run<{ primary: string; secondary: string[] }>(prompt, defaultResult)),
  );
  if (!result.primary || !Array.isArray(result.secondary)) {
    console.warn('Invalid keyword format, using default value');
    return defaultResult;
  }
  return result;
};

export const analyzeSentiment = async (content: string) => {
  const prompt = `
    Analyze the overall sentiment of the following text.

    Your answer must be EXACTLY ONE of these three words:
    - "positive"
    - "negative" 
    - "neutral"

    Respond with a single word, with no explanations or extra punctuation.

    TEXT TO ANALYZE:
    ${content}
  `;
  const sentiment = await limiter(() => retryWithBackoff(() => openaiService.run<string>(prompt, 'neutral')));
  const normalizedSentiment = sentiment.trim().toLowerCase();
  if (!['positive', 'negative', 'neutral'].includes(normalizedSentiment)) {
    console.warn(`Invalid sentiment received: "${sentiment}", using "neutral"`);
    return 'neutral';
  }
  return normalizedSentiment;
};
