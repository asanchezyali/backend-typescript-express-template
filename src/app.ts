import cors from 'cors';
import express from 'express';
import swaggerUI from 'swagger-ui-express';

import analyzeRoutes from './routes/analyze.routes.js';
import swaggerSpec from './swagger.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// API routes with versioning
app.use('/api', analyzeRoutes);

export default app;
