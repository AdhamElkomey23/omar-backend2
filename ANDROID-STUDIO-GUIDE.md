# Complete Android Studio APK Build Guide

## Prerequisites
1. Download and install Android Studio from: https://developer.android.com/studio
2. During installation, make sure to install Android SDK and Android Virtual Device (AVD)

## Step 1: Create New Project

1. Open Android Studio
2. Click "New Project"
3. Select "Empty Activity"
4. Configure your project:
   - **Name:** Al-Wasiloon Fertilizer Factory
   - **Package name:** com.alwasiloon.fertilizer
   - **Save location:** Choose any folder
   - **Language:** Java
   - **Minimum SDK:** API 21 (Android 5.0)
5. Click "Finish"

## Step 2: Configure Project Files

### 2.1 Update AndroidManifest.xml
Replace the content in `app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.alwasiloon.fertilizer">

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
```

### 2.2 Update MainActivity.java
Replace the content in `app/src/main/java/com/alwasiloon/fertilizer/MainActivity.java`:

```java
package com.alwasiloon.fertilizer;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.view.WindowManager;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Full screen
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        
        // Create WebView
        webView = new WebView(this);
        setContentView(webView);
        
        // Configure WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(false);
        webSettings.setDefaultTextEncodingName("utf-8");
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // Load local HTML file
        webView.loadUrl("file:///android_asset/index.html");
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

### 2.3 Copy Web Files
1. Extract the `WEB-FILES-FOR-APK-BUILDER.zip` file
2. Copy ALL extracted files to: `app/src/main/assets/`
   - This includes: index.html, assets folder, and all other files

## Step 3: Build the APK

### 3.1 Sync Project
1. Click "Sync Project with Gradle Files" (elephant icon in toolbar)
2. Wait for sync to complete

### 3.2 Build APK
1. Go to menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Click "locate" when build finishes

### 3.3 Find Your APK
The APK will be located at:
`app/build/outputs/apk/debug/app-debug.apk`

## Step 4: Install on Phone

1. Copy `app-debug.apk` to your Android phone
2. Enable "Unknown Sources" in Settings → Security
3. Tap the APK file to install
4. Allow installation from this source
5. Your app will be installed!

## Troubleshooting

### If Build Fails:
1. Check Android SDK is installed: **Tools → SDK Manager**
2. Make sure you have API level 21+ installed
3. Try **Build → Clean Project** then rebuild

### If WebView Shows Blank:
1. Check that all web files are in `assets` folder
2. Verify `index.html` exists in the root of assets
3. Check Android device has internet permission

### If App Crashes:
1. Check logcat in Android Studio for error messages
2. Ensure all permissions are in AndroidManifest.xml
3. Try on Android 5.0+ device

## Alternative: Release APK (Signed)

For a production-ready APK:
1. Go to **Build → Generate Signed Bundle / APK**
2. Select APK
3. Create new keystore or use existing
4. Fill in keystore details
5. Choose "release" build variant
6. Build will create signed APK ready for distribution

This creates a professional APK that can be shared and installed on any Android device.