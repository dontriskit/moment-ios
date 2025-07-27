import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "../trpc";
import { challenges, userChallengeProgress, challengeActivations, activations } from "@/server/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const challengesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const allChallenges = await ctx.db
        .select()
        .from(challenges)
        .orderBy(desc(challenges.createdAt));

      return allChallenges;
    }),

  getAllForAdmin: adminProcedure
    .input(z.object({
      limit: z.number().min(10).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const [allChallenges, total] = await Promise.all([
        ctx.db
          .select()
          .from(challenges)
          .orderBy(desc(challenges.createdAt))
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(challenges)
          .then(res => res[0]?.count ?? 0),
      ]);

      return {
        challenges: allChallenges,
        total,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [challenge] = await ctx.db
        .select()
        .from(challenges)
        .where(eq(challenges.id, input.id));

      if (!challenge) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Challenge not found",
        });
      }

      // Get activations for this challenge
      const activationsData = await ctx.db
        .select({
          activation: activations,
          dayNumber: challengeActivations.dayNumber,
        })
        .from(challengeActivations)
        .innerJoin(activations, eq(challengeActivations.activationId, activations.id))
        .where(eq(challengeActivations.challengeId, input.id))
        .orderBy(challengeActivations.dayNumber);

      return {
        ...challenge,
        activations: activationsData.map(a => ({ ...a.activation, dayNumber: a.dayNumber })),
      };
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      imageUrl: z.string().optional(),
      durationDays: z.number().int().positive(),
      activationIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { activationIds, ...challengeData } = input;

      const [challenge] = await ctx.db
        .insert(challenges)
        .values({
          name: challengeData.name,
          description: challengeData.description,
          imageUrl: challengeData.imageUrl,
          durationDays: challengeData.durationDays,
        })
        .returning();

      if (!challenge) {
        throw new Error("Failed to create challenge");
      }

      // Add activations to challenge
      if (activationIds.length > 0) {
        await ctx.db.insert(challengeActivations).values(
          activationIds.map((activationId, index) => ({
            challengeId: challenge.id,
            activationId,
            dayNumber: index + 1,
          }))
        );
      }

      return challenge;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string(),
      imageUrl: z.string().optional(),
      durationDays: z.number().int().positive(),
      activationIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, activationIds, ...challengeData } = input;

      await ctx.db
        .update(challenges)
        .set({
          name: challengeData.name,
          description: challengeData.description,
          imageUrl: challengeData.imageUrl,
          durationDays: challengeData.durationDays,
        })
        .where(eq(challenges.id, id));

      // Update activations
      await ctx.db
        .delete(challengeActivations)
        .where(eq(challengeActivations.challengeId, id));

      if (activationIds.length > 0) {
        await ctx.db.insert(challengeActivations).values(
          activationIds.map((activationId, index) => ({
            challengeId: id,
            activationId,
            dayNumber: index + 1,
          }))
        );
      }

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(challenges)
        .where(eq(challenges.id, input.id));

      return { success: true };
    }),

  startChallenge: protectedProcedure
    .input(z.object({ challengeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already has this challenge
      const existing = await ctx.db
        .select()
        .from(userChallengeProgress)
        .where(
          and(
            eq(userChallengeProgress.userId, ctx.session.user.id),
            eq(userChallengeProgress.challengeId, input.challengeId)
          )
        );

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Challenge already started",
        });
      }

      await ctx.db.insert(userChallengeProgress).values({
        userId: ctx.session.user.id,
        challengeId: input.challengeId,
        startedAt: new Date(),
        completedDays: 0,
        isCompleted: false,
      });

      return { success: true };
    }),

  getUserProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const progress = await ctx.db
        .select({
          challenge: challenges,
          progress: userChallengeProgress,
        })
        .from(userChallengeProgress)
        .innerJoin(challenges, eq(userChallengeProgress.challengeId, challenges.id))
        .where(eq(userChallengeProgress.userId, ctx.session.user.id));

      return progress;
    }),
});