import { OpenAI } from 'openai';
import pLimit from 'p-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { encoding_for_model, TiktokenModel } from 'tiktoken';

import config from '../../config.js';
import { safeJsonParse } from '../../utils/json-utils.js';
import { retryWithBackoff } from '../../utils/retry-utils.js';
import { promiseWithTimeout } from '../../utils/timeout-utils.js';

interface RateLimiterError extends Error {
  msBeforeNext: number;
}

export class OpenAIService {
  private concurrencyLimiter: ReturnType<typeof pLimit>;
  private encoder: ReturnType<typeof encoding_for_model>;
  private model: string;
  private openai: OpenAI;
  private requestTimeout: number;
  private rpmLimiter: RateLimiterMemory;
  private tpmLimiter: RateLimiterMemory;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
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
    this.concurrencyLimiter = pLimit(config.maxConcurrency);
    this.encoder = encoding_for_model(this.model as TiktokenModel);
  }
  estimateTokens(text: string): number {
    return this.encoder.encode(text).length;
  }

  async runJsonResponse<T>(prompt: string, fallback: T): Promise<T> {
    return this.executeWithLimits(async () => {
      const content = await this.getCompletion(prompt);
      return safeJsonParse(content, fallback);
    }, prompt);
  }

  async runRawResponse(prompt: string, fallback: string): Promise<string> {
    return this.executeWithLimits(async () => {
      const content = await this.getCompletion(prompt);
      return content.trim() || fallback;
    }, prompt);
  }

  private async executeWithLimits<T>(operation: () => Promise<T>, prompt: string): Promise<T> {
    const estimatedTokens = this.estimateTokens(prompt);

    try {
      await this.rpmLimiter.consume(1);
      await this.tpmLimiter.consume(estimatedTokens);
      return await this.concurrencyLimiter(() => retryWithBackoff(operation));
    } catch (error) {
      if (this.isRateLimiterError(error)) {
        const waitTimeSeconds = Math.ceil(error.msBeforeNext / 1000);
        throw new Error(`Rate limit exceeded. Please wait ${String(waitTimeSeconds)} seconds.`);
      }
      throw error;
    }
  }

  private async getCompletion(prompt: string): Promise<string> {
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

    return content;
  }

  private isRateLimiterError(error: unknown): error is RateLimiterError {
    return (
      error instanceof Error && 'msBeforeNext' in error && typeof (error as RateLimiterError).msBeforeNext === 'number'
    );
  }
}
