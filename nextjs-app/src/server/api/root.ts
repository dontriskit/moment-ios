import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { activationRouter } from "@/server/api/routers/activation";
import { userRouter } from "@/server/api/routers/user";
import { playlistRouter } from "@/server/api/routers/playlist";
import { adminRouter } from "@/server/api/routers/admin";
import { categoryRouter } from "@/server/api/routers/category";
import { articlesRouter } from "@/server/api/routers/articles";
import { tagsRouter } from "@/server/api/routers/tags";
import { authorsRouter } from "@/server/api/routers/authors";
import { collectionsRouter } from "@/server/api/routers/collections";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { challengesRouter } from "@/server/api/routers/challenges";
import { achievementsRouter } from "@/server/api/routers/achievements";
import { activityRouter } from "@/server/api/routers/activity";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  activation: activationRouter,
  user: userRouter,
  playlist: playlistRouter,
  admin: adminRouter,
  category: categoryRouter,
  articles: articlesRouter,
  tags: tagsRouter,
  authors: authorsRouter,
  collections: collectionsRouter,
  analytics: analyticsRouter,
  challenges: challengesRouter,
  achievements: achievementsRouter,
  activity: activityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
