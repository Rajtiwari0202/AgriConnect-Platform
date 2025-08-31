import { env } from "./env"; // <-- must be FIRST
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app = express();

if (env.NODE_ENV === "production") {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
}));

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});
app.use("/api/auth/", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = env.PORT;
  server.listen(port, "127.0.0.1", () => {
  log(`serving on port ${port}`);
});
})();
