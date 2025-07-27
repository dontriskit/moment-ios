import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { users, activations, userProgress, categories, articles, articleStats } from "@/server/db/schema";
import { and, gte, lte, sql, eq, desc } from "drizzle-orm";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  getUserGrowth: adminProcedure
    .input(z.object({
      days: z.number().min(7).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);
      
      const result = await ctx.db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(users)
        .where(gte(users.createdAt, startDate))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      return result;
    }),

  getActivationListens: adminProcedure
    .input(z.object({
      days: z.number().min(7).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);
      
      const result = await ctx.db
        .select({
          date: sql<string>`DATE(${userProgress.lastListenedAt})`,
          count: sql<number>`COUNT(*)`,
          totalMinutes: sql<number>`SUM(${userProgress.progressSeconds}) / 60`,
        })
        .from(userProgress)
        .where(
          and(
            gte(userProgress.lastListenedAt, startDate),
            sql`${userProgress.lastListenedAt} IS NOT NULL`
          )
        )
        .groupBy(sql`DATE(${userProgress.lastListenedAt})`)
        .orderBy(sql`DATE(${userProgress.lastListenedAt})`);

      return result;
    }),

  getCategoryDistribution: adminProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .select({
          categoryName: categories.name,
          categoryColor: categories.color,
          count: sql<number>`COUNT(${activations.id})`,
        })
        .from(categories)
        .leftJoin(activations, eq(categories.id, activations.categoryId))
        .groupBy(categories.id, categories.name, categories.color)
        .orderBy(desc(sql`COUNT(${activations.id})`));

      return result;
    }),

  getTopActivations: adminProcedure
    .input(z.object({
      limit: z.number().min(5).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          activationId: activations.id,
          title: activations.title,
          categoryName: categories.name,
          totalListens: sql<number>`COUNT(*)`,
          totalMinutes: sql<number>`COALESCE(SUM(${userProgress.progressSeconds}) / 60, 0)`,
        })
        .from(activations)
        .leftJoin(userProgress, eq(activations.id, userProgress.activationId))
        .leftJoin(categories, eq(activations.categoryId, categories.id))
        .groupBy(activations.id, activations.title, categories.name)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit);

      return result;
    }),

  getActiveUsersToday: adminProcedure
    .query(async ({ ctx }) => {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      // Count unique users who have listened to activations today
      const [result] = await ctx.db
        .select({
          count: sql<number>`COUNT(DISTINCT ${userProgress.userId})`,
        })
        .from(userProgress)
        .where(
          and(
            gte(userProgress.lastListenedAt, todayStart),
            lte(userProgress.lastListenedAt, todayEnd)
          )
        );

      return result?.count ?? 0;
    }),

  getArticleStats: adminProcedure
    .input(z.object({
      days: z.number().min(7).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = subDays(new Date(), input.days);
      
      // Using article stats views count aggregated over time
      const views = await ctx.db
        .select({
          date: sql<string>`DATE(${articleStats.updatedAt})`,
          count: sql<number>`SUM(${articleStats.views})`,
        })
        .from(articleStats)
        .where(gte(articleStats.updatedAt, startDate))
        .groupBy(sql`DATE(${articleStats.updatedAt})`)
        .orderBy(sql`DATE(${articleStats.updatedAt})`);

      const published = await ctx.db
        .select({
          date: sql<string>`DATE(${articles.publishedAt})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(articles)
        .where(
          and(
            gte(articles.publishedAt, startDate),
            eq(articles.status, "published")
          )
        )
        .groupBy(sql`DATE(${articles.publishedAt})`)
        .orderBy(sql`DATE(${articles.publishedAt})`);

      return { views, published };
    }),

  getListeningHeatmap: adminProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${userProgress.lastListenedAt})`,
          dayOfWeek: sql<number>`EXTRACT(DOW FROM ${userProgress.lastListenedAt})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(userProgress)
        .where(
          and(
            gte(userProgress.lastListenedAt, subDays(new Date(), 30)),
            sql`${userProgress.lastListenedAt} IS NOT NULL`
          )
        )
        .groupBy(
          sql`EXTRACT(HOUR FROM ${userProgress.lastListenedAt})`,
          sql`EXTRACT(DOW FROM ${userProgress.lastListenedAt})`
        );

      return result;
    }),

  getUserRetention: adminProcedure
    .input(z.object({
      cohortDays: z.number().min(7).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const cohortStart = subDays(new Date(), input.cohortDays);
      
      // Get users who joined in the cohort period
      const cohortUsers = await ctx.db
        .select({
          userId: users.id,
          joinDate: users.createdAt,
        })
        .from(users)
        .where(gte(users.createdAt, cohortStart));

      // Get their activity in subsequent weeks (based on listening activity)
      const retention = await Promise.all(
        [0, 1, 2, 3, 4].map(async (weekOffset) => {
          const weekStart = subDays(new Date(), (4 - weekOffset) * 7);
          const weekEnd = subDays(new Date(), (3 - weekOffset) * 7);

          const activeUsers = await ctx.db
            .selectDistinct({
              userId: userProgress.userId,
            })
            .from(userProgress)
            .where(
              and(
                gte(userProgress.lastListenedAt, weekStart),
                lte(userProgress.lastListenedAt, weekEnd),
                sql`${userProgress.userId} IN (${sql.join(cohortUsers.map(u => sql`${u.userId}`), sql`, `)})`
              )
            );

          return {
            week: weekOffset,
            retained: activeUsers.length,
            total: cohortUsers.length,
            percentage: cohortUsers.length > 0 ? (activeUsers.length / cohortUsers.length) * 100 : 0,
          };
        })
      );

      return retention;
    }),
});