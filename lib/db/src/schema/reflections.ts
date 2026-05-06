import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reflectionsTable = pgTable("reflections", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  mood: text("mood"),
  imageUrl: text("image_url"),
  isAnalyzed: boolean("is_analyzed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReflectionSchema = createInsertSchema(reflectionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type Reflection = typeof reflectionsTable.$inferSelect;
