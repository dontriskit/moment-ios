import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { playlists, playlistItems } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const playlistRouter = createTRPCRouter({
  getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const userPlaylists = await ctx.db.query.playlists.findMany({
      where: eq(playlists.userId, ctx.session.user.id),
      orderBy: [desc(playlists.createdAt)],
      with: {
        items: {
          with: {
            activation: true,
          },
        },
      },
    });

    return userPlaylists.map(playlist => ({
      ...playlist,
      itemCount: playlist.items.length,
    }));
  }),

  getPlaylistById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.id),
          eq(playlists.userId, ctx.session.user.id)
        ),
        with: {
          items: {
            with: {
              activation: {
                with: {
                  category: true,
                },
              },
            },
            orderBy: [playlistItems.position],
          },
        },
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      return playlist;
    }),

  createPlaylist: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const [newPlaylist] = await ctx.db
        .insert(playlists)
        .values({
          name: input.name,
          userId: ctx.session.user.id,
        })
        .returning();

      return newPlaylist;
    }),

  deletePlaylist: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(playlists)
        .where(and(
          eq(playlists.id, input.id),
          eq(playlists.userId, ctx.session.user.id)
        ));

      return { success: true };
    }),

  addToPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      activationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify playlist ownership
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.session.user.id)
        ),
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // Get the highest position
      const items = await ctx.db.query.playlistItems.findMany({
        where: eq(playlistItems.playlistId, input.playlistId),
        orderBy: [desc(playlistItems.position)],
        limit: 1,
      });

      const nextPosition = items.length > 0 ? items[0]!.position + 1 : 0;

      await ctx.db.insert(playlistItems).values({
        playlistId: input.playlistId,
        activationId: input.activationId,
        position: nextPosition,
      });

      return { success: true };
    }),

  removeFromPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      activationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify playlist ownership
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.session.user.id)
        ),
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      await ctx.db
        .delete(playlistItems)
        .where(and(
          eq(playlistItems.playlistId, input.playlistId),
          eq(playlistItems.activationId, input.activationId)
        ));

      return { success: true };
    }),

  reorderPlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      activationIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify playlist ownership
      const playlist = await ctx.db.query.playlists.findFirst({
        where: and(
          eq(playlists.id, input.playlistId),
          eq(playlists.userId, ctx.session.user.id)
        ),
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // Update positions
      for (let i = 0; i < input.activationIds.length; i++) {
        await ctx.db
          .update(playlistItems)
          .set({ position: i })
          .where(and(
            eq(playlistItems.playlistId, input.playlistId),
            eq(playlistItems.activationId, input.activationIds[i]!)
          ));
      }

      return { success: true };
    }),
});