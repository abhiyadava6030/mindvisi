import cron from "node-cron";
import app from "./app";
import { logger } from "./lib/logger";
import { runStreakReminderJob } from "./lib/reminder";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Run streak reminder every day at 8 PM UTC
  cron.schedule("0 20 * * *", () => {
    runStreakReminderJob().catch((err) => {
      logger.error({ err }, "Streak reminder job failed");
    });
  });

  logger.info("Streak reminder cron scheduled (daily at 20:00 UTC)");
});
