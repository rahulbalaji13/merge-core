# CodeCore - Updated Implementation Plan
## Simplified Architecture with Google Auth & Drive Links

## 🎯 Core Concept

**Students**: Sign in with Google → Browse roadmap → Click lessons → View PDFs in-app
**Admin**: Secure login → Add/edit topics and lessons → Paste Google Drive links → Publish

## ✨ Key Changes from Original Plan

### What's Different:
- ✅ **Google Sign-In** instead of email/password
- ✅ **Google Drive links** instead of file uploads
- ✅ **Roadmap UI** with topic cards and lesson buttons
- ✅ **In-app PDF viewer** for Drive PDFs
- ✅ **Firebase Firestore** for storing links (minimal cost)
- ✅ **No Firebase Storage** needed (saves money!)

### What Stays:
- ✅ AI Voice Assistant
- ✅ Dark/Light mode
- ✅ Beautiful UI
- ✅ Admin dashboard
- ✅ Firebase Authentication

---

## 📊 Data Structure

### Firestore Collections

```javascript
// Collection: topics
{
  "operating-systems": {
    id: "operating-systems",
    title: "Operating Systems",
    description: "Learn OS fundamentals",
    icon: "💻",
    order: 1,
    color: "#FF6B6B",
    lessonsCount: 8
  },
  "data-structures": {
    id: "data-structures",
    title: "Data Structures",
    description: "Master DSA concepts",
    icon: "🌳",
    order: 2,
    color: "#4ECDC4",
    lessonsCount: 12
  }
}

// Collection: lessons
{
  "os-lesson-1": {
    id: "os-lesson-1",
    topicId: "operating-systems",
    title: "Introduction to OS",
    description: "What is an operating system?",
    driveLink: "https://drive.google.com/file/d/YOUR_FILE_ID/view",
    order: 1,
    duration: "15 min",
    isCompleted: false // per user
  }
}

// Collection: users
{
  "user123": {
    uid: "user123",
    email: "student@gmail.com",
    displayName: "John Doe",
    photoURL: "https://...",
    role: "student", // or "admin"
    completedLessons: ["os-lesson-1", "os-lesson-2"],
    createdAt: 1234567890
  }
}

// Collection: admins (for admin access control)
{
  "admin@yourdomain.com": {
    approved: true,
    addedAt: 1234567890
  }
}
```

---

## 🏗️ Updated Architecture

### Technology Stack

```kotlin
// Firebase
implementation 'com.google.firebase:firebase-auth-ktx'
implementation 'com.google.firebase:firebase-firestore-ktx'
implementation 'com.google.firebase:firebase-analytics-ktx'

// Google Sign-In
implementation 'com.google.android.gms:play-services-auth:20.7.0'

// PDF Viewer
implementation 'com.github.barteksc:android-pdf-viewer:3.2.0-beta.1'

// Jetpack Compose
implementation 'androidx.compose.material3:material3'
implementation 'androidx.navigation:navigation-compose'

// AI Assistant
implementation 'com.google.ai.client.generativeai:generativeai:0.1.2'

// Image Loading
implementation 'io.coil-kt:coil-compose:2.5.0'

// Networking (for Drive file download)
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
```

---

## 🚀 Phase-by-Phase Implementation

### Phase 1: Authentication (Week 1)

#### Google Sign-In Setup

**1. Firebase Console Setup:**
```
1. Go to Firebase Console > Authentication
2. Enable "Google" sign-in method
3. Download google-services.json
4. Add SHA-1 fingerprint:
   ./gradlew signingReport
   Copy SHA-1 and add to Firebase project settings
```

**2. Implementation:**

```kotlin
// GoogleAuthClient.kt
class GoogleAuthClient(
    private val context: Context,
    private val auth: FirebaseAuth
) {
    private val oneTapClient = Identity.getSignInClient(context)
    
    suspend fun signIn(): IntentSender? {
        val result = try {
            oneTapClient.beginSignIn(
                BeginSignInRequest.builder()
                    .setGoogleIdTokenRequestOptions(
                        GoogleIdTokenRequestOptions.builder()
                            .setSupported(true)
                            .setServerClientId(context.getString(R.string.web_client_id))
                            .setFilterByAuthorizedAccounts(false)
                            .build()
                    )
                    .setAutoSelectEnabled(true)
                    .build()
            ).await()
        } catch (e: Exception) {
            null
        }
        return result?.pendingIntent?.intentSender
    }
    
    suspend fun signInWithIntent(intent: Intent): SignInResult {
        val credential = oneTapClient.getSignInCredentialFromIntent(intent)
        val googleIdToken = credential.googleIdToken
        val googleCredentials = GoogleAuthProvider.getCredential(googleIdToken, null)
        
        return try {
            val user = auth.signInWithCredential(googleCredentials).await().user
            SignInResult(
                data = user?.run {
                    UserData(
                        userId = uid,
                        username = displayName,
                        email = email,
                        profilePictureUrl = photoUrl?.toString()
                    )
                },
                errorMessage = null
            )
        } catch (e: Exception) {
            SignInResult(data = null, errorMessage = e.message)
        }
    }
}

// LoginScreen.kt
@Composable
fun LoginScreen(
    onSignInSuccess: () -> Unit
) {
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            // Handle sign-in
        }
    }
    
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Welcome to CodeCore", style = MaterialTheme.typography.headlineLarge)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        GoogleSignInButton(
            onClick = { /* Launch Google Sign-In */ }
        )
    }
}
```

