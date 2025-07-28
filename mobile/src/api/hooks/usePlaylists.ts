import { trpc } from '../trpc';

export function useUserPlaylists() {
  return trpc.playlist.getUserPlaylists.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaylistById(id: string) {
  return trpc.playlist.getPlaylistById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    }
  );
}

export function useCreatePlaylist() {
  const utils = trpc.useContext();
  
  return trpc.playlist.createPlaylist.useMutation({
    onSuccess: () => {
      utils.playlist.getUserPlaylists.invalidate();
    },
  });
}

export function useDeletePlaylist() {
  const utils = trpc.useContext();
  
  return trpc.playlist.deletePlaylist.useMutation({
    onSuccess: () => {
      utils.playlist.getUserPlaylists.invalidate();
    },
  });
}

export function useAddToPlaylist() {
  const utils = trpc.useContext();
  
  return trpc.playlist.addToPlaylist.useMutation({
    onSuccess: (_, variables) => {
      // Invalidate the specific playlist
      utils.playlist.getPlaylistById.invalidate({ id: variables.playlistId });
      utils.playlist.getUserPlaylists.invalidate();
    },
  });
}

export function useRemoveFromPlaylist() {
  const utils = trpc.useContext();
  
  return trpc.playlist.removeFromPlaylist.useMutation({
    onSuccess: (_, variables) => {
      utils.playlist.getPlaylistById.invalidate({ id: variables.playlistId });
      utils.playlist.getUserPlaylists.invalidate();
    },
  });
}

export function useReorderPlaylist() {
  const utils = trpc.useContext();
  
  return trpc.playlist.reorderPlaylist.useMutation({
    onMutate: async ({ playlistId, activationIds }) => {
      // Cancel outgoing refetches
      await utils.playlist.getPlaylistById.cancel({ id: playlistId });
      
      // Get current data
      const previousData = utils.playlist.getPlaylistById.getData({ id: playlistId });
      
      // Optimistically update the order
      if (previousData) {
        const reorderedItems = activationIds.map((id, index) => {
          const item = previousData.items.find(i => i.activationId === id);
          return item ? { ...item, position: index } : null;
        }).filter(Boolean);
        
        utils.playlist.getPlaylistById.setData(
          { id: playlistId },
          {
            ...previousData,
            items: reorderedItems as any,
          }
        );
      }
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.playlist.getPlaylistById.setData(
          { id: variables.playlistId },
          context.previousData
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      utils.playlist.getPlaylistById.invalidate({ id: variables.playlistId });
    },
  });
}