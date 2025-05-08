import express, { Request, Response, RequestHandler } from 'express';
import { AnalyzeRequest, AnalysisResponse, ErrorResponse } from '#types/api.types.js';
import config from '#config.js';
import { swaggerSpec } from '#swagger.js';
import swaggerUI from 'swagger-ui-express';
import { analyzeContent } from '#services/content-analyzer.service.js';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const analyzeHandler: RequestHandler = async (req, res) => {
  try {
    const { title, content } = req.body as AnalyzeRequest;

    if (!content) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required field: content',
      } as ErrorResponse);
      return;
    }

    const contentToAnalyze = title ? `${title}\n\n${content}` : content;
    const analysis = await analyzeContent(contentToAnalyze);

    res.status(200).json({
      status: 'success',
      data: analysis,
    } as AnalysisResponse);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
};

app.post('/analyze', analyzeHandler);
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: config.model,
    timestamp: new Date().toISOString(),
  });
});

export default app;
