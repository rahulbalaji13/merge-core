# CodeCore - System Architecture

## Architecture Overview

### MVVM Pattern
```
┌─────────────────────────────────────────────────────────┐
│                         UI Layer                         │
│  (Jetpack Compose Screens & Components)                 │
│  - AdminDashboard, StudentHome, VoiceAssistant          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    ViewModel Layer                       │
│  - AuthViewModel, MaterialViewModel, AIViewModel        │
│  - State management, Business logic                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│  - AuthRepository, MaterialRepository, AIRepository     │
│  - Data abstraction, Caching                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Sources                          │
│  - Firebase (Auth, Firestore, Storage)                  │
│  - AI API (Gemini/OpenAI)                               │
│  - Local Cache (Room Database)                          │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Authentication Module
**Files:**
- `ui/auth/LoginScreen.kt`
- `ui/auth/RegisterScreen.kt`
- `ui/auth/RoleSelectionScreen.kt`
- `viewmodel/AuthViewModel.kt`
- `data/repository/AuthRepository.kt`

**Flow:**
1. User selects role (Admin/Student)
2. Enters credentials
3. ViewModel validates input
4. Repository calls Firebase Auth
5. On success, check role in Firestore
6. Navigate to appropriate dashboard

### 2. Content Management Module
**Files:**
- `ui/admin/UploadMaterialScreen.kt`
- `ui/admin/MaterialListScreen.kt`
- `ui/admin/EditMaterialScreen.kt`
- `viewmodel/MaterialViewModel.kt`
- `data/repository/MaterialRepository.kt`

**Upload Flow:**
1. Admin selects file
2. Fill metadata form
3. Upload to Firebase Storage
4. Get download URL
5. Save metadata to Firestore
6. Update UI with new material

### 3. Student Learning Module
**Files:**
- `ui/student/HomeScreen.kt`
- `ui/student/BrowseScreen.kt`
- `ui/student/MaterialDetailScreen.kt`
- `ui/student/BookmarksScreen.kt`
- `viewmodel/StudentViewModel.kt`

**Browse Flow:**
1. Fetch materials from Firestore
2. Apply filters/search
3. Display in grid/list
4. User selects material
5. Navigate to detail screen
6. Load content viewer

### 4. AI Voice Assistant Module
**Files:**
- `ui/assistant/VoiceAssistantScreen.kt`
- `ui/assistant/ChatBubble.kt`
- `viewmodel/AIViewModel.kt`
- `data/repository/AIRepository.kt`
- `utils/SpeechRecognitionHelper.kt`
- `utils/TextToSpeechHelper.kt`

**Interaction Flow:**
1. User taps voice button
2. Start speech recognition
3. Convert speech to text
4. Send to AI API with context
5. Receive response
6. Display in chat
7. Convert to speech (optional)

## Data Models

### Core Models
```kotlin
// User.kt
data class User(
    val uid: String,
    val email: String,
    val role: UserRole,
    val displayName: String,
    val profilePicUrl: String = "",
    val createdAt: Long
)

// Material.kt
data class Material(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val contentType: ContentType,
    val fileUrl: String,
    val thumbnailUrl: String,
    val uploadedBy: String,
    val uploadedAt: Long,
    val tags: List<String>,
    val viewCount: Int = 0
)

