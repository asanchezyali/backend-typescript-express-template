import { OpenAI } from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Config } from '#config.js';
import { safeJsonParse } from '#utils/json-utils.js';
import { promiseWithTimeout } from '#utils/timeout-utils.js';

export class OpenAIService {
  private openai: OpenAI;
  private rpmLimiter: RateLimiterMemory;
  private tpmLimiter: RateLimiterMemory;
  private model: string;
  private requestTimeout: number;

  constructor(config: Config) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model;
    this.requestTimeout = config.requestTimeout;
    this.rpmLimiter = new RateLimiterMemory({
      points: config.maxRPM,
      duration: 60,
    });
    this.tpmLimiter = new RateLimiterMemory({
      points: config.maxTPM,
      duration: 60,
    });
  }

  async run<T>(prompt: string, fallback: T): Promise<T> {
    await this.rpmLimiter.consume(1);
    await this.tpmLimiter.consume(1);

    const response = await promiseWithTimeout(
      this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      }),
      this.requestTimeout,
    );

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    return safeJsonParse(content, fallback);
  }
}
