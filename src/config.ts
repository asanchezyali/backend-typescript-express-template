import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MAX_CONCURRENCY: z.string().default("8"),
  MAX_RPM: z.string().default("100"),
  MAX_TPM: z.string().default("10000"),
  REQUEST_TIMEOUT: z.string().default("30000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  OPENAI_MODEL: z.string().default("gpt-3.5-turbo"),
  OPENAI_API_KEY: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}
const parsedEnv = env.data;

export const config = {
  port: parsedEnv.PORT,
  maxConcurrency: parseInt(parsedEnv.MAX_CONCURRENCY, 10),
  maxRPM: parseInt(parsedEnv.MAX_RPM, 10),
  maxTPM: parseInt(parsedEnv.MAX_TPM, 10),
  requestTimeout: parseInt(parsedEnv.REQUEST_TIMEOUT, 10),
  nodeEnv: parsedEnv.NODE_ENV,
  model: parsedEnv.OPENAI_MODEL,
  apiKey: parsedEnv.OPENAI_API_KEY,
};

export const isProduction = config.nodeEnv === "production";
export const isDevelopment = config.nodeEnv === "development";

export default config;
export type Config = typeof config;
