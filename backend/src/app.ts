import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import habitsRouter from "./routes/habits.routes";
import logsRouter from "./routes/logs.routes";
import reflectionsRouter from "./routes/reflections.routes";
import dashboardRouter from "./routes/dashboard.routes";
import historyRouter from "./routes/history.routes";
import streaksRouter from "./routes/streaks.routes";
import profileRouter from "./routes/profile.routes";

export const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy that adds
// X-Forwarded-For. Without this, express-rate-limit throws
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every single request in production
// (this is almost certainly the "errors on deploy" you were seeing).
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.corsOrigins.includes("*") ? "*" : env.corsOrigins,
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/habits", habitsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/reflections", reflectionsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/history", historyRouter);
app.use("/api/streaks", streaksRouter);
app.use("/api/profile", profileRouter);

app.use(notFoundHandler);
app.use(errorHandler);
