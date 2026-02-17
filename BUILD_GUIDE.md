# CodeCore - Build & Deployment Guide (Phase 1-3 Implementation)

## Current Status
✅ **Phases 1-3 Implementation Complete**: Authentication, Content Management, and Student Learning Interface

## Prerequisites

### 1. Environment Setup
- **Android Studio**: Hedgehog (2023.1.1) or later
- **JDK**: Version 17 (included with Android Studio)
- **Android SDK**: API 34 (Android 14)
- **Gradle**: 8.0+
- **Kotlin**: 1.9.20+

### 2. Firebase Project Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Project name: `CodeCore`
4. Continue through setup (disable analytics for now)

#### Step 2: Add Android App
1. In Firebase Console, click "Add app" → Android
2. Package name: `com.codecore.app`
3. App nickname: `CodeCore` (optional)
4. SHA-1 fingerprint (for Google Sign-In):
   ```bash
   # On Windows (PowerShell):
   cd $ENV:USERPROFILE\.android
   keytool -list -v -keystore debug.keystore
   # Password: android
   # Copy SHA-1 hash
   ```

#### Step 3: Download Configuration
1. Click "Download google-services.json"
2. Place file in: `app/` directory (same level as `build.gradle.kts`)

#### Step 4: Enable Services
In Firebase Console:
1. **Authentication**:
   - Go to Build → Authentication
   - Click "Get Started"
   - Enable "Email/Password" method
   - (Optional) Enable "Google" method later

2. **Firestore Database**:
   - Go to Build → Firestore Database
   - Click "Create Database"
   - Start in **Production mode**
   - Choose closest region
   - Copy security rules from `FIRESTORE_RULES.txt`
   - Paste in Rules tab
   - Publish rules

3. **Storage**:
   - Go to Build → Storage
   - Click "Get Started"
   - Accept default bucket name
   - Keep default rules for now

### 3. API Keys Setup

#### Option A: Google Gemini API (Recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Create `local.properties` in project root:
   ```properties
   sdk.dir=C:\\Users\\[YourUsername]\\AppData\\Local\\Android\\Sdk
   GEMINI_API_KEY=your_api_key_here
   ```

#### Option B: OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add to `local.properties`:
   ```properties
   OPENAI_API_KEY=your_api_key_here
   ```

---

## Build Instructions

### Step 1: Clone/Open Project
```bash
# Navigate to project directory
cd "D:\CS Fundamentals App"
```

### Step 2: Verify Gradle
```bash
# Windows PowerShell
.\gradlew.bat --version

# Expected output:
# Gradle 8.0+ with Kotlin...
```

### Step 3: Sync Project
```bash
# Sync Gradle files
.\gradlew.bat sync

# Or in Android Studio: File → Sync Now
```

### Step 4: Build APK/AAB

#### Debug Build (for testing)
```bash
# Build debug APK
.\gradlew.bat assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

#### Release Build (for Play Store)
```bash
# Create keystore first (do this once)
keytool -genkey -v -keystore codecore-release-key.jks ^
  -keyalg RSA -keysize 2048 -validity 10000 ^
  -alias codecore-key

# Build release APK
.\gradlew.bat assembleRelease

# Build App Bundle (AAB - for Play Store)
.\gradlew.bat bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

### Step 5: Run on Device/Emulator
```bash
# Connect device or start emulator in Android Studio

# Install debug app
.\gradlew.bat installDebug

# Or click "Run" in Android Studio (Shift+F10)
```

---

## Project Structure

