# Building & Testing APK - CodeCore

## 🎯 Overview

This guide will help you build a production-ready APK for testing on your Android device and eventually deploying to the Play Store.

---

## 📱 Building APK for Testing

### Option 1: Debug APK (Quick Testing)

**Use this for:** Testing on your device during development

#### Steps:

1. **Open Android Studio**
2. **Connect your Android device** via USB
3. **Enable USB Debugging** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times (Developer mode enabled)
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Allow USB debugging when prompted

4. **Build and Install:**
   ```bash
   # In Android Studio Terminal
   ./gradlew installDebug
   
   # Or click the green "Run" button in Android Studio
   ```

5. **APK Location:**
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```

6. **Install manually:**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

---

### Option 2: Release APK (Production Testing)

**Use this for:** Final testing before Play Store submission

#### Prerequisites:

1. **Create Keystore** (one-time setup)
2. **Configure signing**
3. **Build release APK**

---

## 🔐 Step 1: Create Keystore (One-Time Setup)

### Generate Keystore File

```bash
# Open terminal in your project root
# Run this command:

keytool -genkey -v -keystore codecore-release.keystore -alias codecore-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# 1. Keystore password: [CREATE A STRONG PASSWORD]
# 2. Key password: [SAME OR DIFFERENT PASSWORD]
# 3. Your name: [Your Name]
# 4. Organizational unit: [Your Company/Personal]
# 5. Organization: [Your Company Name]
# 6. City: [Your City]
# 7. State: [Your State]
# 8. Country code: [IN for India, US for USA, etc.]
```

### Example:
```
Enter keystore password: MySecurePass123!
Re-enter new password: MySecurePass123!
What is your first and last name?
  [Unknown]:  Rahul Kumar
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  CodeCore
What is the name of your City or Locality?
  [Unknown]:  Mumbai
What is the name of your State or Province?
  [Unknown]:  Maharashtra
What is the two-letter country code for this unit?
  [Unknown]:  IN
Is CN=Rahul Kumar, OU=Development, O=CodeCore, L=Mumbai, ST=Maharashtra, C=IN correct?
  [no]:  yes

Enter key password for <codecore-key>
        (RETURN if same as keystore password): [Press Enter]
```

### ⚠️ CRITICAL: Backup Your Keystore!

**Save these securely:**
- ✅ `codecore-release.keystore` file
- ✅ Keystore password
- ✅ Key alias: `codecore-key`
- ✅ Key password

**Store in:**
- Password manager (1Password, LastPass, etc.)
- Encrypted cloud storage
- External hard drive

**⚠️ If you lose this, you CANNOT update your app on Play Store!**

---

## 🔧 Step 2: Configure Signing

### Create keystore.properties

1. **Create file** `keystore.properties` in project root (same level as `build.gradle`)

2. **Add this content:**
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=codecore-key
storeFile=codecore-release.keystore
```

3. **Example:**
```properties
storePassword=MySecurePass123!
keyPassword=MySecurePass123!
keyAlias=codecore-key
storeFile=codecore-release.keystore
```

### Add to .gitignore

**IMPORTANT:** Never commit keystore to Git!

Add to `.gitignore`:
```
# Keystore files
*.keystore
*.jks
keystore.properties
local.properties
```

---

## 📝 Step 3: Update build.gradle.kts

### Edit `app/build.gradle.kts`

Add this code **before** the `android {` block:

```kotlin
import java.util.Properties
import java.io.FileInputStream

// Load keystore properties
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}
```

### Add signing config inside `android {` block:

```kotlin
android {
    namespace = "com.codecore.app"
    compileSdk = 34

    // Add this signing configuration
    signingConfigs {
        create("release") {
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
        }
    }

    defaultConfig {
        applicationId = "com.codecore.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }
    
    // ... rest of your config
}
```

---

## 🏗️ Step 4: Build Release APK

### Method 1: Using Android Studio (Recommended)

1. **Click:** Build → Generate Signed Bundle / APK
2. **Select:** APK
3. **Click:** Next
4. **Choose:** Create new... (if first time) or select existing keystore
5. **Fill in:**
   - Key store path: Browse to `codecore-release.keystore`
   - Key store password: [Your password]
   - Key alias: `codecore-key`
   - Key password: [Your password]
6. **Click:** Next
7. **Select:** release
8. **Check:** Both signature versions (V1 and V2)
9. **Click:** Finish

### Method 2: Using Command Line

```bash
# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease

# APK will be at:
# app/build/outputs/apk/release/app-release.apk
```

---

## 📲 Step 5: Install APK on Your Device

### Method 1: Via USB (ADB)

