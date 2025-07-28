# Google OAuth Setup for Ulepszenia Mobile App

## Prerequisites
- Google Cloud Console account
- Access to create OAuth 2.0 credentials

## Setup Instructions

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API

### 2. Configure OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: Ulepszenia
   - User support email: your-email@example.com
   - App logo: Upload your app logo
   - Application home page: https://ulepszenia.com
   - Application privacy policy: https://ulepszenia.com/privacy
   - Application terms of service: https://ulepszenia.com/terms
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users if in development

### 3. Create OAuth 2.0 Client IDs

#### For Web (Required for mobile OAuth flow)
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Name: "Ulepszenia Web Client"
5. Authorized redirect URIs:
   - `https://ulepszenia.com/api/auth/callback/google`
   - `https://auth.expo.io/@anonymous/ulepszenia` (for Expo Go development without account)
   - `https://auth.expo.io/@your-expo-username/ulepszenia` (if you have an Expo account)
   - `http://localhost:3000/api/auth/callback/google` (for local development)

#### For iOS
1. Create another OAuth client ID
2. Choose **iOS**
3. Bundle ID: `com.ulepszenia.app`
4. App Store ID: (add when you have one)

#### For Android
1. Create another OAuth client ID
2. Choose **Android**
3. Package name: `com.ulepszenia.app`
4. SHA-1 certificate fingerprint: (get from your keystore)

### 4. Update Environment Variables

Add the following to your backend `.env` file:
```
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-web-client-secret
```

### 5. Update Mobile App Configuration

Update the Google Client ID in `/mobile/src/contexts/AuthContext.tsx`:
```typescript
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: 'YOUR-WEB-CLIENT-ID.apps.googleusercontent.com', // Replace this
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'ulepszenia',
    useProxy: true,
  }),
});
```

### 6. Testing in Development

#### With Expo Go:
1. The `useProxy: true` option allows testing without configuring native OAuth
2. Make sure your redirect URI includes the Expo auth proxy URL

#### Standalone Builds:
1. For iOS: Configure URL schemes in app.json
2. For Android: Configure intent filters in app.json
3. Build using `expo build:ios` or `expo build:android`

### 7. Production Deployment

1. Remove `useProxy: true` for production builds
2. Update redirect URIs to production URLs
3. Ensure all client IDs are properly configured
4. Test thoroughly on both platforms

## Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Ensure the redirect URI in your app matches exactly what's configured in Google Cloud Console
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client ID"**
   - Verify you're using the Web Client ID for the OAuth flow
   - Ensure the client ID is correctly copied without extra spaces

3. **"User cancelled"**
   - This is normal when users cancel the OAuth flow
   - Handle gracefully in your app

4. **Network errors**
   - Check internet connectivity
   - Verify backend URLs are accessible

## Security Notes

- Never commit client secrets to version control
- Use environment variables for sensitive configuration
- Implement proper token validation on the backend
- Use HTTPS in production