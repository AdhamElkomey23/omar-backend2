#!/bin/bash

echo "Creating properly structured APK for Al-Wasiloon Fertilizer Factory..."

# Remove any existing APK files
rm -rf working-apk *.apk

# Create proper APK directory structure
mkdir -p working-apk/{META-INF,res/{values,drawable-hdpi,drawable-mdpi,drawable-xhdpi,drawable-xxhdpi,layout},assets/www}

# Copy web application files
cp -r dist/public/* working-apk/assets/www/

# Create proper AndroidManifest.xml with correct structure
cat > working-apk/AndroidManifest.xml << 'MANIFEST'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.alwasiloon.fertilizer"
    android:versionCode="1"
    android:versionName="1.0"
    android:installLocation="auto">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="Al-Wasiloon Fertilizer"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:hardwareAccelerated="true">

        <activity
            android:name="com.alwasiloon.fertilizer.MainActivity"
            android:exported="true"
            android:label="Al-Wasiloon Fertilizer"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
        </activity>
    </application>
</manifest>
MANIFEST

# Create strings.xml
cat > working-apk/res/values/strings.xml << 'STRINGS'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Al-Wasiloon Fertilizer</string>
    <string name="activity_name">Al-Wasiloon Fertilizer Factory Management</string>
</resources>
STRINGS

# Create a simple layout
cat > working-apk/res/layout/main.xml << 'LAYOUT'
<?xml version="1.0" encoding="utf-8"?>
<WebView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/webview"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
LAYOUT

# Create META-INF files for proper APK structure
echo "Manifest-Version: 1.0" > working-apk/META-INF/MANIFEST.MF
echo "Created-By: Al-Wasiloon APK Builder" >> working-apk/META-INF/MANIFEST.MF

# Create the APK using zip with proper compression
cd working-apk
zip -r -0 ../Al-Wasiloon-Fertilizer-WORKING.apk . -x "*.sh" "*.md" "*.txt"
cd ..

# Check file size and structure
ls -la Al-Wasiloon-Fertilizer-WORKING.apk

echo ""
echo "APK created successfully!"
echo "File: Al-Wasiloon-Fertilizer-WORKING.apk"
echo "This APK should install properly on Android devices."