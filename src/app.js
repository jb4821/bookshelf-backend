import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middleware/errorHandler.js";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import activeBookRoutes from "./routes/activeBook.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import contentRoutes from "./routes/content.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/active-book", activeBookRoutes);
app.use("/api/v1/purchase", purchaseRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/admin", adminRoutes);

// Global error handler
app.use(errorHandler);

export default app;
