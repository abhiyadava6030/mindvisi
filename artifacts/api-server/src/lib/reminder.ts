import { createClerkClient } from "@clerk/express";
import { db, reflectionsTable, notificationLog } from "@workspace/db";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import { sendStreakReminderEmail, isEmailEnabled } from "./email";
import { logger } from "./logger";

const clerk = createClerkClient({
  secretKey: process.env["CLERK_SECRET_KEY"],
});

export async function runStreakReminderJob(): Promise<void> {
  if (!isEmailEnabled()) {
    logger.info("Streak reminder job skipped — SMTP not configured");
    return;
  }

  logger.info("Running streak reminder job");

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find all users who have ever reflected
  const allUserRows = await db
    .selectDistinct({ userId: reflectionsTable.userId })
    .from(reflectionsTable);

  if (allUserRows.length === 0) {
    logger.info("No users to check for streak reminders");
    return;
  }

  let sent = 0;
  let skipped = 0;

  for (const { userId } of allUserRows) {
    // Check if they have reflected in the last 24 hours
    const [recent] = await db
      .select({ id: reflectionsTable.id })
      .from(reflectionsTable)
      .where(
        and(
          eq(reflectionsTable.userId, userId),
          gte(reflectionsTable.createdAt, twentyFourHoursAgo),
        ),
      )
      .limit(1);

    if (recent) {
      skipped++;
      continue; // Reflected today — no reminder needed
    }

    // Check we haven't already sent them a reminder in the last 20 hours (avoid double-sending)
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
    const [alreadyNotified] = await db
      .select({ id: notificationLog.id })
      .from(notificationLog)
      .where(
        and(
          eq(notificationLog.userId, userId),
          eq(notificationLog.type, "streak_reminder"),
          gte(notificationLog.sentAt, twentyHoursAgo),
        ),
      )
      .limit(1);

    if (alreadyNotified) {
      skipped++;
      continue;
    }

    // Get user details from Clerk
    let userEmail: string | null = null;
    let firstName = "there";
    try {
      const user = await clerk.users.getUser(userId);
      const primaryEmail = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId,
      );
      userEmail = primaryEmail?.emailAddress ?? null;
      firstName = user.firstName ?? user.username ?? "there";
    } catch (err) {
      logger.warn({ err, userId }, "Could not fetch user from Clerk");
      continue;
    }

    if (!userEmail) {
      skipped++;
      continue;
    }

    const success = await sendStreakReminderEmail({ to: userEmail, firstName });

    if (success) {
      await db.insert(notificationLog).values({
        userId,
        type: "streak_reminder",
      });
      sent++;
    }
  }

  logger.info({ sent, skipped }, "Streak reminder job complete");
}
