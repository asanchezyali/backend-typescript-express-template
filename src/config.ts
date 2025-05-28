import dotenv from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PASSWORD: z.string(),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_USER: z.string(),
  FRONTEND_URL: z.string().optional().default('http://localhost:3000'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRE_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_SECRET: z.string(),
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
  dbHost: parsedEnv.DB_HOST,
  dbName: parsedEnv.DB_NAME,
  dbPassword: parsedEnv.DB_PASSWORD,
  dbPort: parsedEnv.DB_PORT,
  dbUser: parsedEnv.DB_USER,
  emailHost: parsedEnv.EMAIL_HOST,
  emailPassword: parsedEnv.EMAIL_PASSWORD,
  emailPort: parsedEnv.EMAIL_PORT,
  emailUser: parsedEnv.EMAIL_USER,
  frontendUrl: parsedEnv.FRONTEND_URL || 'http://localhost:3000',
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  jwtRefreshExpireIn: parsedEnv.JWT_REFRESH_EXPIRE_IN,
  jwtRefreshSecret: parsedEnv.JWT_REFRESH_SECRET,
  jwtSecret: parsedEnv.JWT_SECRET,
  maxConcurrency: parseInt(parsedEnv.MAX_CONCURRENCY, 10),
  maxRPM: parseInt(parsedEnv.MAX_RPM, 10),
  maxTPM: parseInt(parsedEnv.MAX_TPM, 10000),
  model: parsedEnv.OPENAI_MODEL,
  nodeEnv: parsedEnv.NODE_ENV,
  openaiApiKey: parsedEnv.OPENAI_API_KEY,
  port: parsedEnv.PORT,
  requestTimeout: parseInt(parsedEnv.REQUEST_TIMEOUT, 10),
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';

export default config;
export type Config = typeof config;
