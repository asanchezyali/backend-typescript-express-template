import { Router } from 'express';
import { AnalyzeController } from '#controllers/analyze.controller.js';

const analyzeRouter = Router();

analyzeRouter.post('/analyze', AnalyzeController.analyze);
analyzeRouter.get('/health', AnalyzeController.health);

export default analyzeRouter;
