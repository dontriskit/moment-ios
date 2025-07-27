import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { 
  users, 
  activations, 
  categories, 
  userProgress,
  achievements,
  challenges,
  accounts,
  articles,
  tags,
  authors,
  ulepszeniaCollections
} from "@/server/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { hash } from "bcryptjs";

export const adminRouter = createTRPCRouter({
  // Dashboard statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    // Get user counts
    const userStats = await ctx.db
      .select({
        totalUsers: sql<number>`count(*)`,
        adminUsers: sql<number>`count(*) filter (where ${users.role} = 'ADMIN')`,
      })
      .from(users);

    // Get content counts
    const contentStats = await ctx.db
      .select({
        totalActivations: sql<number>`count(distinct ${activations.id})`,
        totalCategories: sql<number>`count(distinct ${categories.id})`,
        totalChallenges: sql<number>`count(distinct ${challenges.id})`,
        totalAchievements: sql<number>`count(distinct ${achievements.id})`,
      })
      .from(activations)
      .fullJoin(categories, sql`true`)
      .fullJoin(challenges, sql`true`)
      .fullJoin(achievements, sql`true`);

    // Get CMS counts
    const cmsStats = await ctx.db
      .select({
        totalArticles: sql<number>`count(distinct ${articles.id})`,
        publishedArticles: sql<number>`count(*) filter (where ${articles.status} = 'published')`,
        totalTags: sql<number>`count(distinct ${tags.id})`,
        totalAuthors: sql<number>`count(distinct ${authors.id})`,
        totalCollections: sql<number>`count(distinct ${ulepszeniaCollections.id})`,
      })
      .from(articles)
      .fullJoin(tags, sql`true`)
      .fullJoin(authors, sql`true`)
      .fullJoin(ulepszeniaCollections, sql`true`);

    // Get listening stats
    const listeningStats = await ctx.db
      .select({
        totalListens: sql<number>`sum(${userProgress.listenCount})`,
        totalMinutes: sql<number>`sum(${userProgress.progressSeconds}) / 60`,
        completedActivations: sql<number>`count(*) filter (where ${userProgress.isCompleted} = true)`,
      })
      .from(userProgress);

    // Get recent activity
    const recentUsers = await ctx.db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 5,
    });

    const recentActivations = await ctx.db.query.activations.findMany({
      orderBy: [desc(activations.createdAt)],
      limit: 5,
      with: {
        category: true,
      },
    });

    return {
      users: {
        total: Number(userStats[0]?.totalUsers || 0),
        admins: Number(userStats[0]?.adminUsers || 0),
      },
      content: {
        activations: Number(contentStats[0]?.totalActivations || 0),
        categories: Number(contentStats[0]?.totalCategories || 0),
        challenges: Number(contentStats[0]?.totalChallenges || 0),
        achievements: Number(contentStats[0]?.totalAchievements || 0),
      },
      cms: {
        articles: Number(cmsStats[0]?.totalArticles || 0),
        publishedArticles: Number(cmsStats[0]?.publishedArticles || 0),
        tags: Number(cmsStats[0]?.totalTags || 0),
        authors: Number(cmsStats[0]?.totalAuthors || 0),
        collections: Number(cmsStats[0]?.totalCollections || 0),
      },
      listening: {
        totalListens: Number(listeningStats[0]?.totalListens || 0),
        totalMinutes: Math.floor(Number(listeningStats[0]?.totalMinutes || 0)),
        completedActivations: Number(listeningStats[0]?.completedActivations || 0),
      },
      recent: {
        users: recentUsers,
        activations: recentActivations,
      },
    };
  }),

  // User management
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const allUsers = await ctx.db.query.users.findMany({
        where: input.search ? 
          sql`${users.email} ILIKE ${'%' + input.search + '%'} OR ${users.name} ILIKE ${'%' + input.search + '%'}` : 
          undefined,
        orderBy: [desc(users.createdAt)],
        limit: input.limit,
        offset,
        with: {
          accounts: true,
        },
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      return {
        users: allUsers,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['USER', 'ADMIN']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from removing their own admin role
      if (input.userId === ctx.session.user.id && input.role !== 'ADMIN') {
        throw new Error("Cannot remove your own admin role");
      }

      await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Create admin user (useful for initial setup)
  createAdminUser: adminProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hash(input.password, 10);

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: 'ADMIN',
          onboardingCompleted: true,
        })
        .returning();

      return newUser;
    }),

  // Activation management
  deleteActivation: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(activations)
        .where(eq(activations.id, input.id));

      return { success: true };
    }),

  // Category management
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category has activations
      const categoryActivations = await ctx.db.query.activations.findMany({
        where: eq(activations.categoryId, input.id),
        limit: 1,
      });

      if (categoryActivations.length > 0) {
        throw new Error("Cannot delete category with activations");
      }

      await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id));

      return { success: true };
    }),
});