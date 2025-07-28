import { trpc } from '../trpc';

export function useForYouData() {
  return trpc.activation.getForYouPageData.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useActivationById(id: string) {
  return trpc.activation.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useActivationsByCategory(categorySlug: string) {
  return trpc.activation.getByCategory.useQuery(
    { categorySlug },
    {
      enabled: !!categorySlug,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useCategories() {
  return trpc.category.getAll.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  });
}

export function useSearchActivations(query: string) {
  return trpc.activation.search.useQuery(
    { query },
    {
      enabled: query.length > 2,
      staleTime: 2 * 60 * 1000,
    }
  );
}