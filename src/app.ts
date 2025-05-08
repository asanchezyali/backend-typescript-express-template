import express from 'express';
import analyzeRoutes from '#routes/analyze.routes.js';
import { swaggerSpec } from '#swagger.js';
import swaggerUI from 'swagger-ui-express';

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use('/', analyzeRoutes);

export default app;