```
app/
├── src/main/
│   ├── AndroidManifest.xml
│   ├── java/com/codecore/app/
│   │   ├── CodeCoreApp.kt
│   │   ├── MainActivity.kt
│   │   ├── data/
│   │   │   ├── model/
│   │   │   │   ├── User.kt
│   │   │   │   ├── Topic.kt
│   │   │   │   └── Lesson.kt
│   │   │   └── repository/
│   │   │       ├── AuthRepository.kt
│   │   │       └── ContentRepository.kt
│   │   └── ui/
│   │       ├── auth/
│   │       │   ├── AuthViewModel.kt
│   │       │   ├── LoginScreen.kt
│   │       │   └── RegisterScreen.kt
│   │       ├── admin/
│   │       │   ├── AdminViewModel.kt
│   │       │   └── AdminDashboardScreen.kt
│   │       ├── student/
│   │       │   ├── StudentViewModel.kt
│   │       │   ├── StudentHomeScreen.kt
│   │       │   ├── LessonListScreen.kt
│   │       │   └── PdfViewerScreen.kt
│   │       └── theme/
│   │           └── Theme.kt
│   └── res/
├── build.gradle.kts (app level)
└── test/ (for future unit tests)

build.gradle.kts (project level)
settings.gradle.kts
local.properties (git ignored - local only)
google-services.json (git ignored - local only)
```

---

## Testing the App

### Manual Testing Checklist

#### Authentication
- [ ] **Register as Student**
  - [ ] Open app
  - [ ] Click "Don't have account"
  - [ ] Fill: Name, Email, Password
  - [ ] Select "Student"
  - [ ] Click "Create Account"
  - [ ] Verify: Navigate to StudentHomeScreen

- [ ] **Register as Admin**
  - [ ] Repeat above but select "Instructor"
  - [ ] Verify: Navigate to AdminDashboardScreen

- [ ] **Login with Existing Account**
  - [ ] Go back to login (click on LoginScreen in nav if needed)
  - [ ] Enter credentials
  - [ ] Click "Login"
  - [ ] Verify navigation based on role

#### Admin Features
- [ ] **Create Topic**
  - [ ] Click "Add Content" tab
  - [ ] Select "New Topic"
  - [ ] Enter: Title, Description, Icon (emoji), Color
  - [ ] Click "Create Topic"
  - [ ] Verify: Topic appears in Topics tab

- [ ] **Create Lesson**
  - [ ] Click "Add Content" → "New Lesson"
  - [ ] Select topic from dropdown
  - [ ] Enter: Title, Description, PDF Link, Duration
  - [ ] Click "Add Lesson"
  - [ ] Verify: Lesson count updates in topic card

- [ ] **Delete Content**
  - [ ] Go to Topics tab
  - [ ] Click delete icon on topic
  - [ ] Verify: Topic and all lessons deleted

#### Student Features
- [ ] **Browse Topics**
  - [ ] View grid of topics
  - [ ] Search by topic name
  - [ ] Verify: Cards show emoji, title, lesson count

- [ ] **View Lessons**
  - [ ] Click on topic
  - [ ] Verify: Lessons list loads
  - [ ] Check play/check icons for completion status

- [ ] **View PDF**
  - [ ] Click on lesson
  - [ ] Verify: PDF loads and displays
  - [ ] Test PDF controls (zoom, scroll, etc.)

- [ ] **Bookmark Lesson**
  - [ ] While viewing PDF, click "Bookmark"
  - [ ] Verify: Button state changes
  - [ ] Verify: Bookmark saved to user profile

- [ ] **Mark Complete**
  - [ ] Click "Mark Complete"
  - [ ] Verify: Check icon appears on lesson list

### Testing Error Scenarios
- [ ] Invalid email format
- [ ] Password too short (< 6 chars)
- [ ] Missing required fields
- [ ] Network connection loss
- [ ] Invalid PDF link
- [ ] Firebase connection issues

---

## Debugging

### Common Issues & Solutions

#### 1. Build Fails - Dependencies Not Found
```bash
# Clear cache and rebuild
.\gradlew.bat clean build --refresh-dependencies
```

#### 2. Firebase Not Working
**Check:**
- [ ] `google-services.json` is in `app/` directory
- [ ] Firebase project exists in Firebase Console
- [ ] Services are enabled (Auth, Firestore)
- [ ] Security rules are set correctly

**Fix:**
```bash
# Resync Gradle
.\gradlew.bat sync
```

