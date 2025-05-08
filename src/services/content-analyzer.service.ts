import { OpenAITasks } from './openai/openai-tasks.js';

export class ContentAnalyzerService {
  private openaiTasks: OpenAITasks;

  constructor(openaiTasks?: OpenAITasks) {
    this.openaiTasks = openaiTasks ?? new OpenAITasks();
  }

  async analyzeContent(content: string) {
    try {
      if (!content || typeof content !== 'string') {
        return this.getDefaultAnalysisResult();
      }

      const tasks = {
        categories: this.openaiTasks.categorize(content).catch(() => ['uncategorized']),
        keywords: this.openaiTasks.extractKeywords(content).catch(() => ({ primary: '', secondary: [] })),
        sentiment: this.openaiTasks.analyzeSentiment(content).catch(() => 'neutral'),
        summary: this.openaiTasks.summarize(content).catch(() => ''),
      };

      const results = await Promise.allSettled([tasks.categories, tasks.summary, tasks.keywords, tasks.sentiment]);

      const [categoriesResult, summaryResult, keywordsResult, sentimentResult] = results;

      return {
        categories: this.extractSettledValue(categoriesResult, ['Uncategorized']),
        primaryKeyword: this.extractSettledValue(keywordsResult, { primary: '', secondary: [] }).primary,
        secondaryKeywords: this.extractSettledValue(keywordsResult, { primary: '', secondary: [] }).secondary,
        sentiment: this.extractSettledValue(sentimentResult, 'neutral'),
        summary: this.extractSettledValue(summaryResult, ''),
      };
    } catch (error) {
      console.error('Content analysis failed:', error);
      return this.getDefaultAnalysisResult();
    }
  }

  private extractSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  private getDefaultAnalysisResult() {
    return {
      categories: ['Uncategorized'],
      primaryKeyword: '',
      secondaryKeywords: [],
      sentiment: 'neutral',
      summary: '',
    };
  }
}
