import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "@/server/api/trpc";
import { activations, categories, userProgress, userFavorites } from "@/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const activationRouter = createTRPCRouter({
  getForYouPageData: protectedProcedure.query(async ({ ctx }) => {
    // Get featured activations
    const featured = await ctx.db.query.activations.findMany({
      where: and(
        eq(activations.featured, true),
        eq(activations.status, "published"),
        sql`${activations.publishedAt} <= CURRENT_TIMESTAMP`
      ),
      limit: 5,
      orderBy: [desc(activations.publishedAt)],
      with: {
        category: true,
      },
    });

    // Get new releases
    const newReleases = await ctx.db.query.activations.findMany({
      where: and(
        eq(activations.status, "published"),
        sql`${activations.publishedAt} <= CURRENT_TIMESTAMP`
      ),
      limit: 10,
      orderBy: [desc(activations.publishedAt)],
      with: {
        category: true,
      },
    });

    // Get user's favorites
    const userFavs = await ctx.db.query.userFavorites.findMany({
      where: eq(userFavorites.userId, ctx.session.user.id),
      limit: 10,
      with: {
        activation: {
          with: {
            category: true,
          },
        },
      },
    });

    const favorites = userFavs.map(f => f.activation);

    return {
      featured,
      newReleases,
      favorites,
    };
  }),

  getExploreCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.categories.findMany({
      orderBy: [categories.name],
    });
  }),

  getActivationsByCategory: publicProcedure
    .input(z.object({ categorySlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, input.categorySlug),
      });

      if (!category) {
        throw new Error("Category not found");
      }

      const categoryActivations = await ctx.db.query.activations.findMany({
        where: and(
          eq(activations.categoryId, category.id),
          eq(activations.status, "published"),
          sql`${activations.publishedAt} <= CURRENT_TIMESTAMP`
        ),
        orderBy: [desc(activations.publishedAt)],
        with: {
          category: true,
        },
      });

      return {
        category,
        activations: categoryActivations,
      };
    }),

  getActivationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const activation = await ctx.db.query.activations.findFirst({
        where: eq(activations.id, input.id),
        with: {
          category: true,
        },
      });

      if (!activation) {
        throw new Error("Activation not found");
      }

      // Get user's progress for this activation
      const progress = await ctx.db.query.userProgress.findFirst({
        where: and(
          eq(userProgress.userId, ctx.session.user.id),
          eq(userProgress.activationId, input.id)
        ),
      });

      // Check if favorited
      const favorite = await ctx.db.query.userFavorites.findFirst({
        where: and(
          eq(userFavorites.userId, ctx.session.user.id),
          eq(userFavorites.activationId, input.id)
        ),
      });

      return {
        ...activation,
        progress: progress || null,
        isFavorited: !!favorite,
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      // Simple search implementation - in production you'd want full-text search
      const results = await ctx.db.query.activations.findMany({
        where: (activations, { ilike }) => ilike(activations.title, `%${input.query}%`),
        limit: 20,
        with: {
          category: true,
        },
      });

      return results;
    }),

  // Admin procedures
  getAllForAdmin: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.enum(["all", "draft", "published", "scheduled"]).default("all"),
      featured: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const whereConditions = [];
      if (input.search) {
        whereConditions.push(sql`${activations.title} ILIKE ${'%' + input.search + '%'}`);
      }
      if (input.status !== "all") {
        whereConditions.push(eq(activations.status, input.status));
      }
      if (input.featured !== undefined) {
        whereConditions.push(eq(activations.featured, input.featured));
      }

      const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const allActivations = await ctx.db.query.activations.findMany({
        where: whereCondition,
        orderBy: [desc(activations.createdAt)],
        limit: input.limit,
        offset,
        with: {
          category: true,
        },
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(activations)
        .where(whereCondition);

      return {
        activations: allActivations,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      durationSeconds: z.number().min(1),
      audioUrl: z.string(),
      imageUrl: z.string(),
      categoryId: z.string().optional(),
      status: z.enum(["draft", "published", "scheduled"]).default("draft"),
      publishedAt: z.date().optional(),
      scheduledAt: z.date().optional(),
      featured: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const activationData = {
        ...input,
        publishedAt: input.status === "published" && !input.publishedAt
          ? new Date()
          : input.publishedAt,
      };

      const [newActivation] = await ctx.db
        .insert(activations)
        .values(activationData)
        .returning();

      return newActivation;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      durationSeconds: z.number().min(1).optional(),
      audioUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      categoryId: z.string().nullable().optional(),
      status: z.enum(["draft", "published", "scheduled"]).optional(),
      publishedAt: z.date().nullable().optional(),
      scheduledAt: z.date().nullable().optional(),
      featured: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Handle publishing logic
      if (updateData.status === "published" && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }

      const [updatedActivation] = await ctx.db
        .update(activations)
        .set(updateData)
        .where(eq(activations.id, id))
        .returning();

      return updatedActivation;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(activations)
        .where(eq(activations.id, input.id));

      return { success: true };
    }),

  // Bulk operations
  bulkUpdateStatus: adminProcedure
    .input(z.object({
      ids: z.array(z.string()),
      status: z.enum(["draft", "published", "scheduled"]),
      publishedAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: any = { status: input.status };
      
      if (input.status === "published" && !input.publishedAt) {
        updateData.publishedAt = new Date();
      } else if (input.publishedAt) {
        updateData.publishedAt = input.publishedAt;
      }

      await ctx.db
        .update(activations)
        .set(updateData)
        .where(sql`${activations.id} IN (${sql.join(input.ids.map(id => sql`${id}`), sql`, `)})`);

      return { success: true };
    }),

  bulkUpdateCategory: adminProcedure
    .input(z.object({
      ids: z.array(z.string()),
      categoryId: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(activations)
        .set({ categoryId: input.categoryId })
        .where(sql`${activations.id} IN (${sql.join(input.ids.map(id => sql`${id}`), sql`, `)})`);

      return { success: true };
    }),

  bulkDelete: adminProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(activations)
        .where(sql`${activations.id} IN (${sql.join(input.ids.map(id => sql`${id}`), sql`, `)})`);

      return { success: true };
    }),

  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [activation] = await ctx.db
        .select({ featured: activations.featured })
        .from(activations)
        .where(eq(activations.id, input.id));

      if (!activation) {
        throw new Error("Activation not found");
      }

      await ctx.db
        .update(activations)
        .set({ featured: !activation.featured })
        .where(eq(activations.id, input.id));

      return { success: true };
    }),
});