#### Admin Authentication

```kotlin
// Check if user is admin after sign-in
suspend fun checkAdminStatus(email: String): Boolean {
    return try {
        val doc = firestore.collection("admins")
            .document(email)
            .get()
            .await()
        doc.exists() && doc.getBoolean("approved") == true
    } catch (e: Exception) {
        false
    }
}

// Navigate based on role
if (checkAdminStatus(user.email)) {
    navigateToAdminDashboard()
} else {
    navigateToStudentHome()
}
```

---

### Phase 2: Admin Dashboard (Week 2)

#### Admin UI for Managing Content

```kotlin
// AdminDashboardScreen.kt
@Composable
fun AdminDashboardScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Admin Dashboard") })
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            TabRow(selectedTabIndex = selectedTab) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }) {
                    Text("Topics")
                }
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }) {
                    Text("Lessons")
                }
            }
            
            when (selectedTab) {
                0 -> TopicsManagementScreen()
                1 -> LessonsManagementScreen()
            }
        }
    }
}

// AddTopicDialog.kt
@Composable
fun AddTopicDialog(onDismiss: () -> Unit, onSave: (Topic) -> Unit) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var icon by remember { mutableStateOf("📚") }
    var color by remember { mutableStateOf("#FF6B6B") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Topic") },
        text = {
            Column {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Topic Title") }
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") }
                )
                OutlinedTextField(
                    value = icon,
                    onValueChange = { icon = it },
                    label = { Text("Icon (Emoji)") }
                )
                ColorPicker(selectedColor = color, onColorSelected = { color = it })
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(Topic(
                    title = title,
                    description = description,
                    icon = icon,
                    color = color
                ))
            }) {
                Text("Save")
            }
        }
    )
}

// AddLessonDialog.kt
@Composable
fun AddLessonDialog(topicId: String, onDismiss: () -> Unit, onSave: (Lesson) -> Unit) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var driveLink by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Lesson") },
        text = {
            Column {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Lesson Title") }
                )
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") }
                )
                OutlinedTextField(
                    value = driveLink,
                    onValueChange = { driveLink = it },
                    label = { Text("Google Drive Link") },
                    placeholder = { Text("https://drive.google.com/file/d/...") }
                )
                OutlinedTextField(
                    value = duration,
                    onValueChange = { duration = it },
                    label = { Text("Duration (e.g., 15 min)") }
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(Lesson(
                    topicId = topicId,
                    title = title,
                    description = description,
                    driveLink = driveLink,
                    duration = duration
                ))
            }) {
                Text("Save")
            }
        }
    )
}
```

#### Repository for Admin Operations

```kotlin
class AdminRepository(private val firestore: FirebaseFirestore) {
    
    suspend fun addTopic(topic: Topic): Result<String> {
        return try {
            val docRef = firestore.collection("topics").document()
            val topicWithId = topic.copy(id = docRef.id)
            docRef.set(topicWithId).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateTopic(topicId: String, updates: Map<String, Any>): Result<Unit> {
        return try {
            firestore.collection("topics")
                .document(topicId)
                .update(updates)
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteTopic(topicId: String): Result<Unit> {
        return try {
            // Delete all lessons in this topic first
            val lessons = firestore.collection("lessons")
                .whereEqualTo("topicId", topicId)
                .get()
                .await()
            
            lessons.documents.forEach { it.reference.delete().await() }
            
            // Delete topic
            firestore.collection("topics").document(topicId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addLesson(lesson: Lesson): Result<String> {
        return try {
            val docRef = firestore.collection("lessons").document()
            val lessonWithId = lesson.copy(id = docRef.id)
            docRef.set(lessonWithId).await()
            
            // Update topic's lesson count
            firestore.collection("topics")
                .document(lesson.topicId)
                .update("lessonsCount", FieldValue.increment(1))
                .await()
            
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

### Phase 3: Student Roadmap Interface (Week 3)

#### Roadmap Home Screen

```kotlin
// StudentHomeScreen.kt
@Composable
fun StudentHomeScreen(
    viewModel: StudentViewModel,
    onTopicClick: (String) -> Unit
) {
    val topics by viewModel.topics.collectAsState()
    val userProgress by viewModel.userProgress.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Learning Roadmap") },
                actions = {
                    IconButton(onClick = { /* Open AI Assistant */ }) {
                        Icon(Icons.Default.Mic, "Voice Assistant")
                    }
                }
            )
        }
    ) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(topics) { topic ->
                TopicCard(
                    topic = topic,
                    progress = userProgress[topic.id] ?: 0,
                    onClick = { onTopicClick(topic.id) }
                )
            }
        }
    }
}

