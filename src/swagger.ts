import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerDocs = {
  info: {
    description: 'API for analyzing text content using AI',
    title: 'Content Analysis API',
    version: '1.0.0',
  },
  openapi: '3.0.0',
  paths: {
    '/analyze': {
      post: {
        description: 'Performs content analysis using OpenAI to extract summary, categories, keywords, and sentiment',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  content: {
                    description: 'The text content to analyze',
                    type: 'string',
                  },
                  title: {
                    description: 'Optional title of the content',
                    type: 'string',
                  },
                },
                required: ['content'],
                type: 'object',
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    data: {
                      properties: {
                        categories: {
                          example: ['technology', 'science'],
                          items: {
                            type: 'string',
                          },
                          type: 'array',
                        },
                        primaryKeyword: {
                          example: 'artificial intelligence',
                          type: 'string',
                        },
                        secondaryKeywords: {
                          example: ['machine learning', 'data science'],
                          items: {
                            type: 'string',
                          },
                          type: 'array',
                        },
                        sentiment: {
                          enum: ['positive', 'negative', 'neutral'],
                          example: 'positive',
                          type: 'string',
                        },
                        summary: {
                          example: 'A brief summary of the content',
                          type: 'string',
                        },
                      },
                      type: 'object',
                    },
                    status: {
                      example: 'success',
                      type: 'string',
                    },
                  },
                  type: 'object',
                },
              },
            },
            description: 'Successful analysis',
          },
          400: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    message: {
                      example: 'Missing required field: content',
                      type: 'string',
                    },
                    status: {
                      example: 'error',
                      type: 'string',
                    },
                  },
                  type: 'object',
                },
              },
            },
            description: 'Bad request - Missing required fields',
          },
          500: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    message: {
                      example: 'Internal server error',
                      type: 'string',
                    },
                    status: {
                      example: 'error',
                      type: 'string',
                    },
                  },
                  type: 'object',
                },
              },
            },
            description: 'Internal server error',
          },
        },
        summary: 'Analyze text content using AI',
        tags: ['Analysis'],
      },
    },
    '/health': {
      get: {
        description: 'Returns the current status of the API and the OpenAI model being used',
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    model: {
                      example: 'gpt-4',
                      type: 'string',
                    },
                    status: {
                      example: 'ok',
                      type: 'string',
                    },
                    timestamp: {
                      example: '2024-05-07T10:30:00Z',
                      format: 'date-time',
                      type: 'string',
                    },
                  },
                  type: 'object',
                },
              },
            },
            description: 'System health information',
          },
        },
        summary: 'Health check endpoint',
        tags: ['System'],
      },
    },
  },
  servers: [
    {
      description: 'API Version 1',
      url: '/api',
    },
  ],
};

const options = {
  apis: [],
  definition: swaggerDocs,
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
export type SwaggerDocs = typeof swaggerDocs;
