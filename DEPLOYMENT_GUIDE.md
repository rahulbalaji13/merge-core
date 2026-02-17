# Deployment Guide - CodeCore

## Pre-Deployment Checklist

### Code Quality
- [ ] All features implemented and tested
- [ ] No TODO or FIXME comments in production code
- [ ] Code follows Kotlin style guide
- [ ] All lint warnings resolved
- [ ] ProGuard rules configured
- [ ] No hardcoded credentials or API keys

### Testing
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] UI tests passing
- [ ] Manual testing on 3+ devices
- [ ] Tested on Android 7.0 to 14
- [ ] Dark/Light mode tested
- [ ] Offline functionality verified
- [ ] Performance profiling completed

### Security
- [ ] Firebase security rules deployed
- [ ] API keys in BuildConfig only
- [ ] Certificate pinning implemented
- [ ] Input validation on all forms
- [ ] Encrypted SharedPreferences for sensitive data
- [ ] No sensitive data in logs

### Legal & Compliance
- [ ] Privacy policy created and hosted
- [ ] Terms of service prepared
- [ ] GDPR compliance verified
- [ ] Data deletion mechanism implemented
- [ ] User consent for data collection

## Step 1: Generate Signing Key

### Create Release Keystore
```bash
keytool -genkey -v -keystore master-cs-release.keystore \
  -alias master-cs-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS SECURELY)
# - Key password (SAVE THIS SECURELY)
# - Your name, organization, etc.
```

### Store Credentials Securely
Create `keystore.properties` in project root (add to .gitignore):
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=master-cs-key
storeFile=../master-cs-release.keystore
```

**CRITICAL**: Backup keystore file and passwords in a secure location (password manager, encrypted drive). Losing this means you cannot update your app!

## Step 2: Configure Build for Release

### Update build.gradle.kts (app level)
```kotlin
android {
    // Load keystore properties
    val keystorePropertiesFile = rootProject.file("keystore.properties")
    val keystoreProperties = Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(FileInputStream(keystorePropertiesFile))
    }

    signingConfigs {
        create("release") {
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
        }
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
    }
}
```

### Update ProGuard Rules (proguard-rules.pro)
```proguard
# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep data models
-keep class com.mastercs.fundamentals.data.models.** { *; }

# Keep Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }

# Keep Kotlin coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
```

## Step 3: Build Release APK/AAB

### Generate Android App Bundle (Recommended)
```bash
# In Android Studio:
# Build > Generate Signed Bundle / APK > Android App Bundle
# Or via command line:
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

### Generate APK (Alternative)
```bash
./gradlew assembleRelease

# Output: app/build/outputs/apk/release/app-release.apk
```

### Test Release Build
```bash
# Install on device
adb install app/build/outputs/apk/release/app-release.apk

# Test all critical flows
```

## Step 4: Google Play Console Setup

### Create Developer Account
1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Complete account setup
4. Verify identity (may take 1-2 days)

### Create New App
1. Click "Create app"
2. Fill details:
   - **App name**: CodeCore
   - **Default language**: English (US)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept declarations
4. Create app

## Step 5: Complete Store Listing

### App Details
- **App name**: CodeCore
- **Short description** (80 chars):
  ```
  Master CS fundamentals with AI-powered voice assistant and expert materials
  ```
- **Full description** (4000 chars):
  ```
  CodeCore is your comprehensive learning companion for computer science 
  education. Whether you're a beginner or advancing your skills, our 
  app provides:

  ✨ FEATURES:
  • AI Voice Assistant: Get instant answers to your CS questions with our 
    intelligent voice-powered tutor
  • Curated Learning Materials: Access expert-created content on algorithms, 
    data structures, programming concepts, and more
  • Interactive Learning: Engage with materials through our intuitive interface
  • Dark Mode: Study comfortably in any lighting condition
  • Offline Access: Download materials for learning on the go
  • Personalized Experience: Track your progress and bookmark favorites

  📚 CONTENT AREAS:
  - Data Structures & Algorithms
  - Programming Fundamentals
  - Object-Oriented Programming
  - Database Concepts
  - Operating Systems
  - Computer Networks
  - And much more!

  🎯 PERFECT FOR:
  - Computer Science students
  - Self-taught programmers
  - Interview preparation
  - Continuous learning

  Start your CS mastery journey today!
  ```

### Graphics Assets

#### App Icon (512x512 PNG)
- High-resolution icon
- No transparency
- Represents CS/learning theme

#### Feature Graphic (1024x500 PNG)
- Eye-catching banner
- App name and key feature
- Professional design

#### Screenshots (Minimum 2, Maximum 8)
Required for:
- **Phone**: 16:9 or 9:16 ratio
- **7-inch tablet** (optional)
- **10-inch tablet** (optional)

Screenshot ideas:
1. Home screen with materials
2. AI voice assistant in action
3. Material detail view
4. Dark mode showcase
5. Admin dashboard (if showing features)

### Categorization
- **App category**: Education
- **Tags**: Learning, Computer Science, AI, Education
- **Content rating**: Everyone

## Step 6: Privacy & Legal

