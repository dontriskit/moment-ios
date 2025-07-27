# Plan: Convert Ulepszenia to iOS/Android Apps

## Recommended Approach: React Native with Expo

Since your app is already built with React/Next.js, React Native is the most natural choice. I recommend using **Expo** for the easiest development experience.

## Implementation Plan:

### 1. Create React Native/Expo App
- Initialize new Expo project with TypeScript template
- Set up project structure mirroring current web app
- Configure navigation (React Navigation with bottom tabs)

### 2. Share Business Logic
- Extract tRPC client logic to shared package
- Reuse TypeScript types and interfaces
- Create shared utilities for both web and mobile

### 3. Implement Core Features
- Authentication (using expo-auth-session)
- Audio playback (expo-av for audio files)
- Bottom navigation matching web app
- Main screens: For You, Explore, Playlists, Challenges, Profile

### 4. API Integration
- Configure tRPC client for React Native
- Handle authentication tokens
- Implement offline support with React Query

### 5. iOS Development Setup
- Install Expo Go app on your iPhone for testing
- Use Expo development builds for custom native code
- Configure Apple Developer account for TestFlight

### 6. Android Setup
- Test with Android emulator or physical device
- Configure Google Play Console for distribution

## Project Structure:
```
ulepszenia-com/
├── apps/
│   ├── web/ (current Next.js app)
│   ├── mobile/ (new React Native app)
│   └── admin/ (keep as web-only)
├── packages/
│   ├── api/ (shared tRPC routers)
│   ├── db/ (shared database schema)
│   └── ui/ (shared components if possible)
└── ...
```

## Key Technologies:
- **Expo SDK 51** - Latest stable version
- **React Navigation** - For navigation
- **expo-av** - For audio playback
- **expo-auth-session** - For authentication
- **React Query** - For API state management
- **NativeWind** - Tailwind CSS for React Native

## Development Workflow:
1. Keep admin panel as web-only
2. Mobile app for users/subscribers only
3. Share API and business logic
4. Test on real devices using Expo Go
5. Build development clients for advanced features

## Testing on iPhone:
1. Install Expo Go from App Store
2. Create Expo account
3. Run `npx expo start` in mobile app directory
4. Scan QR code with Expo Go app
5. Hot reload works automatically

## Next Steps:
1. Set up monorepo structure (using pnpm workspaces)
2. Create Expo app with TypeScript
3. Extract shared code
4. Implement authentication flow
5. Build first screens