```bash
# Make sure device is connected and USB debugging is enabled
adb devices

# Install the APK
adb install app/build/outputs/apk/release/app-release.apk

# If app already exists, use -r to reinstall:
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Method 2: Transfer and Install Manually

1. **Copy APK to your phone:**
   - Connect phone via USB
   - Copy `app-release.apk` to Downloads folder

2. **Install on phone:**
   - Open Files app on phone
   - Navigate to Downloads
   - Tap `app-release.apk`
   - Tap "Install"
   - If prompted, allow "Install from unknown sources"

### Method 3: Share via Google Drive/Email

1. **Upload APK** to Google Drive or email to yourself
2. **Download on phone**
3. **Tap to install**

---

## ✅ Step 6: Testing Checklist

### Before Testing

- [ ] Firebase project configured
- [ ] `google-services.json` in `app/` folder
- [ ] Gemini API key in `local.properties`
- [ ] Admin email added to Firestore `admins` collection
- [ ] At least 1 topic and 1 lesson added
- [ ] Google Drive PDF link is public

### Functional Testing

#### Authentication
- [ ] Google Sign-In works
- [ ] Admin login redirects to admin dashboard
- [ ] Student login redirects to roadmap
- [ ] Sign out works
- [ ] Profile shows correct user info

#### Student Features
- [ ] Roadmap displays all topics
- [ ] Topic cards show correct colors and icons
- [ ] Progress percentage displays
- [ ] Clicking topic opens lessons
- [ ] Lessons list shows all lessons
- [ ] Clicking lesson opens PDF viewer
- [ ] PDF loads and displays correctly
- [ ] Zoom and scroll work in PDF
- [ ] Mark as complete updates progress
- [ ] Progress persists after app restart

#### Admin Features
- [ ] Admin dashboard accessible
- [ ] Can add new topic
- [ ] Can edit topic
- [ ] Can delete topic
- [ ] Can add new lesson
- [ ] Can edit lesson (update Drive link)
- [ ] Can delete lesson
- [ ] Changes reflect immediately for students

#### AI Voice Assistant
- [ ] Voice button appears
- [ ] Microphone permission requested
- [ ] Speech recognition works
- [ ] AI responds to queries
- [ ] Text-to-speech works
- [ ] Chat history displays

#### UI/UX
- [ ] Dark mode toggle works
- [ ] Light mode toggle works
- [ ] Animations are smooth
- [ ] No UI glitches
- [ ] Back button navigation works
- [ ] App doesn't crash

### Performance Testing

- [ ] App starts in < 2 seconds
- [ ] Roadmap loads in < 1 second
- [ ] PDF loads in < 3 seconds
- [ ] No lag when scrolling
- [ ] Memory usage < 200 MB
- [ ] Battery drain is normal

### Error Handling

- [ ] No internet: Shows error message
- [ ] Invalid Drive link: Shows error
- [ ] Failed sign-in: Shows error
- [ ] PDF load failure: Shows retry option
- [ ] AI API failure: Shows error message

---

## 🐛 Common Issues & Solutions

### Issue 1: "App not installed"

**Cause:** Signature mismatch or corrupted APK

**Solution:**
```bash
# Uninstall existing app first
adb uninstall com.codecore.app

# Then install fresh
adb install app/release/app-release.apk
```

### Issue 2: "Parse error"

**Cause:** APK corrupted or incompatible

**Solution:**
- Re-build the APK
- Check Android version (must be 7.0+)
- Verify APK file is not corrupted

### Issue 3: Google Sign-In fails

**Cause:** SHA-1 fingerprint not added to Firebase

**Solution:**
```bash
# Get SHA-1 fingerprint
./gradlew signingReport

# Copy SHA-1 from output
# Add to Firebase Console → Project Settings → Your apps → Add fingerprint
```

### Issue 4: PDF doesn't load

**Cause:** Drive link not public or wrong format

**Solution:**
- Open Drive link in browser
- Change sharing to "Anyone with the link"
- Verify link format: `https://drive.google.com/file/d/FILE_ID/view`

### Issue 5: App crashes on startup

**Cause:** Missing `google-services.json` or API key

**Solution:**
- Verify `google-services.json` is in `app/` folder
- Check `local.properties` has `GEMINI_API_KEY`
- Rebuild project

---

## 📊 APK Size Optimization

### Check APK Size

```bash
# Build release APK
./gradlew assembleRelease

# Check size
ls -lh app/build/outputs/apk/release/app-release.apk

# Target: < 50 MB
```

### Reduce APK Size

**1. Enable ProGuard (already in config):**
```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
    }
}
```

**2. Use APK Analyzer:**
- Build → Analyze APK
- Select your APK
- See what's taking space
- Optimize large resources

**3. Use WebP images:**
- Convert PNG/JPG to WebP
- Right-click image → Convert to WebP

