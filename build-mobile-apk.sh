#!/bin/bash

echo "🚀 Building Mobile APK for Al-Wasiloon Fertilizer App..."

# Create APK directory structure
mkdir -p mobile-apk/assets
mkdir -p mobile-apk/META-INF

# Copy the built web assets
echo "📱 Copying web assets..."
cp -r dist/public/* mobile-apk/assets/

# Create AndroidManifest.xml
echo "📋 Creating AndroidManifest.xml..."
cat > mobile-apk/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.alwasiloon.fertilizer"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Al-Wasiloon Fertilizer"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
        </activity>
    </application>
</manifest>
EOF

echo "✅ Mobile APK structure created successfully!"
echo "📁 Files are ready in mobile-apk/ folder"
echo ""
echo "📱 To complete the APK creation:"
echo "1. Download and install Android Studio"
echo "2. Create a new project using the files in mobile-apk/"
echo "3. Build APK using Android Studio"
echo ""
echo "🚀 Alternative: Use online APK builders like AppsGeyser with your web app URL"
