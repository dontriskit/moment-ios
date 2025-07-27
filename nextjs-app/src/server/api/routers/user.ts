import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { 
  userProgress, 
  userFavorites, 
  userAchievements, 
  achievements,
  users,
  userQuizAnswers,
  activityLog,
  dailyActivitySummary 
} from "@/server/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getProfileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all user progress
    const allProgress = await ctx.db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
    });

    // Calculate total minutes
    const totalSeconds = allProgress.reduce((acc, p) => acc + p.progressSeconds, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);

    // Count completed activations
    const completedActivations = allProgress.filter(p => p.isCompleted).length;

    // Calculate streak (simplified - in production you'd want proper date logic)
    const streakDays = await calculateStreakDays(ctx.db, userId);

    return {
      streakDays,
      totalMinutes,
      activations: completedActivations,
    };
  }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all achievements
    const allAchievements = await ctx.db.query.achievements.findMany();

    // Get user's unlocked achievements
    const userAchievs = await ctx.db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, userId),
    });

    const unlockedIds = new Set(userAchievs.map(ua => ua.achievementId));

    return allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievs.find(ua => ua.achievementId === achievement.id)?.unlockedAt,
    }));
  }),

  updateProgress: protectedProcedure
    .input(z.object({
      activationId: z.string(),
      progressSeconds: z.number(),
      isCompleted: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Upsert progress
      const existing = await ctx.db.query.userProgress.findFirst({
        where: and(
          eq(userProgress.userId, userId),
          eq(userProgress.activationId, input.activationId)
        ),
      });

      if (existing) {
        await ctx.db
          .update(userProgress)
          .set({
            progressSeconds: input.progressSeconds,
            isCompleted: input.isCompleted,
            lastListenedAt: new Date(),
            listenCount: existing.listenCount + (input.isCompleted ? 1 : 0),
          })
          .where(and(
            eq(userProgress.userId, userId),
            eq(userProgress.activationId, input.activationId)
          ));
      } else {
        await ctx.db.insert(userProgress).values({
          userId,
          activationId: input.activationId,
          progressSeconds: input.progressSeconds,
          isCompleted: input.isCompleted,
          lastListenedAt: new Date(),
          listenCount: input.isCompleted ? 1 : 0,
        });
      }

      // Check for new achievements if completed
      if (input.isCompleted) {
        await checkAndAwardAchievements(ctx.db, userId);
      }

      // Log activity
      await ctx.db.insert(activityLog).values({
        userId,
        action: input.isCompleted ? 'activation_completed' : 'activation_progress',
        entityType: 'activation',
        entityId: input.activationId,
        metadata: {
          progressSeconds: input.progressSeconds,
          isCompleted: input.isCompleted,
        },
        ipAddress: ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 
                   ctx.headers.get('x-real-ip') ?? 
                   'unknown',
        userAgent: ctx.headers.get('user-agent') ?? 'unknown',
      });

      // Update daily summary
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const existingSummary = await ctx.db
        .select()
        .from(dailyActivitySummary)
        .where(
          and(
            eq(dailyActivitySummary.userId, userId),
            eq(dailyActivitySummary.date, todayStr as any)
          )
        )
        .limit(1);

      if (input.isCompleted) {
        if (existingSummary.length === 0) {
          await ctx.db.insert(dailyActivitySummary).values({
            userId,
            date: todayStr as any,
            activationsCompleted: 1,
            listeningMinutes: Math.floor(input.progressSeconds / 60),
          });
        } else {
          await ctx.db
            .update(dailyActivitySummary)
            .set({
              activationsCompleted: sql`${dailyActivitySummary.activationsCompleted} + 1`,
              listeningMinutes: sql`${dailyActivitySummary.listeningMinutes} + ${Math.floor(input.progressSeconds / 60)}`,
              updatedAt: new Date(),
            })
            .where(eq(dailyActivitySummary.id, existingSummary[0]!.id));
        }
      }

      // Update user's total listening minutes and last active
      await ctx.db
        .update(users)
        .set({
          totalListeningMinutes: sql`COALESCE(${users.totalListeningMinutes}, 0) + ${Math.floor(input.progressSeconds / 60)}`,
          lastActiveAt: new Date(),
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ activationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if already favorited
      const existing = await ctx.db.query.userFavorites.findFirst({
        where: and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.activationId, input.activationId)
        ),
      });

      let favorited = false;
      
      if (existing) {
        // Remove from favorites
        await ctx.db
          .delete(userFavorites)
          .where(and(
            eq(userFavorites.userId, userId),
            eq(userFavorites.activationId, input.activationId)
          ));
        favorited = false;
      } else {
        // Add to favorites
        await ctx.db.insert(userFavorites).values({
          userId,
          activationId: input.activationId,
        });
        favorited = true;
      }

      // Log activity
      await ctx.db.insert(activityLog).values({
        userId,
        action: favorited ? 'activation_favorited' : 'activation_unfavorited',
        entityType: 'activation',
        entityId: input.activationId,
        metadata: { favorited },
        ipAddress: ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 
                   ctx.headers.get('x-real-ip') ?? 
                   'unknown',
        userAgent: ctx.headers.get('user-agent') ?? 'unknown',
      });

      // Update last active
      await ctx.db
        .update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, userId));

      return { favorited };
    }),

  completeOnboardingQuiz: protectedProcedure
    .input(z.object({
      answers: z.array(z.object({
        questionId: z.string(),
        answer: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Save quiz answers
      for (const answer of input.answers) {
        await ctx.db.insert(userQuizAnswers).values({
          userId,
          questionId: answer.questionId,
          answer: answer.answer,
        });
      }

      // Mark onboarding as completed
      await ctx.db
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, userId));

      return { success: true };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      dateOfBirth: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const updateData: any = {};
      if (input.firstName !== undefined) updateData.firstName = input.firstName;
      if (input.lastName !== undefined) updateData.lastName = input.lastName;
      if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);

      await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      return { success: true };
    }),
});

