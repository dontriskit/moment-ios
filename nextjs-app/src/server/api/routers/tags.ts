import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { tags, articleTags } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const tagsRouter = createTRPCRouter({
  // Public endpoints
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allTags = await ctx.db.query.tags.findMany({
      orderBy: [tags.name],
    });

    // Get article count for each tag
    const tagCounts = await ctx.db
      .select({
        tagId: articleTags.tagId,
        count: sql<number>`count(*)`,
      })
      .from(articleTags)
      .groupBy(articleTags.tagId);

    const tagsWithCounts = allTags.map(tag => ({
      ...tag,
      articleCount: tagCounts.find(tc => tc.tagId === tag.id)?.count || 0,
    }));

    return tagsWithCounts;
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.query.tags.findFirst({
        where: eq(tags.slug, input.slug),
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return tag;
    }),

  // Admin endpoints
  getAllForAdmin: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const where = input.search
        ? sql`${tags.name} ILIKE ${'%' + input.search + '%'}`
        : undefined;

      const allTags = await ctx.db.query.tags.findMany({
        where,
        orderBy: [tags.name],
        limit: input.limit,
        offset,
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(tags)
        .where(where);

      // Get article count for each tag
      const tagCounts = await ctx.db
        .select({
          tagId: articleTags.tagId,
          count: sql<number>`count(*)`,
        })
        .from(articleTags)
        .groupBy(articleTags.tagId);

      const tagsWithCounts = allTags.map(tag => ({
        ...tag,
        articleCount: tagCounts.find(tc => tc.tagId === tag.id)?.count || 0,
      }));

      return {
        tags: tagsWithCounts,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i),
    }))
    .mutation(async ({ ctx, input }) => {
      const [tag] = await ctx.db
        .insert(tags)
        .values(input)
        .returning();

      return tag;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...tagData } = input;

      const [tag] = await ctx.db
        .update(tags)
        .set(tagData)
        .where(eq(tags.id, id))
        .returning();

      return tag;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if tag is used
      const tagUsage = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(articleTags)
        .where(eq(articleTags.tagId, input.id));

      if (Number(tagUsage[0]?.count || 0) > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nie można usunąć tagu, który jest używany w artykułach",
        });
      }

      await ctx.db
        .delete(tags)
        .where(eq(tags.id, input.id));

      return { success: true };
    }),
});