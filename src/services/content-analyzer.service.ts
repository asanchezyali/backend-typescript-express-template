import { summarize, categorize, extractKeywords, analyzeSentiment } from './openai-tasks.js';

export interface ContentAnalysis {
  summary: string;
  categories: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  sentiment: string;
}

export async function analyzeContent(content: string): Promise<ContentAnalysis> {
  try {
    const [summary, categories, keywords, sentiment] = await Promise.all([
      summarize(content),
      categorize(content),
      extractKeywords(content),
      analyzeSentiment(content),
    ]);

    return {
      summary,
      categories,
      primaryKeyword: keywords.primary,
      secondaryKeywords: keywords.secondary,
      sentiment,
    };
  } catch (error) {
    console.error('Content analysis failed:', error);
    if (error instanceof Error) {
      throw new Error('Failed to analyze content: ' + error.message);
    } else {
      throw new Error('Failed to analyze content: Unknown error');
    }
  }
}