// Helper functions
async function calculateStreakDays(db: any, userId: string): Promise<number> {
  // Simplified streak calculation
  // In production, you'd want to check consecutive days
  const recentProgress = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
    orderBy: [desc(userProgress.lastListenedAt)],
    limit: 30,
  });

  // For now, just return number of unique days in last 30 days
  const uniqueDays = new Set(
    recentProgress
      .filter((p: any) => p.lastListenedAt !== null)
      .map((p: any) => p.lastListenedAt.toISOString().split('T')[0])
  );

  return uniqueDays.size;
}

async function checkAndAwardAchievements(db: any, userId: string): Promise<void> {
  // Check various achievement conditions
  // This is a simplified version - in production you'd have more sophisticated logic

  const allProgress = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
  });

  const completedCount = allProgress.filter((p: any) => p.isCompleted).length;

  // Check activation count achievements
  const countAchievements = await db.query.achievements.findMany({
    where: eq(achievements.type, 'activation_count'),
  });

  for (const achievement of countAchievements) {
    if (achievement.milestone && completedCount >= achievement.milestone) {
      // Check if already awarded
      const existing = await db.query.userAchievements.findFirst({
        where: and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievement.id)
        ),
      });

      if (!existing) {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
        });

        // Log achievement unlock
        await db.insert(activityLog).values({
          userId,
          action: 'achievement_unlocked',
          entityType: 'achievement',
          entityId: achievement.id,
          metadata: { 
            achievementName: achievement.name,
            achievementType: achievement.type,
            milestone: achievement.milestone 
          },
          ipAddress: 'system',
          userAgent: 'system',
        });

        // Update daily summary
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const existingSummary = await db
          .select()
          .from(dailyActivitySummary)
          .where(
            and(
              eq(dailyActivitySummary.userId, userId),
              eq(dailyActivitySummary.date, todayStr as any)
            )
          )
          .limit(1);

        if (existingSummary.length === 0) {
          await db.insert(dailyActivitySummary).values({
            userId,
            date: todayStr as any,
            achievementsUnlocked: 1,
          });
        } else {
          await db
            .update(dailyActivitySummary)
            .set({
              achievementsUnlocked: sql`${dailyActivitySummary.achievementsUnlocked} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(dailyActivitySummary.id, existingSummary[0]!.id));
        }
      }
    }
  }
}