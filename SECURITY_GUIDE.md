# Security Best Practices - CodeCore

## Overview
This document outlines security measures, best practices, and implementation guidelines for the CodeCore Android application.

## 1. Authentication Security

### Firebase Authentication
```kotlin
class AuthRepository(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore
) {
    // Secure login with error handling
    suspend fun login(email: String, password: String): Result<User> {
        return try {
            // Input validation
            if (!isValidEmail(email)) {
                return Result.failure(Exception("Invalid email format"))
            }
            if (password.length < 8) {
                return Result.failure(Exception("Password too short"))
            }
            
            val result = auth.signInWithEmailAndPassword(email, password).await()
            val user = result.user ?: return Result.failure(Exception("Login failed"))
            
            // Verify user role
            val userDoc = firestore.collection("users")
                .document(user.uid)
                .get()
                .await()
            
            Result.success(userDoc.toObject(User::class.java)!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Session Management
```kotlin
class SessionManager(private val context: Context) {
    private val prefs = EncryptedSharedPreferences.create(
        "secure_prefs",
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build(),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun saveAuthToken(token: String) {
        prefs.edit().putString("auth_token", token).apply()
    }
    
    fun getAuthToken(): String? = prefs.getString("auth_token", null)
    
    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
```

## 2. Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update, delete: if isOwner(userId);
    }
    
    // Materials collection
    match /materials/{materialId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
      
      // Prevent unauthorized field updates
      allow update: if isAdmin() && 
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['uploadedBy', 'uploadedAt']);
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Admins collection (read-only, managed manually)
    match /admins/{email} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
    
    // Chat history
    match /chats/{userId}/messages/{messageId} {
      allow read, write: if isOwner(userId);
    }
    
    // Bookmarks
    match /users/{userId}/bookmarks/{bookmarkId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/admins/$(request.auth.token.email)).data.approved == true;
    }
    
    // Material files
    match /materials/{materialId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
      
      // File size limits
      allow write: if request.resource.size < 100 * 1024 * 1024; // 100MB max
      
      // Allowed file types
      allow write: if request.resource.contentType.matches('application/pdf') ||
                      request.resource.contentType.matches('video/.*') ||
                      request.resource.contentType.matches('image/.*');
    }
    
    // Profile pictures
    match /profiles/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId;
      allow write: if request.resource.size < 5 * 1024 * 1024; // 5MB max
      allow write: if request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 3. API Key Protection

### BuildConfig Storage
```kotlin
// build.gradle.kts
android {
    buildFeatures {
        buildConfig = true
    }
    
    defaultConfig {
        // Load from local.properties
        val properties = Properties()
        properties.load(project.rootProject.file("local.properties").inputStream())
        
        buildConfigField(
            "String",
            "GEMINI_API_KEY",
            "\"${properties.getProperty("GEMINI_API_KEY", "")}\""
        )
        
        buildConfigField(
            "String",
            "API_BASE_URL",
            "\"https://generativelanguage.googleapis.com/\""
        )
    }
}
```

### Secure API Client
```kotlin
object ApiClient {
    private const val API_KEY = BuildConfig.GEMINI_API_KEY
    
    val generativeModel: GenerativeModel by lazy {
        GenerativeModel(
            modelName = "gemini-pro",
            apiKey = API_KEY,
            generationConfig = generationConfig {
                temperature = 0.7f
                topK = 40
                topP = 0.95f
                maxOutputTokens = 1024
            },
            safetySettings = listOf(
                SafetySetting(HarmCategory.HARASSMENT, BlockThreshold.MEDIUM_AND_ABOVE),
                SafetySetting(HarmCategory.HATE_SPEECH, BlockThreshold.MEDIUM_AND_ABOVE),
                SafetySetting(HarmCategory.SEXUALLY_EXPLICIT, BlockThreshold.MEDIUM_AND_ABOVE),
                SafetySetting(HarmCategory.DANGEROUS_CONTENT, BlockThreshold.MEDIUM_AND_ABOVE),
            )
        )
    }
}
```

## 4. Network Security

### Network Security Configuration
Create `res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Block cleartext traffic -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    
    <!-- Certificate pinning for critical APIs -->
    <domain-config>
        <domain includeSubdomains="true">generativelanguage.googleapis.com</domain>
        <pin-set expiration="2027-01-01">
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <!-- Add backup pins -->
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

Add to `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### Retrofit Configuration
```kotlin
object NetworkModule {
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("User-Agent", "CodeCore-Android/${BuildConfig.VERSION_NAME}")
                .build()
            chain.proceed(request)
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}
```

## 5. Data Encryption

### Encrypted SharedPreferences
```kotlin
class SecureStorage(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun saveString(key: String, value: String) {
        sharedPreferences.edit().putString(key, value).apply()
    }
    
    fun getString(key: String): String? {
        return sharedPreferences.getString(key, null)
    }
}
```

### Sensitive Data in Memory
```kotlin
// Use CharArray instead of String for passwords
fun validatePassword(password: CharArray): Boolean {
    try {
        // Validation logic
        return password.size >= 8
    } finally {
        // Clear password from memory
        password.fill('0')
    }
}
```

## 6. Input Validation

### Form Validation
```kotlin
object Validator {
    fun validateEmail(email: String): ValidationResult {
        return when {
            email.isBlank() -> ValidationResult.Error("Email is required")
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> 
                ValidationResult.Error("Invalid email format")
            else -> ValidationResult.Success
        }
    }
    
    fun validatePassword(password: String): ValidationResult {
        return when {
            password.length < 8 -> 
                ValidationResult.Error("Password must be at least 8 characters")
            !password.any { it.isUpperCase() } -> 
                ValidationResult.Error("Password must contain uppercase letter")
            !password.any { it.isDigit() } -> 
                ValidationResult.Error("Password must contain a number")
            !password.any { !it.isLetterOrDigit() } -> 
                ValidationResult.Error("Password must contain special character")
            else -> ValidationResult.Success
        }
    }
    
    fun sanitizeInput(input: String): String {
        // Remove potential XSS or injection attacks
        return input.trim()
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
    }
}

sealed class ValidationResult {
    object Success : ValidationResult()
    data class Error(val message: String) : ValidationResult()
}
```

## 7. ProGuard Configuration

### proguard-rules.pro
```proguard
# Keep app classes
-keep class com.codecore.app.data.models.** { *; }
-keepclassmembers class com.codecore.app.data.models.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**

# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# Gson
-keepattributes Signature
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimize
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose
```

## 8. Permissions Management

### AndroidManifest.xml
```xml
<manifest>
    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Runtime permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />
    
    <!-- Android 13+ permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
</manifest>
```

### Runtime Permission Handling
```kotlin
@Composable
fun RequestPermission(
    permission: String,
    onGranted: () -> Unit,
    onDenied: () -> Unit
) {
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) onGranted() else onDenied()
    }
    
