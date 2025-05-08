import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreate = vi.fn();
const mockEncoder = {
  encode: vi.fn((): number[] => {
    const arr: number[] = [];
    for (let i = 0; i < 10; i++) arr.push(0);
    return arr;
  }),
};
const mockConsume = vi.fn().mockResolvedValue(true);

vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

vi.mock('tiktoken', () => ({
  encoding_for_model: vi.fn(() => mockEncoder),
}));

vi.mock('rate-limiter-flexible', () => ({
  RateLimiterMemory: vi.fn(() => ({
    consume: mockConsume,
  })),
}));

vi.mock('p-limit', () => ({
  default: vi.fn(() => {
    return (fn: () => unknown) => fn();
  }),
}));

vi.mock('#utils/retry-utils.js', () => ({
  retryWithBackoff: vi.fn(<T>(fn: () => Promise<T>) => fn()),
}));

vi.mock('#utils/timeout-utils.js', () => ({
  promiseWithTimeout: vi.fn(<T>(promise: Promise<T>) => promise),
}));

vi.mock('#utils/json-utils.js', () => ({
  safeJsonParse: vi.fn(<T>(str: string, fallback: T): T => {
    try {
      return JSON.parse(str) as T;
    } catch {
      return fallback;
    }
  }),
}));

vi.mock('#config.js', () => ({
  default: {
    apiKey: 'test-api-key',
    maxConcurrency: 5,
    maxRPM: 100,
    maxTPM: 10000,
    model: 'gpt-3.5-turbo',
    requestTimeout: 30000,
  },
}));

import { OpenAIService } from '#services/openai/openai.service.js';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Default mock response' } }],
    });

    service = new OpenAIService();
  });

  it('should create an instance of OpenAIService', () => {
    expect(service).toBeInstanceOf(OpenAIService);
  });

  it('should estimate tokens correctly', () => {
    const tokenArray: number[] = [];
    for (let i = 0; i < 15; i++) tokenArray.push(0);
    mockEncoder.encode.mockReturnValueOnce(tokenArray);

    const result = service.estimateTokens('test');

    expect(result).toBe(15);
  });

  it('should handle JSON responses', async () => {
    const mockJson = { result: 'success' };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockJson) } }],
    });

    const result = await service.runJsonResponse('test', {});

    expect(result).toEqual(mockJson);
  });

  it('should handle raw text responses', async () => {
    // Setup
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '   trimmed text   ' } }],
    });

    const result = await service.runRawResponse('test', 'fallback');

    expect(result).toBe('trimmed text');
  });

  it('should return fallback for empty responses', async () => {
    const fallback = 'fallback text';
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '   ' } }],
    });

    const result = await service.runRawResponse('test', fallback);

    expect(result).toBe(fallback);
  });
});
