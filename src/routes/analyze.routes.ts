import { Router } from 'express';

import { AnalyzeController } from '../controllers/analyze.controller.js';

const analyzeRouter = Router();

analyzeRouter.post('/analyze', (req, res) => AnalyzeController.analyze(req, res));
analyzeRouter.get('/health', (req, res) => {
  AnalyzeController.health(req, res);
});

export default analyzeRouter;
