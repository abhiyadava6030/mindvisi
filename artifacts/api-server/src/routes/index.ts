import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reflectionsRouter from "./reflections";
import dashboardRouter from "./dashboard";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reflectionsRouter);
router.use(dashboardRouter);
router.use(openaiRouter);

export default router;
