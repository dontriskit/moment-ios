import { trpc } from '../trpc';

export function useProfileStats() {
  return trpc.user.getProfileStats.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useAchievements() {
  return trpc.user.getAchievements.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProgress() {
  const utils = trpc.useContext();
  
  return trpc.user.updateProgress.useMutation({
    onSuccess: () => {
      // Invalidate related queries
      utils.user.getProfileStats.invalidate();
      utils.user.getAchievements.invalidate();
      utils.challenges.getUserChallenges.invalidate();
    },
  });
}

export function useToggleFavorite() {
  const utils = trpc.useContext();
  
  return trpc.user.toggleFavorite.useMutation({
    onMutate: async ({ activationId }) => {
      // Optimistic update
      await utils.activation.getForYouPageData.cancel();
      
      const previousData = utils.activation.getForYouPageData.getData();
      
      if (previousData) {
        // Toggle favorite status optimistically
        const isFavorited = previousData.favorites.some(f => f.id === activationId);
        
        if (isFavorited) {
          // Remove from favorites
          utils.activation.getForYouPageData.setData(undefined, {
            ...previousData,
            favorites: previousData.favorites.filter(f => f.id !== activationId),
          });
        }
      }
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.activation.getForYouPageData.setData(undefined, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.activation.getForYouPageData.invalidate();
    },
  });
}

export function useCompleteOnboarding() {
  return trpc.user.completeOnboardingQuiz.useMutation({
    onSuccess: () => {
      // Refresh user data after completing onboarding
      window.location.reload(); // Simple approach - in production, update auth context
    },
  });
}

export function useUpdateProfile() {
  const utils = trpc.useContext();
  
  return trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfileStats.invalidate();
    },
  });
}