// ChatMessage.kt
data class ChatMessage(
    val id: String,
    val userId: String,
    val message: String,
    val response: String,
    val timestamp: Long,
    val isVoice: Boolean
)
```

## Firebase Integration

### Authentication
```kotlin
class AuthRepository(private val auth: FirebaseAuth) {
    suspend fun loginWithEmail(email: String, password: String): Result<User>
    suspend fun registerStudent(email: String, password: String, name: String): Result<User>
    suspend fun checkAdminStatus(email: String): Boolean
    fun logout()
    fun getCurrentUser(): User?
}
```

### Firestore Operations
```kotlin
class MaterialRepository(
    private val firestore: FirebaseFirestore,
    private val storage: FirebaseStorage
) {
    suspend fun uploadMaterial(material: Material, file: Uri): Result<String>
    suspend fun getMaterials(category: String? = null): Flow<List<Material>>
    suspend fun updateMaterial(materialId: String, updates: Map<String, Any>): Result<Unit>
    suspend fun deleteMaterial(materialId: String): Result<Unit>
}
```

## Navigation Graph

```
SplashScreen
    ├─→ RoleSelectionScreen
    │       ├─→ AdminLoginScreen → AdminDashboard
    │       │                           ├─→ UploadMaterial
    │       │                           ├─→ ManageMaterials
    │       │                           └─→ Analytics
    │       │
    │       └─→ StudentLoginScreen → StudentHome
    │                                     ├─→ Browse
    │                                     ├─→ MaterialDetail
    │                                     ├─→ Bookmarks
    │                                     ├─→ VoiceAssistant
    │                                     └─→ Profile
    │
    └─→ (if authenticated) → Dashboard based on role
```

## Security Architecture

### Authentication Flow
1. Email/password authentication via Firebase
2. Role verification from Firestore
3. Session token stored securely
4. Auto-logout on token expiry

### Data Access Control
- Firestore security rules enforce role-based access
- Admin operations require admin role verification
- Students can only read materials
- User data isolated by UID

### API Security
- API keys stored in BuildConfig
- HTTPS only for all network calls
- Certificate pinning for critical APIs
- Rate limiting on AI requests

## Offline Support

### Caching Strategy
- Room database for offline material metadata
- Downloaded files stored locally
- Sync when network available
- Conflict resolution (last-write-wins)

## Performance Considerations

### Optimization Techniques
- Pagination (20 items per page)
- Image lazy loading with Coil
- Firestore query indexing
- Background uploads with WorkManager
- Memory leak prevention (ViewModel scoping)

## Testing Strategy

### Unit Tests
- ViewModels: Business logic validation
- Repositories: Mock Firebase calls
- Utils: Helper function testing

### Integration Tests
- Firebase operations with emulator
- End-to-end authentication flow
- Material upload/download

### UI Tests
- Compose UI testing framework
- Navigation testing
- User interaction scenarios

## Deployment Architecture

### Build Variants
- **Debug**: Development with test Firebase project
- **Staging**: Pre-production testing
- **Release**: Production with ProGuard enabled

### CI/CD Pipeline (Optional)
```yaml
# GitHub Actions example
- Build APK/AAB
- Run unit tests
- Run instrumentation tests
- Upload to Play Console (Internal Testing)
- Notify team
```

## Monitoring & Analytics

### Firebase Analytics Events
- `user_login` (role parameter)
- `material_viewed` (category, type)
- `voice_query` (query length)
- `material_uploaded` (admin)
- `search_performed` (query)

### Crashlytics
- Automatic crash reporting
- Custom log messages
- User identification (non-PII)

## Scalability Plan

### Growth Handling
- Firebase auto-scales with usage
- Implement pagination early
- CDN for static assets (future)
- Database sharding if needed (future)
- Microservices for AI (future)

## Third-Party Services

### Required APIs
1. **Firebase**: Auth, Firestore, Storage, Analytics, Crashlytics
2. **AI Provider**: Google Gemini API or OpenAI API
3. **Payment** (future): Google Play Billing for premium features

### API Rate Limits
- Gemini: 60 requests/minute (free tier)
- Firebase: 50K reads/day (Spark plan)
- Storage: 5GB (Spark plan)

## Development Environment Setup

### Prerequisites
- Android Studio Hedgehog or later
- JDK 17
- Android SDK 34
- Firebase account
- AI API key

### Configuration Files
```
local.properties (not in git)
    GEMINI_API_KEY=your_key_here
    
google-services.json (not in git)
    Firebase configuration
    
keystore.properties (not in git)
    Signing configuration
```

This architecture ensures scalability, maintainability, and security while providing a smooth user experience.