@Composable
fun TopicCard(
    topic: Topic,
    progress: Int,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = Color(android.graphics.Color.parseColor(topic.color))
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = topic.icon,
                style = MaterialTheme.typography.displayMedium
            )
            
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = topic.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                LinearProgressIndicator(
                    progress = progress / 100f,
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.White
                )
                
                Text(
                    text = "$progress% Complete",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f)
                )
            }
        }
    }
}
```

#### Lessons List Screen

```kotlin
// LessonsScreen.kt
@Composable
fun LessonsScreen(
    topicId: String,
    viewModel: StudentViewModel,
    onLessonClick: (Lesson) -> Unit
) {
    val topic by viewModel.getTopic(topicId).collectAsState(initial = null)
    val lessons by viewModel.getLessons(topicId).collectAsState(initial = emptyList())
    val completedLessons by viewModel.completedLessons.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(topic?.title ?: "Lessons") },
                navigationIcon = {
                    IconButton(onClick = { /* Navigate back */ }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(lessons.sortedBy { it.order }) { lesson ->
                LessonButton(
                    lesson = lesson,
                    isCompleted = completedLessons.contains(lesson.id),
                    onClick = { onLessonClick(lesson) }
                )
            }
        }
    }
}

@Composable
fun LessonButton(
    lesson: Lesson,
    isCompleted: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (isCompleted) 
                MaterialTheme.colorScheme.primaryContainer 
            else 
                MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Completion indicator
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        color = if (isCompleted) 
                            MaterialTheme.colorScheme.primary 
                        else 
                            MaterialTheme.colorScheme.outline,
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isCompleted) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = "Completed",
                        tint = Color.White
                    )
                } else {
                    Text(
                        text = lesson.order.toString(),
                        color = Color.White,
                        style = MaterialTheme.typography.titleMedium
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = lesson.title,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = lesson.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Icon(
                    Icons.Default.PlayArrow,
                    contentDescription = "Play",
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = lesson.duration,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}
```

---

### Phase 4: PDF Viewer (Week 4)

#### Google Drive PDF Viewer

```kotlin
// PdfViewerScreen.kt
@Composable
fun PdfViewerScreen(
    lesson: Lesson,
    viewModel: PdfViewModel,
    onComplete: () -> Unit
) {
    val pdfFile by viewModel.pdfFile.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(lesson.driveLink) {
        viewModel.loadPdfFromDrive(lesson.driveLink)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(lesson.title) },
                navigationIcon = {
                    IconButton(onClick = { /* Navigate back */ }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onComplete) {
                        Icon(Icons.Default.CheckCircle, "Mark Complete")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                pdfFile != null -> {
                    AndroidView(
                        factory = { context ->
                            PDFView(context, null).apply {
                                fromFile(pdfFile)
                                    .enableSwipe(true)
                                    .swipeHorizontal(false)
                                    .enableDoubletap(true)
                                    .defaultPage(0)
                                    .enableAnnotationRendering(false)
                                    .password(null)
                                    .scrollHandle(null)
                                    .enableAntialiasing(true)
                                    .spacing(10)
                                    .load()
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
                else -> {
                    Text(
                        "Failed to load PDF",
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }
    }
}

// PdfViewModel.kt
class PdfViewModel(
    private val context: Context
) : ViewModel() {
    private val _pdfFile = MutableStateFlow<File?>(null)
    val pdfFile = _pdfFile.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    
    fun loadPdfFromDrive(driveLink: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // Convert Drive link to direct download link
                val fileId = extractFileId(driveLink)
                val downloadUrl = "https://drive.google.com/uc?export=download&id=$fileId"
                
                // Download PDF
                val file = downloadPdf(downloadUrl)
                _pdfFile.value = file
            } catch (e: Exception) {
                Log.e("PdfViewModel", "Error loading PDF", e)
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    private fun extractFileId(driveLink: String): String {
        // Extract file ID from various Drive link formats
        return when {
            driveLink.contains("/file/d/") -> {
                driveLink.substringAfter("/file/d/").substringBefore("/")
            }
            driveLink.contains("id=") -> {
                driveLink.substringAfter("id=").substringBefore("&")
            }
            else -> driveLink
        }
    }
    
    private suspend fun downloadPdf(url: String): File = withContext(Dispatchers.IO) {
        val client = OkHttpClient()
        val request = Request.Builder().url(url).build()
        val response = client.newCall(request).execute()
        
        val file = File(context.cacheDir, "temp_${System.currentTimeMillis()}.pdf")
        file.outputStream().use { output ->
            response.body?.byteStream()?.copyTo(output)
        }
        file
    }
}
```

---

### Phase 5: AI Voice Assistant (Week 5-6)

*Keep the same AI implementation from the original plan*

---

### Phase 6: Progress Tracking (Week 7)

```kotlin
class ProgressRepository(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) {
    suspend fun markLessonComplete(lessonId: String) {
        val userId = auth.currentUser?.uid ?: return
        
        firestore.collection("users")
            .document(userId)
            .update("completedLessons", FieldValue.arrayUnion(lessonId))
            .await()
    }
    
    fun getCompletedLessons(): Flow<List<String>> {
        val userId = auth.currentUser?.uid ?: return flowOf(emptyList())
        
        return firestore.collection("users")
            .document(userId)
            .snapshotFlow()
            .map { it.get("completedLessons") as? List<String> ?: emptyList() }
    }
    
    suspend fun calculateTopicProgress(topicId: String): Int {
        val userId = auth.currentUser?.uid ?: return 0
        
        val totalLessons = firestore.collection("lessons")
            .whereEqualTo("topicId", topicId)
            .get()
            .await()
            .size()
        
        val completedLessons = firestore.collection("users")
            .document(userId)
            .get()
            .await()
            .get("completedLessons") as? List<String> ?: emptyList()
        
        val completedInTopic = firestore.collection("lessons")
            .whereEqualTo("topicId", topicId)
            .whereIn(FieldPath.documentId(), completedLessons)
            .get()
            .await()
            .size()
        
        return if (totalLessons > 0) {
            (completedInTopic * 100) / totalLessons
        } else 0
    }
}
```

---

## 💰 Cost Breakdown

### Firebase Costs (Firestore only)

**Spark Plan (Free):**
- 50K reads/day
- 20K writes/day
- 1GB storage
- **Cost: $0/month**

**Blaze Plan (Pay-as-you-go):**
- $0.06 per 100K reads
- $0.18 per 100K writes
- $0.18/GB storage
- **Estimated: $5-20/month** for 1000 users

### Google Drive
- **Free**: 15GB storage
- **Paid**: $1.99/month for 100GB (if needed)

### Total Monthly Cost
- **Small scale (< 100 users)**: **$0-5/month**
- **Medium scale (1000 users)**: **$10-30/month**
- **Large scale (10K users)**: **$50-100/month**

**Much cheaper than Firebase Storage!**

---

## 🎨 UI/UX Enhancements

### Roadmap Visualization
- Topic cards in grid layout
- Progress rings on each topic
- Color-coded categories
- Smooth animations

### Lesson Flow
- Sequential lesson unlocking (optional)
- Completion checkmarks
- Estimated time per lesson
- Next lesson suggestions

### Gamification (Optional)
- Streak tracking
- Achievement badges
- Leaderboard
- Daily goals

---

## 📱 Complete Feature List

### Student Features
- ✅ Google Sign-In
- ✅ Roadmap view with topics
- ✅ Lesson list per topic
- ✅ In-app PDF viewer
- ✅ Progress tracking
- ✅ AI voice assistant
- ✅ Dark/Light mode
- ✅ Profile with stats

### Admin Features
- ✅ Secure admin login
- ✅ Add/edit/delete topics
- ✅ Add/edit/delete lessons
- ✅ Paste Google Drive links
- ✅ Reorder lessons
- ✅ View analytics
- ✅ User management

---

## 🚀 Deployment Timeline

**Week 1**: Authentication ✅
**Week 2**: Admin dashboard ✅
**Week 3**: Student roadmap UI ✅
**Week 4**: PDF viewer ✅
**Week 5-6**: AI assistant ✅
**Week 7**: Progress tracking ✅
**Week 8**: Polish & testing ✅
**Week 9**: Beta testing ✅
**Week 10**: Play Store submission ✅

**Total: 10 weeks to launch!**

---

This simplified approach is:
- ✅ **Cheaper** (no storage costs)
- ✅ **Easier** to maintain (just paste links)
- ✅ **Faster** to develop (less complexity)
- ✅ **Scalable** (Google Drive handles files)
- ✅ **Better UX** (roadmap learning path)
