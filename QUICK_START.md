# Quick Start Guide - CodeCore

## Overview
This guide will help you start developing the **CodeCore** Android app immediately.

## Prerequisites Installation

### 1. Install Android Studio
- Download from: https://developer.android.com/studio
- Version: Hedgehog (2023.1.1) or later
- Install with default settings

### 2. Install JDK 17
- Bundled with Android Studio, or
- Download from: https://www.oracle.com/java/technologies/downloads/#java17

### 3. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name: "CodeCore"
4. Disable Google Analytics (optional for now)
5. Create project

### 4. Get AI API Key
**Option A: Google Gemini (Recommended)**
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Save securely

**Option B: OpenAI**
1. Go to https://platform.openai.com/api-keys
2. Create API key
3. Save securely

## Project Setup (30 minutes)

### Step 1: Create Android Project
```bash
# Open Android Studio
# File > New > New Project
# Select: Empty Activity
# Configure:
Name: CodeCore
Package: com.codecore.app
Language: Kotlin
Minimum SDK: API 24 (Android 7.0)
Build configuration: Kotlin DSL
```

### Step 2: Add Firebase to Android App
1. In Firebase Console, click "Add app" > Android
2. Enter package name: `com.mastercs.fundamentals`
3. Download `google-services.json`
4. Place in `app/` directory
5. Follow Firebase setup instructions

### Step 3: Update build.gradle.kts Files

**Project level (build.gradle.kts):**
```kotlin
plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.20" apply false
    id("com.google.gms.google-services") version "4.4.0" apply false
}
```

**App level (app/build.gradle.kts):**
```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.mastercs.fundamentals"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.mastercs.fundamentals"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // Add API key
        buildConfigField("String", "GEMINI_API_KEY", "\"${project.findProperty("GEMINI_API_KEY") ?: ""}\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.1")

    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.5")

    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-storage-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")

    // AI
    implementation("com.google.ai.client.generativeai:generativeai:0.1.2")

    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
```

### Step 4: Add API Key to local.properties
```properties
# local.properties (create if doesn't exist)
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 5: Sync Project
```
File > Sync Project with Gradle Files
```

## Enable Firebase Services

### 1. Firebase Authentication
1. Firebase Console > Build > Authentication
2. Click "Get started"
3. Enable "Email/Password"
4. Save

### 2. Cloud Firestore
1. Firebase Console > Build > Firestore Database
2. Click "Create database"
3. Start in **production mode**
4. Choose location (closest to users)
5. Enable

### 3. Firebase Storage
1. Firebase Console > Build > Storage
2. Click "Get started"
3. Start in **production mode**
4. Enable

### 4. Set Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /materials/{materialId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    
    match /admins/{email} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/admins/$(request.auth.token.email)).data.approved == true;
    }
  }
}
```

### 5. Add Admin Email to Firestore
1. Go to Firestore Database
2. Start collection: `admins`
3. Document ID: your email (e.g., `admin@example.com`)
4. Add field: `approved` (boolean) = `true`
5. Save

## Project Structure Creation

Run these commands in Android Studio terminal:

```bash
# Navigate to app/src/main/java/com/mastercs/fundamentals/
cd app/src/main/java/com/mastercs/fundamentals/

# Create directories
mkdir -p data/models
mkdir -p data/repository
mkdir -p data/remote
mkdir -p ui/auth
mkdir -p ui/admin
mkdir -p ui/student
mkdir -p ui/assistant
mkdir -p ui/components
mkdir -p ui/theme
mkdir -p viewmodel
mkdir -p utils
```

## Development Workflow

### Phase 1: Authentication (Week 1-2)
1. Create data models (User, UserRole)
2. Build AuthRepository with Firebase
3. Create AuthViewModel
4. Design login/register screens
5. Implement navigation

### Phase 2: Admin CMS (Week 3-4)
1. Create Material data model
2. Build MaterialRepository
3. Create upload functionality
4. Design admin dashboard
5. Implement edit/delete features

### Phase 3: Student Interface (Week 5)
1. Create browse screen
2. Implement search/filter
3. Build material detail viewer
4. Add bookmark functionality

### Phase 4: AI Assistant (Week 6-7)
1. Integrate Gemini API
2. Implement speech recognition
3. Add text-to-speech
4. Design chat interface
5. Add conversation history

### Phase 5: Polish (Week 8-9)
1. Implement dark/light theme
2. Add animations
3. Optimize performance
4. Fix bugs
5. Write tests

## Testing Your App

### Run on Emulator
```bash
# In Android Studio:
# Tools > Device Manager > Create Virtual Device
# Select: Pixel 6 with API 34
# Click Run (green play button)
```

### Run on Physical Device
1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect via USB
4. Select device in Android Studio
5. Click Run

## Common Issues & Solutions

### Issue: google-services.json not found
**Solution:** Ensure file is in `app/` directory, not `app/src/`

### Issue: API key not found
**Solution:** Check `local.properties` has correct key, sync Gradle

### Issue: Firebase authentication fails
**Solution:** Verify SHA-1 fingerprint added to Firebase project

### Issue: Compose preview not showing
**Solution:** Invalidate caches (File > Invalidate Caches > Restart)

## Next Steps

1. ✅ Complete setup (you are here)
2. 📖 Read `IMPLEMENTATION_PLAN.md` for detailed roadmap
3. 🏗️ Review `ARCHITECTURE.md` for system design
4. 💻 Start coding with Phase 1 (Authentication)
5. 🚀 Follow `DEPLOYMENT_GUIDE.md` when ready to launch

## Useful Commands

```bash
# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Run tests
./gradlew test

# Check dependencies
./gradlew dependencies

# Generate release bundle
./gradlew bundleRelease
```

## Resources

- **Android Docs:** https://developer.android.com
- **Firebase Docs:** https://firebase.google.com/docs
- **Jetpack Compose:** https://developer.android.com/jetpack/compose
- **Gemini API:** https://ai.google.dev/docs
- **Material 3:** https://m3.material.io

## Getting Help

- Stack Overflow: Tag with `android`, `kotlin`, `firebase`
- Firebase Support: https://firebase.google.com/support
- Android Developers Discord: https://discord.gg/android

---

**Ready to code?** Start with creating your first screen in `ui/auth/LoginScreen.kt`!
