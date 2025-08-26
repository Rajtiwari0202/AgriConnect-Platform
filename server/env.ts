import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("8080"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  SERVER_URL: z.string().url().default("http://localhost:8080"),
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),
  
  // Database
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  
  // Stripe (optional in development, required in production)
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // File storage
  UPLOAD_DIR: z.string().default("uploads"),
  
  // Company info
  COMPANY_NAME: z.string().default("AgriConnect"),
  SUPPORT_EMAIL: z.string().email().default("support@agriconnect.in"),
  GST_RATE: z.string().transform(Number).default("0"),
  
  // Security
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters").optional(),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  
  // External APIs (optional)
  WEATHER_API_KEY: z.string().optional(),
  GOV_SCHEMES_API_KEY: z.string().optional(),
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Production-specific validations
    if (env.NODE_ENV === "production") {
      if (!env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is required in production");
      }
      if (!env.JWT_SECRET) {
        throw new Error("JWT_SECRET is required in production");
      }
      if (env.SESSION_SECRET === "change_me_to_secure_random_string") {
        throw new Error("SESSION_SECRET must be changed from default in production");
      }
    }
    
    return env;
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error.message}`);
    }
    console.error("\n📋 Please check your .env file against .env.sample");
    process.exit(1);
  }
}

export const env = validateEnv();
export default env;