#### 3. API Key Issues
**Check:**
- [ ] `local.properties` has `GEMINI_API_KEY=xxx`
- [ ] Key is valid and not revoked
- [ ] Key has proper permissions in Google Cloud Console

#### 4. Emulator Issues
```bash
# Restart emulator
.\gradlew.bat installDebug
```

### Logcat Debugging
```bash
# View logs in Android Studio:
# View → Tool Windows → Logcat
# Or:
adb logcat | findstr "CodeCore"

# Filter for errors:
adb logcat | findstr "ERROR"
```

---

## Performance Optimization

### Monitoring
1. **Android Profiler** (in Android Studio)
   - Tools → Android Profiler
   - Check: CPU, Memory, Network usage

2. **Firebase Console**
   - Monitor: Firestore usage
   - Check: Read/write quotas

3. **Crashlytics** (when deployed)
   - Firebase Console → Crashlytics
   - Monitor crash reports

### Optimization Tips
- Use `LazyColumn` for long lists (already implemented)
- Implement image caching with Coil
- Use `stateIn()` for efficient Flow collection
- Implement pagination for large datasets

---

## Deployment to Play Store

### Step 1: Prepare Release Build
```bash
# Create release keystore
keytool -genkey -v -keystore codecore-release.jks ^
  -keyalg RSA -keysize 2048 -validity 10000 ^
  -alias codecore

# Configure in build.gradle.kts
signingConfigs {
    release {
        keyStore file("../codecore-release.jks")
        keyStorePassword "your_password"
        keyAlias "codecore"
        keyPassword "your_password"
    }
}

# Build App Bundle
.\gradlew.bat bundleRelease
```

### Step 2: Create Play Store Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Create account ($25 one-time fee)
3. Create new app

### Step 3: Upload App Bundle
1. Navigate to "Release" → "Production"
2. Create new release
3. Upload `app-release.aab` from `app/build/outputs/bundle/release/`

### Step 4: Complete Store Listing
- [ ] Screenshots
- [ ] Description
- [ ] Category
- [ ] Rating
- [ ] Contact information
- [ ] Privacy policy

### Step 5: Review & Publish
- [ ] Pass Play Console review (~24 hours)
- [ ] App goes live!

---

## Monitoring Post-Launch

### Firebase Analytics
- Track user engagement
- Monitor crash rates
- Review performance metrics

### Crashlytics
- Real-time crash reporting
- Automatic stack traces
- Performance monitoring

### Version Updates
```bash
# Update version in app/build.gradle.kts
versionCode = 2
versionName = "1.0.1"
```

---

## Next Steps

### Immediate (Week 6)
- [ ] Implement AI Voice Assistant module
- [ ] Integrate Google Gemini API
- [ ] Add speech recognition
- [ ] Create VoiceAssistantScreen

### Short Term (Week 8-9)
- [ ] Add dark/light theme toggle
- [ ] Implement animations
- [ ] Add unit tests
- [ ] Performance testing

### Medium Term (Week 10-11)
- [ ] Deploy to Play Store
- [ ] Monitor Crashlytics
- [ ] Gather user feedback
- [ ] Plan v1.1 features

---

## Resources

### Official Documentation
- [Android Developer Docs](https://developer.android.com)
- [Jetpack Compose Guide](https://developer.android.com/jetpack/compose)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material Design 3](https://m3.material.io)

### Kotlin Resources
- [Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-guide.html)
- [Kotlin Flow](https://kotlinlang.org/docs/flow.html)

### Useful Tools
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)
- [Android Studio Profiler](https://developer.android.com/studio/profile)
- [Play Console](https://play.google.com/console)

---

## Contact & Support

For issues or questions:
- Check logs with: `adb logcat | findstr "ERROR"`
- Review Firebase Console for backend issues
- Check Android Studio for compilation errors

---

**Last Updated**: February 15, 2026
**Status**: Phase 1-3 Implementation Complete - Ready for Phase 4 (AI Assistant)

