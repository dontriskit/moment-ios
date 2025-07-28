import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
// You'll need to set up OAuth 2.0 credentials in Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET'; // Only for web

export const useGoogleAuth = () => {
  // Use proxy service for Expo Go development
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // This enables Expo's auth proxy for development
  });

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');

  // Create auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  return {
    request,
    response,
    promptAsync,
    redirectUri,
  };
};

// Alternative approach using web browser for development
export const googleAuthWebBrowser = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    // Build authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&include_granted_scopes=true`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      // Extract access token from URL
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
        );
        const userInfo = await userInfoResponse.json();
        
        return {
          accessToken,
          user: userInfo,
        };
      }
    }

    throw new Error('Google authentication was cancelled');
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};