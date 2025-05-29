import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, z, ZodError } from 'zod';

export function validate(schema: AnyZodObject, property: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: unknown = req[property];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((error) => ({
          message: error.message,
          path: error.path,
        }));
        console.error('Validation errors:', formattedErrors);
        return res.status(400).json({
          status: false,
          message: 'Validation error',
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });

      next();
    }
  };
}

export function validateId(req: Request, res: Response, next: NextFunction) {
  const idSchema = z.number().int('ID must be an integer').positive('ID must be a positive number');
  try {
    idSchema.parse(Number(req.params.id));
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: false,
        message: 'Invalid ID format',
        errors: error.errors.map((e) => ({ message: e.message, path: e.path })),
      });
    }
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
}
