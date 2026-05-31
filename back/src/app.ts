import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { apiRouter } from "./routes.js";
import { notFoundHandler } from "./common/middleware/not-found.js";
import { errorHandler } from "./common/middleware/error-handler.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json());
app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