**4. Remove unused resources:**
```kotlin
android {
    buildTypes {
        release {
            isShrinkResources = true
        }
    }
}
```

---

## 🔍 Debugging Release APK

### View Logs

```bash
# Connect device
adb devices

# View real-time logs
adb logcat | grep CodeCore

# Or filter by package
adb logcat | grep com.codecore.app

# Save logs to file
adb logcat > logs.txt
```

### Enable Debug Logging in Release

**Temporarily add to MainActivity:**
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Enable debug logging
    if (BuildConfig.DEBUG) {
        Log.d("CodeCore", "Debug mode enabled")
    }
}
```

---

## 📦 Building AAB (Android App Bundle)

### For Play Store Submission

**AAB is required for Play Store (not APK)**

```bash
# Build release bundle
./gradlew bundleRelease

# Output location:
# app/build/outputs/bundle/release/app-release.aab
```

### Or via Android Studio:

1. Build → Generate Signed Bundle / APK
2. Select: **Android App Bundle**
3. Follow same signing steps as APK
4. Upload AAB to Play Console

---

## 🚀 Pre-Production Checklist

### Code Quality
- [ ] All features implemented
- [ ] No TODO comments
- [ ] No hardcoded values
- [ ] All strings in `strings.xml`
- [ ] ProGuard rules configured
- [ ] Lint warnings resolved

### Security
- [ ] No API keys in code
- [ ] Firebase rules deployed
- [ ] Keystore backed up
- [ ] No sensitive data in logs
- [ ] Permissions justified

### Testing
- [ ] Tested on 3+ devices
- [ ] Tested on Android 7.0 to 14
- [ ] Dark/Light mode tested
- [ ] Offline scenarios tested
- [ ] Performance profiled

### Assets
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone & tablet)
- [ ] Privacy policy URL
- [ ] App description ready

---

## 📱 Testing on Multiple Devices

### Recommended Test Devices

**Minimum:**
- 1 phone with Android 7.0 (API 24)
- 1 phone with Android 14 (API 34)
- 1 tablet (optional)

**Use Android Studio Emulators:**
```
Tools → Device Manager → Create Virtual Device

Recommended:
- Pixel 6 (API 34)
- Pixel 4 (API 29)
- Nexus 5X (API 24)
```

### Test Different Scenarios

- [ ] Fresh install
- [ ] Update from previous version
- [ ] Low storage
- [ ] Slow network
- [ ] No network
- [ ] Different screen sizes
- [ ] Different Android versions

---

## 🎯 Quick Commands Reference

```bash
# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build release AAB
./gradlew bundleRelease

# Install debug
./gradlew installDebug

# Uninstall app
adb uninstall com.codecore.app

# Install APK
adb install path/to/app.apk

# View logs
adb logcat

# Get SHA-1 fingerprint
./gradlew signingReport

# Check APK size
ls -lh app/build/outputs/apk/release/app-release.apk
```

---

## 📋 Version Management

### Update Version for Each Release

**In `app/build.gradle.kts`:**
```kotlin
defaultConfig {
    versionCode = 1  // Increment for each release (1, 2, 3...)
    versionName = "1.0.0"  // User-visible version
}
```

**Version naming:**
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - Minor feature update
- `2.0.0` - Major update

---

## 🎉 Final Steps Before Play Store

1. **Build final AAB:**
   ```bash
   ./gradlew bundleRelease
   ```

2. **Test AAB locally:**
   ```bash
   # Install bundletool
   # Download from: https://github.com/google/bundletool/releases
   
   # Generate APKs from AAB
   java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app.apks --mode=universal
   
   # Install
   java -jar bundletool.jar install-apks --apks=app.apks
   ```

3. **Upload to Play Console:**
   - Follow DEPLOYMENT_GUIDE.md
   - Start with Internal Testing
   - Then Closed Testing (Beta)
   - Finally Production

---

## 🆘 Need Help?

### If APK doesn't work:

1. **Check logs:**
   ```bash
   adb logcat | grep -E "CodeCore|AndroidRuntime"
   ```

2. **Verify configuration:**
   - Firebase setup correct?
   - API keys present?
   - Keystore configured?

3. **Test debug version first:**
   ```bash
   ./gradlew installDebug
   ```

4. **Clean and rebuild:**
   ```bash
   ./gradlew clean
   ./gradlew assembleRelease
   ```

---

## 📞 Support Resources

- **Android Docs:** https://developer.android.com
- **Firebase Docs:** https://firebase.google.com/docs
- **Stack Overflow:** Tag with `android`, `kotlin`
- **Play Console Help:** https://support.google.com/googleplay/android-developer

---

**You're ready to build and test your APK! 🚀**

*Remember: Always test thoroughly before submitting to Play Store!*
