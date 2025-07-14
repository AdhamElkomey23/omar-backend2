# Al-Wasiloon Fertilizer Factory - Mobile App Setup

## Overview
This guide provides instructions for creating a mobile APK from the Al-Wasiloon Fertilizer Factory Management web application.

## Prerequisites
- Android Studio installed on your local machine
- Java Development Kit (JDK) 11 or higher
- Android SDK with API level 24 or higher

## Current Setup Status
✅ Capacitor is configured for mobile app development
✅ Android platform has been added to the project
✅ Web assets are built and synced to the Android project
✅ Basic Android project structure is in place

## Building the APK

### Method 1: Using Capacitor (Recommended)
1. Build the web application:
   ```bash
   vite build --outDir dist/public
   ```

2. Copy and sync to Android:
   ```bash
   npx cap copy android
   npx cap sync android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

4. In Android Studio:
   - Build > Generate Signed Bundle / APK
   - Choose APK and follow the wizard
   - Select debug or release build

### Method 2: Command Line (If Gradle is available)
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated in: `android/app/build/outputs/apk/debug/`

### Method 3: Using Replit Mobile Deployment
If available in your Replit environment:
1. Use the Replit mobile deployment feature
2. Follow the guided setup for mobile app creation

## App Configuration
- **App ID**: com.alwasiloon.fertilizer
- **App Name**: Al-Wasiloon Fertilizer
- **Package**: Al-Wasiloon Fertilizer Factory Management
- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)

## Features Enabled
- Native device integration with Capacitor plugins
- Status bar styling
- Keyboard management
- Haptic feedback support
- App lifecycle management

## Deployment Options
1. **Direct APK Installation**: Install the generated APK directly on Android devices
2. **Google Play Store**: Publish to the Play Store for wider distribution
3. **Enterprise Distribution**: Use for internal company deployment

## Next Steps
1. Test the APK on physical Android devices
2. Add app icons and splash screens
3. Configure app signing for release builds
4. Set up continuous integration for automated builds

## Troubleshooting
- If Gradle build fails, ensure Android SDK is properly configured
- For permission issues, check Android manifest configuration
- If web assets don't load, verify the webDir path in capacitor.config.ts