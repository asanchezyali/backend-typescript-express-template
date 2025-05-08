import express, { Request, Response } from 'express';
import config from '#config.js';
import { swaggerSpec } from '#swagger.js';
import swaggerUI from 'swagger-ui-express';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.post('/analyze', async (req: Request, res: Response) => {
  const { title, content } = req.body;

  res.status(200).send({ message: 'Analysis complete' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: config.model,
    timestamp: new Date().toISOString(),
  });
});

export default app;
