import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, reflectionsTable, recommendationsTable } from "@workspace/db";
import {
  CreateReflectionBody,
  GetReflectionParams,
  DeleteReflectionParams,
  AnalyzeReflectionParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { logger } from "../lib/logger";

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

router.get("/reflections", requireAuth, async (req: any, res): Promise<void> => {
  const reflections = await db
    .select()
    .from(reflectionsTable)
    .where(eq(reflectionsTable.userId, req.userId))
    .orderBy(desc(reflectionsTable.createdAt));
  res.json(reflections);
});

router.post("/reflections", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateReflectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [reflection] = await db
    .insert(reflectionsTable)
    .values({ userId: req.userId, text: parsed.data.text })
    .returning();

  res.status(201).json(reflection);
});

router.get("/reflections/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = GetReflectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [reflection] = await db
    .select()
    .from(reflectionsTable)
    .where(and(eq(reflectionsTable.id, params.data.id), eq(reflectionsTable.userId, req.userId)));

  if (!reflection) {
    res.status(404).json({ error: "Reflection not found" });
    return;
  }

  const recs = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.reflectionId, reflection.id))
    .orderBy(recommendationsTable.createdAt);

  res.json({ ...reflection, recommendations: recs });
});

router.delete("/reflections/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteReflectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(reflectionsTable)
    .where(and(eq(reflectionsTable.id, params.data.id), eq(reflectionsTable.userId, req.userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Reflection not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/reflections/:id/analyze", requireAuth, async (req: any, res): Promise<void> => {
  const params = AnalyzeReflectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [reflection] = await db
    .select()
    .from(reflectionsTable)
    .where(and(eq(reflectionsTable.id, params.data.id), eq(reflectionsTable.userId, req.userId)));

  if (!reflection) {
    res.status(404).json({ error: "Reflection not found" });
    return;
  }

  try {
    // Step 1: Analyze emotion and get recommendations
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `You are Mindvisi, a compassionate AI wellness companion. Analyze the user's emotional expression and provide:
1. A single mood label (e.g., "Melancholic", "Hopeful", "Anxious", "Joyful", "Angry", "Peaceful", "Overwhelmed", "Grateful", "Longing", "Empowered")
2. A personalized greeting using the user's name
3. Exactly 4 recommendations: one book/documentary, one yoga practice, one meditation/dhyan practice, and one motivational insight

Return a JSON object exactly like this:
{
  "mood": "Melancholic",
  "greeting": "Hello [name], I sense deep waters in your words today...",
  "imagePrompt": "a detailed description for generating an image that captures this exact emotional state",
  "recommendations": [
    {"type": "book", "title": "Book Title", "description": "Why this book will help"},
    {"type": "yoga", "title": "Yoga Practice Name", "description": "How this practice serves this emotion"},
    {"type": "meditation", "title": "Meditation Name", "description": "How this practice brings peace"},
    {"type": "motivation", "title": "Insight Title", "description": "A tailored motivational message"}
  ]
}`,
        },
        {
          role: "user",
          content: `The user's reflection: "${reflection.text}"`,
        },
      ],
    });

    const rawContent = analysisResponse.choices[0]?.message?.content ?? "{}";
    let analysis: any = {};
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {
      req.log.warn("Failed to parse AI response JSON");
    }

    const mood = analysis.mood ?? "Reflective";
    const greeting = analysis.greeting ?? `Thank you for sharing your thoughts with Mindvisi.`;
    const recs = analysis.recommendations ?? [];
    const imagePrompt = analysis.imagePrompt ?? `An ethereal abstract visualization of ${mood.toLowerCase()} emotion, cosmic and dreamlike, digital art`;

    // Step 2: Generate personalized image
    let imageUrl: string | null = null;
    try {
      const imageBuffer = await generateImageBuffer(
        `${imagePrompt}. Style: ethereal, cosmic, painterly, emotional, abstract art, vivid colors, no text`,
        "1024x1024"
      );
      const b64 = imageBuffer.toString("base64");
      imageUrl = `data:image/png;base64,${b64}`;
    } catch (imgErr) {
      req.log.warn({ err: imgErr }, "Image generation failed, continuing without image");
    }

    // Step 3: Save recommendations and update reflection
    await db.delete(recommendationsTable).where(eq(recommendationsTable.reflectionId, reflection.id));

    const savedRecs = recs.length > 0
      ? await db.insert(recommendationsTable).values(
          recs.map((r: any) => ({
            reflectionId: reflection.id,
            type: r.type ?? "motivation",
            title: r.title ?? "Untitled",
            description: r.description ?? "",
          }))
        ).returning()
      : [];

    const [updatedReflection] = await db
      .update(reflectionsTable)
      .set({ mood, imageUrl, isAnalyzed: true })
      .where(eq(reflectionsTable.id, reflection.id))
      .returning();

    res.json({
      mood,
      imageUrl: imageUrl ?? "",
      recommendations: savedRecs,
      greeting,
    });
  } catch (err) {
    req.log.error({ err }, "Analysis failed");
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
