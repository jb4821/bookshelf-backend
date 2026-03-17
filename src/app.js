import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// TODO: Register routes here
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/books", bookRoutes);
// app.use("/api/v1/active-book", activeBookRoutes);
// app.use("/api/v1/purchase", purchaseRoutes);
// app.use("/api/v1/content", contentRoutes);
// app.use("/api/v1/admin", adminRoutes);

// Global error handler
app.use(errorHandler);

export default app;
