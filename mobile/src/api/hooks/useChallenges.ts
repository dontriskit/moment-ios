import { trpc } from '../trpc';

export function useUserChallenges() {
  return trpc.challenges.getUserChallenges.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for progress updates
  });
}

export function useActiveChallenges() {
  return trpc.challenges.getActiveChallenges.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompleteChallenge() {
  const utils = trpc.useContext();
  
  return trpc.challenges.completeChallenge.useMutation({
    onSuccess: () => {
      // Invalidate challenges and achievements
      utils.challenges.getUserChallenges.invalidate();
      utils.challenges.getActiveChallenges.invalidate();
      utils.user.getAchievements.invalidate();
      utils.user.getProfileStats.invalidate();
    },
  });
}