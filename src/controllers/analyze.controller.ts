import { Request, Response } from 'express';
import { AnalyzeRequest, AnalysisResponse, ErrorResponse } from '#types/api.types.js';
import { analyzeContent } from '#services/content-analyzer.service.js';
import config from '#config.js';

export class AnalyzeController {
  public static analyze = async (
    req: Request<{}, {}, AnalyzeRequest>,
    res: Response<AnalysisResponse | ErrorResponse>,
  ): Promise<void> => {
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

  public static health(req: Request, res: Response) {
    res.json({
      status: 'ok',
      model: config.model,
      timestamp: new Date().toISOString(),
    });
  }
}
