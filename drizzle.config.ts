import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isProd ? "postgresql" : "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