    LaunchedEffect(Unit) {
        permissionLauncher.launch(permission)
    }
}
```

## 9. Secure Logging

### Debug vs Release Logging
```kotlin
object Logger {
    private const val TAG = "CodeCore"
    
    fun d(message: String) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG, message)
        }
    }
    
    fun e(message: String, throwable: Throwable? = null) {
        if (BuildConfig.DEBUG) {
            Log.e(TAG, message, throwable)
        } else {
            // Send to Crashlytics without sensitive data
            FirebaseCrashlytics.getInstance().apply {
                log(message)
                throwable?.let { recordException(it) }
            }
        }
    }
    
    // Never log sensitive data
    fun logUserAction(action: String, userId: String) {
        // Hash userId before logging
        val hashedId = hashUserId(userId)
        d("User action: $action, ID: $hashedId")
    }
    
    private fun hashUserId(userId: String): String {
        return MessageDigest.getInstance("SHA-256")
            .digest(userId.toByteArray())
            .joinToString("") { "%02x".format(it) }
            .take(8)
    }
}
```

## 10. Security Checklist

### Pre-Release Security Audit
- [ ] No hardcoded API keys or secrets
- [ ] ProGuard enabled for release builds
- [ ] All network traffic uses HTTPS
- [ ] Firebase security rules deployed
- [ ] Input validation on all user inputs
- [ ] Sensitive data encrypted
- [ ] Permissions justified and minimal
- [ ] No sensitive data in logs
- [ ] Certificate pinning implemented
- [ ] Session timeout configured
- [ ] SQL injection prevention (if using SQL)
- [ ] XSS prevention in WebViews
- [ ] Secure file storage
- [ ] Biometric authentication (optional)
- [ ] Root detection (optional)

### Ongoing Security
- [ ] Regular dependency updates
- [ ] Security patch monitoring
- [ ] Penetration testing
- [ ] Code reviews
- [ ] Vulnerability scanning
- [ ] Incident response plan

## 11. Compliance

### GDPR Compliance
```kotlin
class DataDeletionManager(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val storage: FirebaseStorage
) {
    suspend fun deleteUserData(userId: String) {
        // Delete Firestore data
        firestore.collection("users").document(userId).delete().await()
        firestore.collection("chats").document(userId).delete().await()
        
        // Delete Storage files
        storage.reference.child("profiles/$userId").delete().await()
        
        // Delete authentication
        auth.currentUser?.delete()?.await()
    }
}
```

### Privacy Policy Requirements
- Data collection disclosure
- Third-party services (Firebase, Gemini)
- Data retention policy
- User rights (access, deletion)
- Contact information
- Cookie policy (if applicable)

## 12. Incident Response

### Security Breach Protocol
1. **Detect**: Monitor Firebase Analytics for anomalies
2. **Contain**: Revoke compromised tokens
3. **Investigate**: Check logs and user reports
4. **Remediate**: Deploy security patch
5. **Notify**: Inform affected users
6. **Review**: Update security measures

### Emergency Contacts
- Firebase Support: https://firebase.google.com/support
- Google Play Support: https://support.google.com/googleplay/android-developer

---

**Security is an ongoing process. Regularly review and update these practices.**
