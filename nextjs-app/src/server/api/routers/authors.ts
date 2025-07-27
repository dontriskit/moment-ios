import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { authors, articles, users } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const authorsRouter = createTRPCRouter({
  // Public endpoints
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allAuthors = await ctx.db.query.authors.findMany({
      orderBy: [authors.name],
      with: {
        user: true,
      },
    });

    // Get article count for each author
    const authorCounts = await ctx.db
      .select({
        authorId: articles.authorId,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .groupBy(articles.authorId);

    const authorsWithCounts = allAuthors.map(author => ({
      ...author,
      articleCount: authorCounts.find(ac => ac.authorId === author.id)?.count || 0,
    }));

    return authorsWithCounts;
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const author = await ctx.db.query.authors.findFirst({
        where: eq(authors.slug, input.slug),
        with: {
          user: true,
        },
      });

      if (!author) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      return author;
    }),

  // Admin endpoints
  getAllForAdmin: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const where = input.search
        ? sql`${authors.name} ILIKE ${'%' + input.search + '%'}`
        : undefined;

      const allAuthors = await ctx.db.query.authors.findMany({
        where,
        orderBy: [desc(authors.createdAt)],
        limit: input.limit,
        offset,
        with: {
          user: true,
        },
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(authors)
        .where(where);

      // Get article count and stats for each author
      const authorStats = await ctx.db
        .select({
          authorId: articles.authorId,
          articleCount: sql<number>`count(*)`,
          publishedCount: sql<number>`count(*) filter (where ${articles.status} = 'published')`,
          draftCount: sql<number>`count(*) filter (where ${articles.status} = 'draft')`,
        })
        .from(articles)
        .groupBy(articles.authorId);

      const authorsWithStats = allAuthors.map(author => ({
        ...author,
        stats: authorStats.find(as => as.authorId === author.id) || {
          articleCount: 0,
          publishedCount: 0,
          draftCount: 0,
        },
      }));

      return {
        authors: authorsWithStats,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      userId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user exists if userId is provided
      if (input.userId) {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, input.userId),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
      }

      const [author] = await ctx.db
        .insert(authors)
        .values(input)
        .returning();

      return author;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      slug: z.string().min(1),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      userId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...authorData } = input;

      // Verify user exists if userId is provided
      if (authorData.userId) {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, authorData.userId),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
      }

      const [author] = await ctx.db
        .update(authors)
        .set(authorData)
        .where(eq(authors.id, id))
        .returning();

      return author;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if author has articles
      const authorArticles = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.authorId, input.id));

      if (Number(authorArticles[0]?.count || 0) > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nie można usunąć autora, który ma artykuły",
        });
      }

      await ctx.db
        .delete(authors)
        .where(eq(authors.id, input.id));

      return { success: true };
    }),

  // Get users that can be assigned as authors
  getAvailableUsers: adminProcedure.query(async ({ ctx }) => {
    // Get all users
    const allUsers = await ctx.db.query.users.findMany({
      orderBy: [users.name],
    });

    // Get users that are already authors
    const existingAuthors = await ctx.db.query.authors.findMany({
      where: sql`${authors.userId} IS NOT NULL`,
    });

    const existingUserIds = new Set(existingAuthors.map(a => a.userId).filter(Boolean));

    // Filter out users that are already authors
    const availableUsers = allUsers.filter(user => !existingUserIds.has(user.id));

    return availableUsers;
  }),
});