import { Router, type IRouter } from "express";
import { eq, desc, count, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, reflectionsTable } from "@workspace/db";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
};

router.get("/dashboard/stats", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId;

  const [totalResult] = await db
    .select({ total: count() })
    .from(reflectionsTable)
    .where(eq(reflectionsTable.userId, userId));

  const [analyzedResult] = await db
    .select({ analyzed: count() })
    .from(reflectionsTable)
    .where(eq(reflectionsTable.userId, userId))
    .where(eq(reflectionsTable.isAnalyzed, true));

  const moodRows = await db
    .select({
      mood: reflectionsTable.mood,
      cnt: count(),
    })
    .from(reflectionsTable)
    .where(eq(reflectionsTable.userId, userId))
    .where(sql`${reflectionsTable.mood} is not null`)
    .groupBy(reflectionsTable.mood);

  const recentReflections = await db
    .select()
    .from(reflectionsTable)
    .where(eq(reflectionsTable.userId, userId))
    .orderBy(desc(reflectionsTable.createdAt))
    .limit(5);

  // Calculate streak days (consecutive days with reflections)
  const allDates = await db
    .select({ date: sql<string>`DATE(${reflectionsTable.createdAt})` })
    .from(reflectionsTable)
    .where(eq(reflectionsTable.userId, userId))
    .orderBy(desc(reflectionsTable.createdAt));

  let streakDays = 0;
  if (allDates.length > 0) {
    const uniqueDates = [...new Set(allDates.map((r) => r.date))];
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streakDays = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (diff === 1) streakDays++;
        else break;
      }
    }
  }

  res.json({
    totalReflections: Number(totalResult?.total ?? 0),
    analyzedReflections: Number(analyzedResult?.analyzed ?? 0),
    moodBreakdown: moodRows.map((r) => ({ mood: r.mood ?? "Unknown", count: Number(r.cnt) })),
    recentReflections,
    streakDays,
  });
});

export default router;
