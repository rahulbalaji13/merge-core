# CodeCore - Developer Quick Reference

## Quick Start (5 minutes)

### 1. Clone & Setup
```bash
cd "D:\CS Fundamentals App"
```

### 2. Configure Firebase & API Keys
```properties
# In local.properties:
sdk.dir=C:\\Users\\[YourUsername]\\AppData\\Local\\Android\\Sdk
GEMINI_API_KEY=your_key_here
```

### 3. Place google-services.json
- Download from Firebase Console
- Place in `app/` directory

### 4. Build & Run
```bash
# Sync Gradle
./gradlew sync

# Run on device/emulator
./gradlew installDebug
# OR click Run in Android Studio
```

---

## Project Organization

### Entry Points
- **MainActivity.kt** - App initialization and navigation
- **CodeCoreApp.kt** - Application class with Firebase init

### Key Directories
```
ui/
  ├── auth/ - Login & registration
  ├── admin/ - Admin management screens
  ├── student/ - Student learning screens
  ├── ai/ - AI assistant UI
  └── theme/ - Material 3 styling

data/
  ├── model/ - Data classes
  └── repository/ - Data access layer

util/
  ├── SpeechRecognitionHelper.kt
  └── TextToSpeechHelper.kt
```

---

## Common Tasks

### Adding a New Screen
```kotlin
// 1. Create ViewModel
class MyViewModel : ViewModel() {
    // ... state and business logic
}

// 2. Create Composable Screen
@Composable
fun MyScreen(viewModel: MyViewModel = viewModel()) {
    // ... UI code
}

// 3. Add to Navigation (MainActivity.kt)
composable("my_screen") {
    MyScreen()
}

// 4. Navigate to it
navController.navigate("my_screen")
```

### Adding a Firebase Operation
```kotlin
// In Repository
suspend fun myOperation(data: String) {
    try {
        firestore.collection("myCollection")
            .document(id)
            .set(data)
            .await()
    } catch (e: Exception) {
        throw e
    }
}

// In ViewModel
fun doSomething() {
    viewModelScope.launch {
        try {
            repository.myOperation("data")
        } catch (e: Exception) {
            _errorMessage.value = e.message
        }
    }
}
```

### Using AI Features
```kotlin
// Ask AI a question
val response = aiRepository.generateResponse("Explain variables")

// Generate practice questions
val questions = aiRepository.generateQuestions("Arrays", 5)

// Get recommendations
val recommendations = aiRepository.getRecommendations(
    completedTopics = listOf("Variables", "Loops"),
    currentLevel = "beginner"
)
```

### Displaying Error Messages
```kotlin
// Show error state
_errorMessage.value = "Something went wrong"

// Handle in UI
if (errorMessage != null) {
    Snackbar(
        containerColor = MaterialTheme.colorScheme.errorContainer
    ) {
        Text(errorMessage!!, color = MaterialTheme.colorScheme.error)
    }
}
```

---

## Navigation Quick Reference

```
App Start
  ↓
login
  ├─ studentHomeScreen
  │  ├─ lesson_list/{topicId}
  │  │  └─ pdf_viewer/{lessonId}/{driveLink}
  │  └─ ai_assistant
  │
  └─ adminDashboard
```

**Navigate Programmatically**:
```kotlin
navController.navigate("student_home")
navController.navigate("lesson_list/topic123")
navController.popBackStack()  // Back
```

---

## Data Models Quick Reference

### User
```kotlin
User(
    uid: String,
    email: String,
    displayName: String,
    role: String ("student" | "admin"),
    completedLessons: List<String>,
    bookmarkedLessons: List<String>
)
```

### Topic
```kotlin
Topic(
    id: String,
    title: String,
    description: String,
    icon: String (emoji: "💻"),
    color: String (hex: "#FF6B6B"),
    lessonsCount: Int
)
```

### Lesson
```kotlin
Lesson(
    id: String,
    topicId: String,
    title: String,
    description: String,
    driveLink: String (PDF URL),
    duration: String ("15 min")
)
```

---

## Firebase Operations Cheat Sheet

### Firestore
```kotlin
// Create
firestore.collection("users").document(uid).set(user).await()

// Read
firestore.collection("users").document(uid).get().await()

// Update
firestore.collection("users").document(uid)
    .update("completedLessons", FieldValue.arrayUnion(lessonId))

// Delete
firestore.collection("topics").document(topicId).delete().await()

// Query with Flow
firestore.collection("lessons")
    .whereEqualTo("topicId", topicId)
    .addSnapshotListener { snapshot, _ ->
        trySend(snapshot?.toObjects(Lesson::class.java))
    }
```

### Authentication
```kotlin
// Login
firebaseAuth.signInWithEmailAndPassword(email, password)

// Register
firebaseAuth.createUserWithEmailAndPassword(email, password)

// Logout
firebaseAuth.signOut()

// Get current user
firebaseAuth.currentUser?.uid
```

---

## Material 3 Common Components

### Button Types
```kotlin
// Primary
Button(onClick = {}) { Text("Click me") }

// Outlined
OutlinedButton(onClick = {}) { Text("Click me") }

// Text
TextButton(onClick = {}) { Text("Click me") }

// Floating Action Button
FloatingActionButton(onClick = {}) {
    Icon(Icons.Default.Add, contentDescription = null)
}

// Extended FAB
ExtendedFloatingActionButton(
    onClick = {},
    icon = { Icon(Icons.Default.Add, null) },
    text = { Text("Add") }
)
```

