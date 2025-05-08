import dotenv from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const envSchema = z.object({
  MAX_CONCURRENCY: z.string().default('8'),
  MAX_RPM: z.string().default('100'),
  MAX_TPM: z.string().default('10000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('o3-mini'),
  PORT: z.coerce.number().default(3000),
  REQUEST_TIMEOUT: z.string().default('30000'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.format());
  throw new Error('Invalid environment variables');
}
const parsedEnv = env.data;

export const config = {
  apiKey: parsedEnv.OPENAI_API_KEY,
  maxConcurrency: parseInt(parsedEnv.MAX_CONCURRENCY, 10),
  maxRPM: parseInt(parsedEnv.MAX_RPM, 10),
  maxTPM: parseInt(parsedEnv.MAX_TPM, 10000),
  model: parsedEnv.OPENAI_MODEL,
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  requestTimeout: parseInt(parsedEnv.REQUEST_TIMEOUT, 10),
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';

export default config;
export type Config = typeof config;
