import app from "./app.js";
import env from "./config/env.js";
import prisma from "./config/db.js";
import { startExpirePurchasesJob } from "./jobs/expirePurchases.js";

const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");

    // Start cron jobs
    startExpirePurchasesJob();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
