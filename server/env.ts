import dotenv from 'dotenv';
dotenv.config(); // <-- must run first, before using process.env

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("8080"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  SERVER_URL: z.string().url().default("http://localhost:8080"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPLOAD_DIR: z.string().default("uploads"),
  COMPANY_NAME: z.string().default("AgriConnect"),
  SUPPORT_EMAIL: z.string().email().default("support@agriconnect.in"),
  GST_RATE: z.string().transform(Number).default("0"),
  JWT_SECRET: z.string().min(32).optional(),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  WEATHER_API_KEY: z.string().optional(),
  GOV_SCHEMES_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Environment validation failed:");
  parsedEnv.error.errors.forEach(err => {
    console.error(`  - ${err.path.join(".")}: ${err.message}`);
  });
  process.exit(1);
}

export const env = parsedEnv.data;
