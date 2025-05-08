process.env.OPENAI_API_KEY = 'test-api-key';
process.env.NODE_ENV = 'test';

import app from '#app.js';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AnalyzeSuccessResponse, ErrorResponse, HealthResponse } from '../types/api.types.js';

vi.mock('#services/content-analyzer.service.js', () => {
  return {
    ContentAnalyzerService: vi.fn().mockImplementation(() => ({
      analyzeContent: vi.fn().mockResolvedValue({
        readabilityScore: 85,
        sentiment: 'positive',
        summary: 'This is a test summary of the analyzed content.',
        topKeywords: ['growth', 'analysis', 'content'],
      }),
    })),
  };
});

describe('Analyze API End-to-End Tests', () => {
  let request: ReturnType<typeof supertest>;

  beforeAll(() => {
    request = supertest(app);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should successfully analyze content', async () => {
    const testRequest = {
      content: 'This is some test content to analyze in an end-to-end test.',
      title: 'Test Article',
    };

    const response = await request.post('/api/analyze').send(testRequest).expect(200).expect('Content-Type', /json/);

    const responseBody = response.body as AnalyzeSuccessResponse;
    expect(responseBody.status).toBe('success');
    expect(responseBody.data).toBeDefined();

    const { data } = responseBody;
    expect(data.readabilityScore).toBeDefined();
    expect(data.sentiment).toBeDefined();
    expect(data.summary).toBeDefined();
    expect(data.topKeywords).toBeDefined();
    expect(data.readabilityScore).toBe(85);
    expect(data.sentiment).toBe('positive');
    expect(data.summary).toBe('This is a test summary of the analyzed content.');
    expect(data.topKeywords).toHaveLength(3);
  });

  it('should return 400 when content is missing', async () => {
    const invalidRequest = {
      title: 'Test without content',
    };

    const response = await request.post('/api/analyze').send(invalidRequest).expect(400).expect('Content-Type', /json/);

    const responseBody = response.body as ErrorResponse;
    expect(responseBody.status).toBe('error');
    expect(responseBody.message).toBe('Missing required field: content');
  });

  it('health endpoint should return status ok', async () => {
    const response = await request.get('/api/health').expect(200).expect('Content-Type', /json/);

    const responseBody = response.body as HealthResponse;
    expect(responseBody.status).toBe('ok');
    expect(responseBody.model).toBeDefined();
    expect(responseBody.timestamp).toBeDefined();
  });
});
