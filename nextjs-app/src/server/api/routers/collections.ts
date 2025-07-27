import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { 
  ulepszeniaCollections, 
  collectionItems, 
  activations,
  categories 
} from "@/server/db/schema";
import { eq, desc, sql, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const collectionsRouter = createTRPCRouter({
  // Public endpoints
  getActiveByType: protectedProcedure
    .input(z.object({
      type: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const collections = await ctx.db.query.ulepszeniaCollections.findMany({
        where: and(
          eq(ulepszeniaCollections.type, input.type),
          eq(ulepszeniaCollections.isActive, true)
        ),
        orderBy: [asc(ulepszeniaCollections.position)],
        with: {
          items: {
            orderBy: [asc(collectionItems.position)],
            with: {
              activation: {
                with: {
                  category: true,
                },
              },
            },
          },
        },
      });

      return collections;
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.db.query.ulepszeniaCollections.findFirst({
        where: eq(ulepszeniaCollections.id, input.id),
        with: {
          items: {
            orderBy: [asc(collectionItems.position)],
            with: {
              activation: {
                with: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      return collection;
    }),

  // Admin endpoints
  getAllForAdmin: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      type: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const where = input.type
        ? eq(ulepszeniaCollections.type, input.type)
        : undefined;

      const collections = await ctx.db.query.ulepszeniaCollections.findMany({
        where,
        orderBy: [desc(ulepszeniaCollections.createdAt)],
        limit: input.limit,
        offset,
        with: {
          items: {
            with: {
              activation: true,
            },
          },
        },
      });

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(ulepszeniaCollections)
        .where(where);

      return {
        collections: collections,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / input.limit),
        currentPage: input.page,
      };
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.string().min(1),
      isActive: z.boolean().default(true),
      position: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const [collection] = await ctx.db
        .insert(ulepszeniaCollections)
        .values(input)
        .returning();

      return collection;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.string().min(1),
      isActive: z.boolean(),
      position: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const [collection] = await ctx.db
        .update(ulepszeniaCollections)
        .set(data)
        .where(eq(ulepszeniaCollections.id, id))
        .returning();

      return collection;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(ulepszeniaCollections)
        .where(eq(ulepszeniaCollections.id, input.id));

      return { success: true };
    }),

  // Collection items management
  addItem: adminProcedure
    .input(z.object({
      collectionId: z.string(),
      activationId: z.string(),
      position: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get max position if not provided
      let position = input.position;
      if (position === undefined) {
        const maxPosition = await ctx.db
          .select({ max: sql<number>`max(${collectionItems.position})` })
          .from(collectionItems)
          .where(eq(collectionItems.collectionId, input.collectionId));
        
        position = (Number(maxPosition[0]?.max) || 0) + 1;
      }

      await ctx.db
        .insert(collectionItems)
        .values({
          collectionId: input.collectionId,
          activationId: input.activationId,
          position,
        });

      return { success: true };
    }),

  removeItem: adminProcedure
    .input(z.object({
      collectionId: z.string(),
      activationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(collectionItems)
        .where(
          and(
            eq(collectionItems.collectionId, input.collectionId),
            eq(collectionItems.activationId, input.activationId)
          )
        );

      return { success: true };
    }),

  reorderItems: adminProcedure
    .input(z.object({
      collectionId: z.string(),
      items: z.array(z.object({
        activationId: z.string(),
        position: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update positions for all items
      await ctx.db.transaction(async (tx) => {
        for (const item of input.items) {
          await tx
            .update(collectionItems)
            .set({ position: item.position })
            .where(
              and(
                eq(collectionItems.collectionId, input.collectionId),
                eq(collectionItems.activationId, item.activationId)
              )
            );
        }
      });

      return { success: true };
    }),

  // Get available activations for a collection
  getAvailableActivations: adminProcedure
    .input(z.object({
      collectionId: z.string(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Get activations already in the collection
      const existingItems = await ctx.db.query.collectionItems.findMany({
        where: eq(collectionItems.collectionId, input.collectionId),
      });

      const existingActivationIds = existingItems.map(item => item.activationId);

      // Get all activations not in the collection
      const where = and(
        existingActivationIds.length > 0
          ? sql`${activations.id} NOT IN (${sql.join(existingActivationIds.map(id => sql`${id}`), sql`, `)})`
          : undefined,
        input.search
          ? sql`${activations.title} ILIKE ${'%' + input.search + '%'}`
          : undefined,
      );

      const availableActivations = await ctx.db.query.activations.findMany({
        where,
        orderBy: [desc(activations.createdAt)],
        limit: 50,
        with: {
          category: true,
        },
      });

      return availableActivations;
    }),
});