### Text Fields
```kotlin
// Outlined
OutlinedTextField(
    value = state,
    onValueChange = { state = it },
    label = { Text("Label") }
)

// Read-only
OutlinedTextField(
    value = state,
    onValueChange = {},
    readOnly = true,
    label = { Text("Label") }
)
```

### Cards & Lists
```kotlin
// Card
Card {
    Text("Content")
}

// Lazy Column
LazyColumn {
    items(items) { item ->
        Text(item.title)
    }
}

// Lazy Grid
LazyVerticalGrid(columns = GridCells.Fixed(2)) {
    items(items) { item ->
        Text(item.title)
    }
}
```

---

## Debugging Tips

### View Logs
```bash
# All logs
adb logcat

# Filter by app
adb logcat | findstr "codecore\|CodeCore"

# Filter by level
adb logcat | findstr "ERROR\|WARN"

# Clear logs
adb logcat -c
```

### Firebase Console Checks
1. **Authentication** - Users section
2. **Firestore** - Collections and documents
3. **Storage** - Uploaded files
4. **Analytics** - User events
5. **Crashlytics** - Error reports

### Android Studio Tools
- **Logcat** - View → Tool Windows → Logcat
- **Profiler** - Tools → Android Profiler
- **Device File Explorer** - View → Tool Windows → Device File Explorer

---

## Performance Optimization Tips

### UI Performance
✅ Use `LazyColumn` instead of `Column` for long lists
✅ Implement `stateIn()` for efficient Flow collection
✅ Avoid recomposition of large composables
✅ Use `rememberSaveable` for state preservation

### Network Performance
✅ Batch Firestore operations
✅ Use indexes for common queries
✅ Implement caching (future: Room database)
✅ Compress images before upload

### Memory
✅ Proper coroutine scope cleanup
✅ Release resources in `onCleared()`
✅ Avoid memory leaks in listeners
✅ Use `WeakReference` for large objects

---

## Testing

### Manual Testing Checklist
- [ ] Register as student
- [ ] Register as admin
- [ ] Login with credentials
- [ ] Create topic
- [ ] Add lesson to topic
- [ ] Search for topic
- [ ] View lesson list
- [ ] Open PDF
- [ ] Mark complete
- [ ] Chat with AI assistant
- [ ] Test error scenarios

### Unit Test Example
```kotlin
@Test
fun testTopicCreation() {
    val topic = Topic(
        title = "Variables",
        description = "Learn about variables"
    )
    assertEquals("Variables", topic.title)
}
```

---

## Deployment Checklist

### Before Release
- [ ] Test on minimum SDK (API 24)
- [ ] Test on latest SDK (API 34)
- [ ] Test on various screen sizes
- [ ] Check Firebase quota
- [ ] Verify Crashlytics is enabled
- [ ] Test all navigation paths
- [ ] Check all error messages
- [ ] Verify analytics events
- [ ] Review Proguard rules
- [ ] Check signing keystore

### Play Store
- [ ] Create release bundle: `./gradlew bundleRelease`
- [ ] Upload to Play Console
- [ ] Add screenshots (5+)
- [ ] Write compelling description
- [ ] Set category and rating
- [ ] Submit for review
- [ ] Monitor for errors

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `MainActivity.kt` | Navigation setup |
| `AuthViewModel.kt` | Authentication logic |
| `StudentViewModel.kt` | Student features |
| `AdminViewModel.kt` | Admin features |
| `AIViewModel.kt` | AI features |
| `ContentRepository.kt` | Firestore operations |
| `Theme.kt` | Material 3 styling |
| `build.gradle.kts` | Dependencies |
| `FIRESTORE_RULES.txt` | Database security |
| `BUILD_GUIDE.md` | Build instructions |

---

## API & Key Management

### Gemini API
```kotlin
// Initialize
val aiRepository = AIRepository(BuildConfig.GEMINI_API_KEY)

// Use
val response = aiRepository.generateResponse(prompt)
```

### Firebase
```kotlin
// Auth
FirebaseAuth.getInstance()

// Firestore
FirebaseFirestore.getInstance()

// Storage
FirebaseStorage.getInstance()
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `google-services.json not found` | Wrong location | Place in `app/` dir |
| `GEMINI_API_KEY not set` | Missing config | Add to `local.properties` |
| `Firebase connection failed` | Network issue | Check internet |
| `PDF won't load` | Invalid URL | Verify download link |
| `Recomposition lag` | Large list | Use `LazyColumn` |

---

## Resources

### Official Docs
- [Android Developer](https://developer.android.com)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Firebase](https://firebase.google.com/docs)
- [Kotlin](https://kotlinlang.org/docs)
- [Material Design 3](https://m3.material.io)

### Learning
- Android Docs: https://developer.android.com
- Compose Playground: https://developer.android.com/develop/ui/compose
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite
- Kotlin Coroutines: https://kotlinlang.org/docs/coroutines-guide.html

---

## Need Help?

1. **Build Issues**: `./gradlew clean build --refresh-dependencies`
2. **Firebase Issues**: Check console and Firestore rules
3. **Runtime Errors**: Check Logcat
4. **Performance**: Use Android Profiler
5. **Navigation**: Review MainActivity composable routing

---

**Last Updated**: February 15, 2026
**Version**: 1.0.0-RC1

