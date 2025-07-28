import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, TRPCClientError } from '@trpc/client';
import superjson from 'superjson';
import * as SecureStore from 'expo-secure-store';
import config from '../config';
import type { AppRouter } from '../../../nextjs-app/src/server/api/root';

export const trpc = createTRPCReact<AppRouter>();

let authTokenCache: string | null = null;

// Helper to get auth token with caching
const getAuthToken = async () => {
  if (!authTokenCache) {
    authTokenCache = await SecureStore.getItemAsync('authToken');
  }
  return authTokenCache;
};

// Clear cache when token changes
export const clearAuthTokenCache = () => {
  authTokenCache = null;
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: config.apiTrpcUrl,
      transformer: superjson,
      headers: async () => {
        const token = await getAuthToken();
        const headers: Record<string, string> = {};
        
        if (token) {
          headers.authorization = `Bearer ${token}`;
        }
        
        return headers;
      },
      fetch: async (url, options) => {
        const response = await fetch(url, options);
        
        // Handle 401 errors globally
        if (response.status === 401) {
          // Clear auth data and redirect to login
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await SecureStore.deleteItemAsync('userData');
          clearAuthTokenCache();
          
          // The auth context will handle navigation
          throw new TRPCClientError('Unauthorized');
        }
        
        return response;
      },
    }),
  ],
});