### Privacy Policy
Create and host privacy policy covering:
- Data collection (email, usage analytics)
- Firebase usage
- Third-party services (AI API)
- Data retention and deletion
- User rights
- Contact information

Host at: yourwebsite.com/privacy-policy or use GitHub Pages

### Data Safety Section
Declare in Play Console:
- **Data collected**: Email, app interactions
- **Data usage**: App functionality, analytics
- **Data sharing**: None (or list if applicable)
- **Security practices**: Encryption in transit, secure authentication
- **Data deletion**: Users can request deletion

## Step 7: Content Rating

### Complete Questionnaire
1. Go to "Content rating" in Play Console
2. Select "Start questionnaire"
3. Answer honestly about:
   - Violence
   - Sexual content
   - Language
   - Controlled substances
   - User interaction features
4. Submit for rating (usually Everyone or Everyone 10+)

## Step 8: Set Up App Pricing & Distribution

### Pricing
- **Paid/Free**: Free
- **In-app purchases**: None (or configure if applicable)
- **Ads**: None (or declare if using ads)

### Countries
- Select all countries or specific regions
- Consider GDPR compliance for EU

### Device Categories
- [x] Phone
- [x] Tablet
- [ ] Wear OS
- [ ] Android TV
- [ ] Android Auto

## Step 9: Upload Release

### Internal Testing (Recommended First)
1. Go to "Testing > Internal testing"
2. Create new release
3. Upload AAB file
4. Add release notes:
   ```
   Initial release v1.0.0
   - User authentication (Admin & Student)
   - Content management system
   - AI voice assistant
   - Dark/Light mode
   - Browse and bookmark materials
   ```
5. Add internal testers (email addresses)
6. Review and rollout
7. Share testing link with testers
8. Gather feedback (1-2 weeks)

### Closed Testing (Alpha/Beta)
1. Fix issues from internal testing
2. Create closed testing track
3. Upload new version
4. Invite more testers (friends, colleagues)
5. Test for 2-4 weeks
6. Iterate based on feedback

### Production Release
1. Go to "Production > Create new release"
2. Upload final AAB
3. Add release notes
4. Set rollout percentage (start with 20%)
5. Review all sections (must be complete)
6. Submit for review

## Step 10: App Review Process

### Google's Review
- **Timeline**: 1-7 days (usually 2-3 days)
- **What they check**:
  - Policy compliance
  - Content rating accuracy
  - Privacy policy
  - App functionality
  - Security issues

### Possible Outcomes
- **Approved**: App goes live!
- **Rejected**: Fix issues and resubmit

### Common Rejection Reasons
- Missing privacy policy
- Misleading content
- Crashes on startup
- Permissions not justified
- Incomplete store listing

## Step 11: Post-Launch

### Monitor Performance
- **Play Console Dashboard**:
  - Installs and uninstalls
  - Crashes and ANRs
  - User ratings and reviews
  
- **Firebase Analytics**:
  - Active users
  - Feature usage
  - Retention rates

### Respond to Reviews
- Reply to user feedback within 48 hours
- Address bugs and feature requests
- Thank positive reviewers

### Plan Updates
- **Bug fixes**: Release within 1 week
- **Minor updates**: Monthly
- **Major features**: Quarterly

## Step 12: Gradual Rollout Strategy

### Rollout Phases
1. **20%**: Monitor for 2-3 days
2. **50%**: If stable, increase after 3-5 days
3. **100%**: Full rollout after 1 week

### Halt Rollout If:
- Crash rate >2%
- Critical bugs reported
- Negative review spike
- ANR rate >0.5%

## Maintenance Checklist

### Weekly
- [ ] Check crash reports
- [ ] Respond to reviews
- [ ] Monitor analytics

### Monthly
- [ ] Review user feedback
- [ ] Plan feature updates
- [ ] Update dependencies
- [ ] Security audit

### Quarterly
- [ ] Major version update
- [ ] Performance optimization
- [ ] New features based on feedback
- [ ] Marketing push

## Emergency Procedures

### Critical Bug Found
1. Halt rollout immediately
2. Fix bug in emergency branch
3. Test thoroughly
4. Submit hotfix update
5. Request expedited review (if available)

### Security Vulnerability
1. Take app down if severe
2. Fix immediately
3. Notify affected users
4. Submit security update
5. Publish incident report

## Success Metrics

### First Month Goals
- 100+ installs
- 4.0+ star rating
- <1% crash rate
- 30% D1 retention
- 15% D7 retention

### Growth Strategy
- Social media promotion
- Content marketing (blog posts)
- App Store Optimization (ASO)
- User referral program (future)
- Educational partnerships

## Resources

### Official Documentation
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Firebase Documentation](https://firebase.google.com/docs)

### Tools
- [App Icon Generator](https://appicon.co/)
- [Screenshot Mockup](https://mockuphone.com/)
- [Privacy Policy Generator](https://www.freeprivacypolicy.com/)

## Conclusion

Follow this guide step-by-step for a successful deployment. Remember:
- **Test thoroughly** before each release
- **Backup your keystore** securely
- **Monitor metrics** post-launch
- **Engage with users** through reviews
- **Iterate quickly** based on feedback

Good luck with your launch! 🚀
