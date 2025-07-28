# Local Testing Guide for Ulepszenia Mobile App

## Quick Start for Local Development

### 1. Backend Setup

First, start your Next.js backend:
```bash
cd nextjs-app
pnpm install
pnpm dev
```

Make sure your backend is running on `http://localhost:3000`

### 2. Update Mobile App Configuration

Update `/mobile/src/config/index.ts` with your local IP address:
```typescript
dev: {
  apiUrl: 'http://YOUR_LOCAL_IP:3000', // Replace with your computer's IP
  apiTrpcUrl: 'http://YOUR_LOCAL_IP:3000/api/trpc',
},
```

To find your local IP:
- On Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- On Linux: `ip addr show | grep "inet " | grep -v 127.0.0.1`
- On Windows: `ipconfig | findstr IPv4`

### 3. Google OAuth Setup (Simplified for Local Testing)

For local testing with Expo Go, you have two options:

#### Option A: Test without Google OAuth (Quickest)
- Use email/password authentication for testing
- Skip Google OAuth temporarily

#### Option B: Set up Google OAuth for Local Testing
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing
3. Enable Google Identity API
4. Create OAuth 2.0 Web Client ID
5. Add authorized redirect URI: `https://auth.expo.io/@anonymous/ulepszenia`
   (Note: For Expo Go, you don't need a username, use @anonymous)

### 4. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

### 5. Test on Your Device

#### Using Expo Go App:
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. The app will load on your device

#### Testing Authentication:
1. **Email/Password**: Works immediately
   - Register a new account
   - Sign in with credentials

2. **Google OAuth**: 
   - Click "Continue with Google"
   - Complete Google sign-in
   - App will receive tokens

### Common Issues & Solutions

#### "Network request failed"
- Make sure you're using your computer's IP address, not localhost
- Ensure your phone and computer are on the same network
- Check firewall settings

#### Google OAuth not working
- For Expo Go, `useProxy: true` handles the OAuth flow
- Make sure your Google Client ID is the Web Client ID (not iOS/Android)
- Check that the redirect URI matches exactly

#### Backend connection issues
- Verify backend is running: `http://YOUR_IP:3000`
- Test in browser first: `http://YOUR_IP:3000/api/mobile/auth/session`
- Check CORS settings if needed

### Testing Checklist

- [ ] Backend running on local IP
- [ ] Mobile config updated with correct IP
- [ ] Can access backend from phone browser
- [ ] Email registration works
- [ ] Email login works
- [ ] Logout works
- [ ] (Optional) Google OAuth works

### Development Tips

1. **Hot Reload**: Changes to your mobile code will automatically reload
2. **Debug Menu**: Shake device or press `m` in terminal for dev menu
3. **Logs**: Use `console.log()` - logs appear in terminal
4. **Network Inspector**: Use React Native Debugger to inspect API calls

### Next Steps

Once local testing works:
1. Build a development client for more features: `expo run:ios` or `expo run:android`
2. Test on physical devices
3. Set up proper OAuth for production
4. Configure environment-specific settings