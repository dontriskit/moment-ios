import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "@/server/api/trpc";
import { categories, activations } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.categories.findMany({
      orderBy: [categories.name],
    });
  }),

  getAllForAdmin: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const allCategories = await ctx.db.query.categories.findMany({
        orderBy: [categories.name],
        limit: input.limit,
        offset,
      });

      // Get activation count for each category
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          const [countResult] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(activations)
            .where(eq(activations.categoryId, category.id));
          
          return {
            ...category,
            activationCount: Number(countResult?.count || 0),
          };
        })
      );

      const [totalResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(categories);

      return {
        categories: categoriesWithCounts,
        totalPages: Math.ceil(Number(totalResult?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({
        where: eq(categories.id, input.id),
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      slug: z.string().min(1).max(255),
      description: z.string().optional(),
      color: z.string().min(4).max(7).regex(/^#[0-9A-Fa-f]{3,6}$/),
      icon: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existing = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
      });

      if (existing) {
        throw new Error("A category with this slug already exists");
      }

      const [newCategory] = await ctx.db
        .insert(categories)
        .values(input)
        .returning();

      return newCategory;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      color: z.string().min(4).max(7).regex(/^#[0-9A-Fa-f]{3,6}$/).optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // If updating slug, check if it already exists
      if (updateData.slug) {
        const existing = await ctx.db.query.categories.findFirst({
          where: eq(categories.slug, updateData.slug),
        });

        if (existing && existing.id !== id) {
          throw new Error("A category with this slug already exists");
        }
      }

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

      return updatedCategory;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category has activations
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(activations)
        .where(eq(activations.categoryId, input.id));

      if (Number(countResult?.count || 0) > 0) {
        throw new Error("Cannot delete category with activations. Please reassign or delete the activations first.");
      }

      await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id));

      return { success: true };
    }),
});