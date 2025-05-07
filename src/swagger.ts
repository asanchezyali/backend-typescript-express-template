import swaggerJSDoc from 'swagger-jsdoc';
const port = process.env.PORT ?? '9001';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GrowthX API',
      version: '1.0.0',
      description: 'API documentation for GrowthX application',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
