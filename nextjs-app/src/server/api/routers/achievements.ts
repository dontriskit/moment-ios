import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "../trpc";
import { achievements, userAchievements } from "@/server/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const achievementsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const allAchievements = await ctx.db
        .select()
        .from(achievements);

      // Get user's achievements
      const userAchievementsList = await ctx.db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, ctx.session.user.id));

      const userAchievementIds = new Set(userAchievementsList.map(ua => ua.achievementId));

      return allAchievements.map(achievement => ({
        ...achievement,
        unlocked: userAchievementIds.has(achievement.id),
      }));
    }),

  getAllForAdmin: adminProcedure
    .input(z.object({
      limit: z.number().min(10).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const [allAchievements, total] = await Promise.all([
        ctx.db
          .select({
            achievement: achievements,
            unlockedCount: sql<number>`COUNT(DISTINCT ${userAchievements.userId})`,
          })
          .from(achievements)
          .leftJoin(userAchievements, eq(achievements.id, userAchievements.achievementId))
          .groupBy(achievements.id)
          .orderBy(desc(achievements.id))
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(achievements)
          .then(res => res[0]?.count ?? 0),
      ]);

      return {
        achievements: allAchievements.map(a => ({
          ...a.achievement,
          unlockedCount: a.unlockedCount,
        })),
        total,
      };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [achievement] = await ctx.db
        .select()
        .from(achievements)
        .where(eq(achievements.id, input.id));

      if (!achievement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Achievement not found",
        });
      }

      return achievement;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      badgeImageUrl: z.string().optional(),
      milestone: z.number().int().positive(),
      type: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [achievement] = await ctx.db
        .insert(achievements)
        .values({
          name: input.name,
          description: input.description,
          badgeImageUrl: input.badgeImageUrl,
          milestone: input.milestone,
          type: input.type,
        })
        .returning();

      if (!achievement) {
        throw new Error("Failed to create achievement");
      }

      return achievement;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string(),
      badgeImageUrl: z.string().optional(),
      milestone: z.number().int().positive(),
      type: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      await ctx.db
        .update(achievements)
        .set({
          name: data.name,
          description: data.description,
          badgeImageUrl: data.badgeImageUrl,
          milestone: data.milestone,
          type: data.type,
        })
        .where(eq(achievements.id, id));

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(achievements)
        .where(eq(achievements.id, input.id));

      return { success: true };
    }),

  unlockAchievement: protectedProcedure
    .input(z.object({ achievementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already unlocked
      const existing = await ctx.db
        .select()
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.userId, ctx.session.user.id),
            eq(userAchievements.achievementId, input.achievementId)
          )
        );

      if (existing.length > 0) {
        return { alreadyUnlocked: true };
      }

      await ctx.db.insert(userAchievements).values({
        userId: ctx.session.user.id,
        achievementId: input.achievementId,
        unlockedAt: new Date(),
      });

      return { success: true };
    }),

  getUserAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      const userAchievementsList = await ctx.db
        .select({
          achievement: achievements,
          unlockedAt: userAchievements.unlockedAt,
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, ctx.session.user.id))
        .orderBy(desc(userAchievements.unlockedAt));

      return userAchievementsList;
    }),

  checkAchievements: protectedProcedure
    .mutation(async ({ ctx }) => {
      // This would check various criteria and unlock achievements automatically
      // For now, returning empty array
      const unlockedAchievements: string[] = [];

      // TODO: Implement achievement checking logic
      // - Check listening counts
      // - Check streaks
      // - Check category completions
      // - Check challenge completions

      return { unlockedAchievements };
    }),
});