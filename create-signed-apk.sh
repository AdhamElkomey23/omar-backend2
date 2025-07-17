#!/bin/bash

echo "Creating signed APK for Android installation..."

# Create APK structure
mkdir -p signed-apk/{META-INF,res/values,assets/www}

# Copy web files
cp -r dist/public/* signed-apk/assets/www/

# Create AndroidManifest.xml
cat > signed-apk/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.alwasiloon.fertilizer"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-permission android:name="android.permission.INTERNET" />
    
    <application android:label="Al-Wasiloon Fertilizer">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create strings.xml
cat > signed-apk/res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Al-Wasiloon Fertilizer</string>
</resources>
EOF

# Create unsigned APK
cd signed-apk
zip -r ../unsigned.apk . -x "*.sh"
cd ..

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass android -keypass android unsigned.apk alias_name

# Rename to final APK
mv unsigned.apk Al-Wasiloon-Fertilizer-SIGNED.apk

echo "Signed APK created: Al-Wasiloon-Fertilizer-SIGNED.apk"
ls -la *.apk