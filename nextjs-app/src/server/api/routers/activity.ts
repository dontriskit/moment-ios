import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { activityLog, dailyActivitySummary, users } from "@/server/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const activityRouter = createTRPCRouter({
  // Log a user activity
  logActivity: protectedProcedure
    .input(z.object({
      action: z.string().max(100),
      entityType: z.string().max(50).optional(),
      entityId: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get user IP and user agent from request headers
      const ipAddress = ctx.headers.get('x-forwarded-for') ?? 
                       ctx.headers.get('x-real-ip') ?? 
                       'unknown';
      const userAgent = ctx.headers.get('user-agent') ?? 'unknown';

      // Log the activity
      await ctx.db.insert(activityLog).values({
        userId: ctx.session.user.id,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: ipAddress.split(',')[0]?.trim() ?? 'unknown', // Take first IP if multiple
        userAgent,
      });

      // Update user's last active timestamp
      await ctx.db
        .update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, ctx.session.user.id));

      // Update daily activity summary
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if summary exists for today
      const existingSummary = await ctx.db
        .select()
        .from(dailyActivitySummary)
        .where(
          and(
            eq(dailyActivitySummary.userId, ctx.session.user.id),
            eq(dailyActivitySummary.date, today.toISOString().split('T')[0] as any)
          )
        )
        .limit(1);

      if (existingSummary.length === 0) {
        // Create new summary
        await ctx.db.insert(dailyActivitySummary).values({
          userId: ctx.session.user.id,
          date: today.toISOString().split('T')[0] as any,
        });
      }
    }),

  // Update daily activity summary
  updateDailySummary: protectedProcedure
    .input(z.object({
      listeningMinutes: z.number().optional(),
      activationsCompleted: z.number().optional(),
      articlesRead: z.number().optional(),
      achievementsUnlocked: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get existing summary or create new one
      const existingSummary = await ctx.db
        .select()
        .from(dailyActivitySummary)
        .where(
          and(
            eq(dailyActivitySummary.userId, ctx.session.user.id),
            eq(dailyActivitySummary.date, today.toISOString().split('T')[0] as any)
          )
        )
        .limit(1);

      if (existingSummary.length === 0) {
        // Create new summary with values
        await ctx.db.insert(dailyActivitySummary).values({
          userId: ctx.session.user.id,
          date: today.toISOString().split('T')[0] as any,
          listeningMinutes: input.listeningMinutes ?? 0,
          activationsCompleted: input.activationsCompleted ?? 0,
          articlesRead: input.articlesRead ?? 0,
          achievementsUnlocked: input.achievementsUnlocked ?? 0,
        });
      } else {
        // Update existing summary by incrementing values
        const updates: Record<string, any> = {
          updatedAt: new Date(),
        };

        if (input.listeningMinutes !== undefined) {
          updates.listeningMinutes = sql`${dailyActivitySummary.listeningMinutes} + ${input.listeningMinutes}`;
        }
        if (input.activationsCompleted !== undefined) {
          updates.activationsCompleted = sql`${dailyActivitySummary.activationsCompleted} + ${input.activationsCompleted}`;
        }
        if (input.articlesRead !== undefined) {
          updates.articlesRead = sql`${dailyActivitySummary.articlesRead} + ${input.articlesRead}`;
        }
        if (input.achievementsUnlocked !== undefined) {
          updates.achievementsUnlocked = sql`${dailyActivitySummary.achievementsUnlocked} + ${input.achievementsUnlocked}`;
        }

        await ctx.db
          .update(dailyActivitySummary)
          .set(updates)
          .where(eq(dailyActivitySummary.id, existingSummary[0]!.id));
      }

      // Update user's total listening minutes if provided
      if (input.listeningMinutes !== undefined) {
        await ctx.db
          .update(users)
          .set({
            totalListeningMinutes: sql`COALESCE(${users.totalListeningMinutes}, 0) + ${input.listeningMinutes}`,
          })
          .where(eq(users.id, ctx.session.user.id));
      }
    }),

  // Get user's recent activities
  getUserActivities: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.db
        .select()
        .from(activityLog)
        .where(eq(activityLog.userId, ctx.session.user.id))
        .orderBy(desc(activityLog.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(activityLog)
        .where(eq(activityLog.userId, ctx.session.user.id));

      return {
        activities,
        total: total[0]?.count ?? 0,
      };
    }),

  // Get user's activity summary for date range
  getUserActivitySummary: protectedProcedure
    .input(z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    }))
    .query(async ({ ctx, input }) => {
      const summaries = await ctx.db
        .select()
        .from(dailyActivitySummary)
        .where(
          and(
            eq(dailyActivitySummary.userId, ctx.session.user.id),
            gte(dailyActivitySummary.date, input.startDate.split('T')[0] as any),
            lte(dailyActivitySummary.date, input.endDate.split('T')[0] as any)
          )
        )
        .orderBy(desc(dailyActivitySummary.date));

      // Calculate totals
      const totals = summaries.reduce(
        (acc, summary) => ({
          listeningMinutes: acc.listeningMinutes + summary.listeningMinutes,
          activationsCompleted: acc.activationsCompleted + summary.activationsCompleted,
          articlesRead: acc.articlesRead + summary.articlesRead,
          achievementsUnlocked: acc.achievementsUnlocked + summary.achievementsUnlocked,
        }),
        {
          listeningMinutes: 0,
          activationsCompleted: 0,
          articlesRead: 0,
          achievementsUnlocked: 0,
        }
      );

      return {
        summaries,
        totals,
      };
    }),

  // Admin: Get all user activities
  getAllActivities: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      userId: z.string().optional(),
      action: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.userId) {
        conditions.push(eq(activityLog.userId, input.userId));
      }
      if (input.action) {
        conditions.push(eq(activityLog.action, input.action));
      }
      if (input.startDate) {
        conditions.push(gte(activityLog.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(activityLog.createdAt, new Date(input.endDate)));
      }

      const activities = await ctx.db
        .select({
          activity: activityLog,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(activityLog)
        .leftJoin(users, eq(activityLog.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(activityLog.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(activityLog)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        activities,
        total: total[0]?.count ?? 0,
      };
    }),

  // Admin: Get activity statistics
  getActivityStats: adminProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Get active users count for different periods
      const [todayActive, yesterdayActive, weekActive, monthActive] = await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(distinct ${activityLog.userId})` })
          .from(activityLog)
          .where(gte(activityLog.createdAt, today)),
        ctx.db
          .select({ count: sql<number>`count(distinct ${activityLog.userId})` })
          .from(activityLog)
          .where(
            and(
              gte(activityLog.createdAt, yesterday),
              lte(activityLog.createdAt, today)
            )
          ),
        ctx.db
          .select({ count: sql<number>`count(distinct ${activityLog.userId})` })
          .from(activityLog)
          .where(gte(activityLog.createdAt, weekAgo)),
        ctx.db
          .select({ count: sql<number>`count(distinct ${activityLog.userId})` })
          .from(activityLog)
          .where(gte(activityLog.createdAt, monthAgo)),
      ]);

      // Get top actions
      const topActions = await ctx.db
        .select({
          action: activityLog.action,
          count: sql<number>`count(*)`,
        })
        .from(activityLog)
        .where(gte(activityLog.createdAt, weekAgo))
        .groupBy(activityLog.action)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Get activity trend (last 7 days)
      const activityTrend = await ctx.db
        .select({
          date: sql<string>`DATE(${activityLog.createdAt})`,
          count: sql<number>`count(*)`,
          uniqueUsers: sql<number>`count(distinct ${activityLog.userId})`,
        })
        .from(activityLog)
        .where(gte(activityLog.createdAt, weekAgo))
        .groupBy(sql`DATE(${activityLog.createdAt})`)
        .orderBy(sql`DATE(${activityLog.createdAt})`);

      return {
        activeUsers: {
          today: todayActive[0]?.count ?? 0,
          yesterday: yesterdayActive[0]?.count ?? 0,
          week: weekActive[0]?.count ?? 0,
          month: monthActive[0]?.count ?? 0,
        },
        topActions,
        activityTrend,
      };
    }),
});