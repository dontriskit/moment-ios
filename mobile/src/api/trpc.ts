import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import * as SecureStore from 'expo-secure-store';
import config from '../config';
import type { AppRouter } from '../../../nextjs-app/src/server/api/root';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: config.apiTrpcUrl,
      transformer: superjson,
      headers: async () => {
        const token = await SecureStore.getItemAsync('authToken');
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});