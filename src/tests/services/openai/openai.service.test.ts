// Import vitest first
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create mock objects that we can reference directly for test-specific customization
const mockCreate = vi.fn();
// Add proper typing to the encoder mock with explicit number[] return type and array initialization
const mockEncoder = {
  encode: vi.fn((): number[] => {
    const arr: number[] = [];
    for (let i = 0; i < 10; i++) arr.push(0);
    return arr;
  }),
};
const mockConsume = vi.fn().mockResolvedValue(true);

// Mock all dependencies BEFORE importing the service
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

// Fixed p-limit mock to properly return a function that accepts a function
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

// Import the service AFTER all mocks
import { OpenAIService } from '#services/openai/openai.service.js';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default responses for mocks
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Default mock response' } }],
    });

    // Create service instance
    service = new OpenAIService();
  });

  // Test 1: Should create a valid service instance
  it('should create an instance of OpenAIService', () => {
    expect(service).toBeInstanceOf(OpenAIService);
  });

  // Test 2: Should estimate tokens correctly
  it('should estimate tokens correctly', () => {
    // Setup - create a specific length array with explicit number[] typing and initialization
    const tokenArray: number[] = [];
    for (let i = 0; i < 15; i++) tokenArray.push(0);
    mockEncoder.encode.mockReturnValueOnce(tokenArray);

    // Execute
    const result = service.estimateTokens('test');

    // Assert
    expect(result).toBe(15);
  });

  // Test 3: JSON response handling
  it('should handle JSON responses', async () => {
    // Setup
    const mockJson = { result: 'success' };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(mockJson) } }],
    });

    // Execute
    const result = await service.runJsonResponse('test', {});

    // Assert
    expect(result).toEqual(mockJson);
  });

  // Test 4: Raw text response handling
  it('should handle raw text responses', async () => {
    // Setup
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '   trimmed text   ' } }],
    });

    // Execute
    const result = await service.runRawResponse('test', 'fallback');

    // Assert
    expect(result).toBe('trimmed text');
  });

  // Test 5: Empty response fallback
  it('should return fallback for empty responses', async () => {
    // Setup
    const fallback = 'fallback text';
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '   ' } }],
    });

    // Execute
    const result = await service.runRawResponse('test', fallback);

    // Assert
    expect(result).toBe(fallback);
  });
});
