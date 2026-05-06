import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const notificationLog = pgTable("notification_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull().default("streak_reminder"),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
});

export type NotificationLog = typeof notificationLog.$inferSelect;
