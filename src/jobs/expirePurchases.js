import cron from "node-cron";
import prisma from "../config/db.js";

/**
 * Cron job: runs daily at midnight to expire purchases where end_date < today.
 * Also removes active_books entries pointing to expired purchases.
 */
export const startExpirePurchasesJob = () => {
  // Run every day at 00:00
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find purchases to expire
      const expiredPurchases = await prisma.purchase.findMany({
        where: {
          status: "ACTIVE",
          endDate: { lt: today },
        },
        select: { id: true },
      });

      if (expiredPurchases.length === 0) return;

      const expiredIds = expiredPurchases.map((p) => p.id);

      await prisma.$transaction(async (tx) => {
        // Remove active_books pointing to expired purchases
        await tx.activeBook.deleteMany({
          where: { purchaseId: { in: expiredIds } },
        });

        // Mark purchases as expired
        await tx.purchase.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: "EXPIRED" },
        });
      });

      console.log(`[CRON] Expired ${expiredIds.length} purchases`);
    } catch (error) {
      console.error("[CRON] Failed to expire purchases:", error);
    }
  });

  console.log("Purchase expiry cron job scheduled (daily at 00:00)");
};
