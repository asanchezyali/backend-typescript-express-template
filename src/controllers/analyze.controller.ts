import config from '#config.js';
import { ContentAnalyzerService } from '#services/content-analyzer.service.js';
import { AnalysisResponse, AnalyzeRequest, ErrorResponse } from '#types/api.types.js';
import { Request, Response } from 'express';

const ERROR_MESSAGES = {
  MISSING_CONTENT: 'Missing required field: content',
  UNKNOWN_ERROR: 'Unknown error',
} as const;

const API_STATUS = {
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

interface HealthResponse {
  model: string;
  status: 'ok';
  timestamp: string;
}

const contentAnalyzerService = new ContentAnalyzerService();

export const AnalyzeController = {
  analyze: async (
    req: Request<Record<string, never>, unknown, AnalyzeRequest>,
    res: Response<AnalysisResponse | ErrorResponse>,
  ): Promise<void> => {
    try {
      const { content, title } = req.body;
      if (!content) {
        res.status(400).json({
          message: ERROR_MESSAGES.MISSING_CONTENT,
          status: API_STATUS.ERROR,
        });
        return;
      }

      const contentToAnalyze = title ? `${title}\n\n${content}` : content;
      const analysis = await contentAnalyzerService.analyzeContent(contentToAnalyze);
      const formattedAnalysis = {
        ...analysis,
      };
      res.status(200).json({
        data: formattedAnalysis,
        status: API_STATUS.SUCCESS,
      });
    } catch (error: unknown) {
      console.error('Analysis error:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
        status: API_STATUS.ERROR,
      });
    }
  },

  health: (req: Request, res: Response<HealthResponse>): void => {
    res.json({
      model: config.model,
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  },
};
