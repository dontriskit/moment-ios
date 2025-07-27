import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { 
  articles, 
  authors, 
  tags, 
  articleTags,
  articleStats,
  categories,
  activityLog,
  dailyActivitySummary,
  users
} from "@/server/db/schema";
import { eq, desc, sql, and, or, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const articlesRouter = createTRPCRouter({
  // Public endpoints
  getPublished: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(12),
      type: z.enum(["blog", "news", "all"]).default("all"),
      tagSlug: z.string().optional(),
      authorSlug: z.string().optional(),
      categoryId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      
      const where = and(
        eq(articles.status, "published"),
        input.type !== "all" ? eq(articles.type, input.type) : undefined,
        input.categoryId ? eq(articles.categoryId, input.categoryId) : undefined,
      );

      const allArticles = await ctx.db.query.articles.findMany({
        where,
        orderBy: [desc(articles.publishedAt)],
        limit: input.limit,
        offset,
        with: {
          author: true,
          category: true,
          tags: {
            with: {
              tag: true,
            },
          },
          stats: true,
        },
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(where);

      return {
        articles: allArticles,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.db.query.articles.findFirst({
        where: and(
          eq(articles.slug, input.slug),
          eq(articles.status, "published")
        ),
        with: {
          author: true,
          category: true,
          tags: {
            with: {
              tag: true,
            },
          },
          stats: true,
        },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Increment view count
      await ctx.db
        .insert(articleStats)
        .values({
          articleId: article.id,
          views: 1,
        })
        .onConflictDoUpdate({
          target: articleStats.articleId,
          set: {
            views: sql`${articleStats.views} + 1`,
            updatedAt: new Date(),
          },
        });

      // Log activity
      await ctx.db.insert(activityLog).values({
        userId: ctx.session.user.id,
        action: 'article_read',
        entityType: 'article',
        entityId: article.id,
        metadata: {
          articleTitle: article.title,
          articleType: article.type,
          readTime: article.readTime,
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
            eq(dailyActivitySummary.userId, ctx.session.user.id),
            eq(dailyActivitySummary.date, todayStr as any)
          )
        )
        .limit(1);

      if (existingSummary.length === 0) {
        await ctx.db.insert(dailyActivitySummary).values({
          userId: ctx.session.user.id,
          date: todayStr as any,
          articlesRead: 1,
        });
      } else {
        await ctx.db
          .update(dailyActivitySummary)
          .set({
            articlesRead: sql`${dailyActivitySummary.articlesRead} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(dailyActivitySummary.id, existingSummary[0]!.id));
      }

      // Update user's last active
      await ctx.db
        .update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, ctx.session.user.id));

      return article;
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.db.query.articles.findFirst({
        where: eq(articles.id, input.id),
        with: {
          author: true,
          category: true,
          tags: {
            with: {
              tag: true,
            },
          },
          stats: true,
        },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return article;
    }),

  // Admin endpoints
  getAllForAdmin: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      status: z.enum(["all", "draft", "published", "scheduled"]).default("all"),
      type: z.enum(["all", "blog", "news"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const where = and(
        input.status !== "all" ? eq(articles.status, input.status) : undefined,
        input.type !== "all" ? eq(articles.type, input.type) : undefined,
        input.search ? 
          or(
            sql`${articles.title} ILIKE ${'%' + input.search + '%'}`,
            sql`${articles.content} ILIKE ${'%' + input.search + '%'}`
          ) : undefined,
      );

      const allArticles = await ctx.db.query.articles.findMany({
        where,
        orderBy: [desc(articles.createdAt)],
        limit: input.limit,
        offset,
        with: {
          author: true,
          category: true,
          tags: {
            with: {
              tag: true,
            },
          },
          stats: true,
        },
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(where);

      return {
        articles: allArticles,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      coverImageUrl: z.string().optional(),
      authorId: z.string(),
      categoryId: z.string().optional(),
      type: z.enum(["blog", "news"]),
      status: z.enum(["draft", "published", "scheduled"]),
      publishedAt: z.date().optional(),
      featured: z.boolean().default(false),
      tagIds: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { tagIds, ...articleData } = input;

      // Calculate read time
      const wordCount = articleData.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

      const [article] = await ctx.db
        .insert(articles)
        .values({
          ...articleData,
          readTime,
          publishedAt: articleData.status === "published" && !articleData.publishedAt 
            ? new Date() 
            : articleData.publishedAt,
        })
        .returning();

      if (!article) {
        throw new Error("Failed to create article");
      }

      // Create article stats
      await ctx.db.insert(articleStats).values({
        articleId: article.id,
      });

      // Add tags
      if (tagIds.length > 0) {
        await ctx.db.insert(articleTags).values(
          tagIds.map(tagId => ({
            articleId: article.id,
            tagId,
          }))
        );
      }

      return article;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      coverImageUrl: z.string().optional(),
      authorId: z.string(),
      categoryId: z.string().optional(),
      type: z.enum(["blog", "news"]),
      status: z.enum(["draft", "published", "scheduled"]),
      publishedAt: z.date().optional(),
      featured: z.boolean().default(false),
      tagIds: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, tagIds, ...articleData } = input;

      // Calculate read time
      const wordCount = articleData.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);

      const [article] = await ctx.db
        .update(articles)
        .set({
          ...articleData,
          readTime,
          publishedAt: articleData.status === "published" && !articleData.publishedAt 
            ? new Date() 
            : articleData.publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, id))
        .returning();

      // Update tags
      await ctx.db.delete(articleTags).where(eq(articleTags.articleId, id));
      if (tagIds.length > 0) {
        await ctx.db.insert(articleTags).values(
          tagIds.map(tagId => ({
            articleId: id,
            tagId,
          }))
        );
      }

      return article;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(articles)
        .where(eq(articles.id, input.id));

      return { success: true };
    }),

  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [article] = await ctx.db
        .select({ featured: articles.featured })
        .from(articles)
        .where(eq(articles.id, input.id));

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      await ctx.db
        .update(articles)
        .set({ featured: !article.featured })
        .where(eq(articles.id, input.id));

      return { success: true };
    }),
});