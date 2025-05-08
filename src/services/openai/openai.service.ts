import config from '#config.js';
import { safeJsonParse } from '#utils/json-utils.js';
import { promiseWithTimeout } from '#utils/timeout-utils.js';
import { OpenAI } from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export class OpenAIService {
  private model: string;
  private openai: OpenAI;
  private requestTimeout: number;
  private rpmLimiter: RateLimiterMemory;
  private tpmLimiter: RateLimiterMemory;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model;
    this.requestTimeout = config.requestTimeout;
    this.rpmLimiter = new RateLimiterMemory({
      duration: 60,
      points: config.maxRPM,
    });
    this.tpmLimiter = new RateLimiterMemory({
      duration: 60,
      points: config.maxTPM,
    });
  }

  async run<T>(prompt: string, fallback: T): Promise<T> {
    await this.rpmLimiter.consume(1);
    await this.tpmLimiter.consume(1);

    const response = await promiseWithTimeout(
      this.openai.chat.completions.create({
        messages: [{ content: prompt, role: 'user' }],
        model: this.model,
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
