import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.29:3000', // For web testing, use your local IP for mobile
    apiTrpcUrl: 'http://192.168.1.29:3000/api/trpc',
  },
  staging: {
    apiUrl: 'https://staging.ulepszenia.com',
    apiTrpcUrl: 'https://staging.ulepszenia.com/api/trpc',
  },
  prod: {
    apiUrl: 'https://ulepszenia.com',
    apiTrpcUrl: 'https://ulepszenia.com/api/trpc',
  },
};

const getEnvVars = () => {
  // Default to dev if not specified
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel ?? 'dev';
  
  if (releaseChannel === 'prod') return ENV.prod;
  if (releaseChannel === 'staging') return ENV.staging;
  return ENV.dev;
};

export default getEnvVars();