import { OpenAITasks } from './openai/openai-tasks.js';

export class ContentAnalyzerService {
  private openaiTasks: OpenAITasks;

  constructor() {
    this.openaiTasks = new OpenAITasks();
  }

  async analyzeContent(content: string) {
    const [categories, summary, keywords, sentiment] = await Promise.all([
      this.openaiTasks.categorize(content),
      this.openaiTasks.summarize(content),
      this.openaiTasks.extractKeywords(content),
      this.openaiTasks.analyzeSentiment(content),
    ]);

    return {
      categories,
      primaryKeyword: keywords.primary,
      secondaryKeywords: keywords.secondary,
      sentiment,
      summary,
    };
  }
}
