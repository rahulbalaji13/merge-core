# Feedback System - CodeCore

## 🎯 Overview

Add a dedicated **Feedback** tab where students can:
- Rate material quality (1-5 stars)
- Submit suggestions and expectations
- Report issues with lessons
- Request new topics

Admins can:
- View all feedback
- Filter by type and rating
- Mark feedback as resolved
- Track user satisfaction

---

## 📊 Database Structure

### Firestore Collection: `feedback`

```javascript
{
  "feedback-id-123": {
    id: "feedback-id-123",
    userId: "user123",
    userName: "John Doe",
    userEmail: "john@gmail.com",
    type: "material_quality", // or "suggestion", "bug_report", "feature_request"
    
    // For material quality feedback
    lessonId: "os-lesson-1", // optional
    topicId: "operating-systems", // optional
    rating: 4, // 1-5 stars
    
    // Feedback content
    title: "Great explanation but needs more examples",
    message: "The OS concepts are clear, but I'd love to see more real-world examples...",
    
    // Metadata
    status: "pending", // "pending", "reviewed", "resolved"
    createdAt: 1234567890,
    resolvedAt: null,
    adminNotes: ""
  }
}
```

### Firestore Collection: `ratings`

```javascript
// Track average ratings per lesson
{
  "os-lesson-1": {
    lessonId: "os-lesson-1",
    totalRatings: 25,
    averageRating: 4.2,
    ratingBreakdown: {
      "5": 10,
      "4": 12,
      "3": 2,
      "2": 1,
      "1": 0
    },
    lastUpdated: 1234567890
  }
}
```

---

## 🎨 UI Implementation

### 1. Add Feedback Tab to Bottom Navigation

```kotlin
// StudentHomeScreen.kt
@Composable
fun StudentMainScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Home, "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.TrendingUp, "Progress") },
                    label = { Text("Progress") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Feedback, "Feedback") },
                    label = { Text("Feedback") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Person, "Profile") },
                    label = { Text("Profile") }
                )
            }
        }
    ) { padding ->
        when (selectedTab) {
            0 -> RoadmapScreen()
            1 -> ProgressScreen()
            2 -> FeedbackScreen()
            3 -> ProfileScreen()
        }
    }
}
```

---

### 2. Feedback Screen UI

```kotlin
// FeedbackScreen.kt
@Composable
fun FeedbackScreen(
    viewModel: FeedbackViewModel
) {
    var selectedType by remember { mutableStateOf(FeedbackType.MATERIAL_QUALITY) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Feedback & Suggestions") }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* Show feedback dialog */ }
            ) {
                Icon(Icons.Default.Add, "Add Feedback")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            // Feedback type tabs
            ScrollableTabRow(selectedTabIndex = selectedType.ordinal) {
                Tab(
                    selected = selectedType == FeedbackType.MATERIAL_QUALITY,
                    onClick = { selectedType = FeedbackType.MATERIAL_QUALITY },
                    text = { Text("Rate Materials") }
                )
                Tab(
                    selected = selectedType == FeedbackType.SUGGESTION,
                    onClick = { selectedType = FeedbackType.SUGGESTION },
                    text = { Text("Suggestions") }
                )
                Tab(
                    selected = selectedType == FeedbackType.BUG_REPORT,
                    onClick = { selectedType = FeedbackType.BUG_REPORT },
                    text = { Text("Report Issue") }
                )
                Tab(
                    selected = selectedType == FeedbackType.FEATURE_REQUEST,
                    onClick = { selectedType = FeedbackType.FEATURE_REQUEST },
                    text = { Text("Request Feature") }
                )
            }
            
            // Content based on selected type
            when (selectedType) {
                FeedbackType.MATERIAL_QUALITY -> MaterialRatingSection()
                FeedbackType.SUGGESTION -> SuggestionSection()
                FeedbackType.BUG_REPORT -> BugReportSection()
                FeedbackType.FEATURE_REQUEST -> FeatureRequestSection()
            }
        }
    }
}

enum class FeedbackType {
    MATERIAL_QUALITY,
    SUGGESTION,
    BUG_REPORT,
    FEATURE_REQUEST
}
```

---

### 3. Material Rating Section

```kotlin
@Composable
fun MaterialRatingSection(
    viewModel: FeedbackViewModel
) {
    val completedLessons by viewModel.completedLessons.collectAsState()
    val unratedLessons = completedLessons.filter { !it.isRated }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Rate Your Completed Lessons",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        if (unratedLessons.isEmpty()) {
            EmptyState(
                icon = Icons.Default.Star,
                message = "You've rated all completed lessons!\nKeep learning to unlock more."
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(unratedLessons) { lesson ->
                    LessonRatingCard(
                        lesson = lesson,
                        onRate = { rating, feedback ->
                            viewModel.submitRating(lesson.id, rating, feedback)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun LessonRatingCard(
    lesson: Lesson,
    onRate: (Int, String) -> Unit
) {
    var rating by remember { mutableStateOf(0) }
    var feedback by remember { mutableStateOf("") }
    var showDialog by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = lesson.title,
                style = MaterialTheme.typography.titleMedium
            )
            
            Text(
                text = lesson.topicTitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Star rating
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                repeat(5) { index ->
                    Icon(
                        imageVector = if (index < rating) Icons.Filled.Star else Icons.Outlined.Star,
                        contentDescription = "Star ${index + 1}",
                        modifier = Modifier
                            .size(32.dp)
                            .clickable { rating = index + 1 },
                        tint = if (index < rating) Color(0xFFFFB300) else Color.Gray
                    )
                }
            }
            
            if (rating > 0) {
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedButton(
                    onClick = { showDialog = true },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Add Comment (Optional)")
                }
            }
        }
    }
    
    if (showDialog) {
        FeedbackDialog(
            title = "Rate: ${lesson.title}",
            rating = rating,
            onDismiss = { showDialog = false },
            onSubmit = { comment ->
                onRate(rating, comment)
                showDialog = false
            }
        )
    }
}
```

---

### 4. Feedback Dialog

```kotlin
@Composable
fun FeedbackDialog(
    title: String,
    rating: Int = 0,
    onDismiss: () -> Unit,
    onSubmit: (String) -> Unit
) {
    var feedback by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column {
                if (rating > 0) {
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        repeat(5) { index ->
                            Icon(
                                imageVector = if (index < rating) Icons.Filled.Star else Icons.Outlined.Star,
                                contentDescription = null,
                                tint = if (index < rating) Color(0xFFFFB300) else Color.Gray
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                OutlinedTextField(
                    value = feedback,
                    onValueChange = { feedback = it },
                    label = { Text("Your feedback") },
                    placeholder = { Text("What did you think? Any suggestions?") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(150.dp),
                    maxLines = 5
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(feedback) },
                enabled = rating > 0 || feedback.isNotBlank()
            ) {
                Text("Submit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
```

---

### 5. General Feedback Form

```kotlin
@Composable
fun SuggestionSection() {
    var title by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("General") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Share Your Suggestions",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Text(
            text = "Help us improve CodeCore! Your feedback matters.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        // Category selection
        Text("Category", style = MaterialTheme.typography.labelLarge)
        Spacer(modifier = Modifier.height(8.dp))
        
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("General", "Content", "UI/UX", "Performance", "New Topic").forEach { cat ->
                FilterChip(
                    selected = category == cat,
                    onClick = { category = cat },
                    label = { Text(cat) }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Title
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            placeholder = { Text("Brief summary of your suggestion") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Message
        OutlinedTextField(
            value = message,
            onValueChange = { message = it },
            label = { Text("Details") },
            placeholder = { Text("Describe your suggestion in detail...") },
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            maxLines = 10
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = {
                // Submit feedback
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = title.isNotBlank() && message.isNotBlank()
        ) {
            Icon(Icons.Default.Send, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Submit Feedback")
        }
    }
}
```

---

## 🔧 ViewModel Implementation

```kotlin
// FeedbackViewModel.kt
class FeedbackViewModel(
    private val feedbackRepository: FeedbackRepository,
    private val auth: FirebaseAuth
) : ViewModel() {
    
    private val _completedLessons = MutableStateFlow<List<Lesson>>(emptyList())
    val completedLessons = _completedLessons.asStateFlow()
    
    fun submitRating(
        lessonId: String,
        rating: Int,
        feedback: String
    ) {
        viewModelScope.launch {
            val user = auth.currentUser ?: return@launch
            
            val feedbackData = Feedback(
                userId = user.uid,
                userName = user.displayName ?: "Anonymous",
                userEmail = user.email ?: "",
                type = "material_quality",
                lessonId = lessonId,
                rating = rating,
                title = "Lesson Rating",
                message = feedback,
                status = "pending",
                createdAt = System.currentTimeMillis()
            )
            
            feedbackRepository.submitFeedback(feedbackData)
            updateLessonRating(lessonId, rating)
        }
    }
    
    fun submitGeneralFeedback(
        type: String,
        category: String,
        title: String,
        message: String
    ) {
        viewModelScope.launch {
            val user = auth.currentUser ?: return@launch
            
            val feedbackData = Feedback(
                userId = user.uid,
                userName = user.displayName ?: "Anonymous",
                userEmail = user.email ?: "",
                type = type,
                category = category,
                title = title,
                message = message,
                status = "pending",
                createdAt = System.currentTimeMillis()
            )
            
            feedbackRepository.submitFeedback(feedbackData)
        }
    }
    
    private suspend fun updateLessonRating(lessonId: String, rating: Int) {
        feedbackRepository.updateLessonRating(lessonId, rating)
    }
}
```

---

## 📦 Repository Implementation

```kotlin
// FeedbackRepository.kt
class FeedbackRepository(
    private val firestore: FirebaseFirestore
) {
    suspend fun submitFeedback(feedback: Feedback): Result<String> {
        return try {
            val docRef = firestore.collection("feedback").document()
            val feedbackWithId = feedback.copy(id = docRef.id)
            docRef.set(feedbackWithId).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateLessonRating(lessonId: String, rating: Int) {
        try {
            val ratingDoc = firestore.collection("ratings")
                .document(lessonId)
                .get()
                .await()
            
            if (ratingDoc.exists()) {
                // Update existing rating
                val currentTotal = ratingDoc.getLong("totalRatings") ?: 0
                val currentAvg = ratingDoc.getDouble("averageRating") ?: 0.0
                val breakdown = ratingDoc.get("ratingBreakdown") as? Map<String, Long> ?: emptyMap()
                
                val newTotal = currentTotal + 1
                val newAvg = ((currentAvg * currentTotal) + rating) / newTotal
                val newBreakdown = breakdown.toMutableMap()
                newBreakdown[rating.toString()] = (newBreakdown[rating.toString()] ?: 0) + 1
                
                firestore.collection("ratings").document(lessonId).update(
                    mapOf(
                        "totalRatings" to newTotal,
                        "averageRating" to newAvg,
                        "ratingBreakdown" to newBreakdown,
                        "lastUpdated" to System.currentTimeMillis()
                    )
                ).await()
            } else {
                // Create new rating
                firestore.collection("ratings").document(lessonId).set(
                    mapOf(
                        "lessonId" to lessonId,
                        "totalRatings" to 1,
                        "averageRating" to rating.toDouble(),
                        "ratingBreakdown" to mapOf(rating.toString() to 1),
                        "lastUpdated" to System.currentTimeMillis()
                    )
                ).await()
            }
        } catch (e: Exception) {
            Log.e("FeedbackRepository", "Error updating rating", e)
        }
    }
    
    fun getAllFeedback(): Flow<List<Feedback>> {
        return firestore.collection("feedback")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .snapshotFlow()
            .map { snapshot ->
                snapshot.documents.mapNotNull { it.toObject(Feedback::class.java) }
            }
    }
    
    fun getFeedbackByType(type: String): Flow<List<Feedback>> {
        return firestore.collection("feedback")
            .whereEqualTo("type", type)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .snapshotFlow()
            .map { snapshot ->
                snapshot.documents.mapNotNull { it.toObject(Feedback::class.java) }
            }
    }
}
```

---

## 👨‍💼 Admin Feedback Dashboard

```kotlin
// AdminFeedbackScreen.kt
@Composable
fun AdminFeedbackScreen(
    viewModel: AdminFeedbackViewModel
) {
    val feedbackList by viewModel.feedbackList.collectAsState()
    var filterType by remember { mutableStateOf("all") }
    var filterStatus by remember { mutableStateOf("all") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("User Feedback") }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Filters
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = filterType == "all",
                    onClick = { filterType = "all" },
                    label = { Text("All") }
                )
                FilterChip(
                    selected = filterType == "material_quality",
                    onClick = { filterType = "material_quality" },
                    label = { Text("Ratings") }
                )
                FilterChip(
                    selected = filterType == "suggestion",
                    onClick = { filterType = "suggestion" },
                    label = { Text("Suggestions") }
                )
                FilterChip(
                    selected = filterType == "bug_report",
                    onClick = { filterType = "bug_report" },
                    label = { Text("Bugs") }
                )
            }
            
            // Feedback list
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(feedbackList.filter { 
                    (filterType == "all" || it.type == filterType) &&
                    (filterStatus == "all" || it.status == filterStatus)
                }) { feedback ->
                    FeedbackCard(
                        feedback = feedback,
                        onMarkResolved = { viewModel.markAsResolved(feedback.id) },
                        onAddNote = { note -> viewModel.addAdminNote(feedback.id, note) }
                    )
                }
            }
        }
    }
}

@Composable
fun FeedbackCard(
    feedback: Feedback,
    onMarkResolved: () -> Unit,
    onAddNote: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = feedback.title,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "By ${feedback.userName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                if (feedback.rating > 0) {
                    Row {
                        repeat(feedback.rating) {
                            Icon(
                                Icons.Filled.Star,
                                contentDescription = null,
                                tint = Color(0xFFFFB300),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = feedback.message,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = if (expanded) Int.MAX_VALUE else 2,
                overflow = TextOverflow.Ellipsis
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                TextButton(onClick = { expanded = !expanded }) {
                    Text(if (expanded) "Show Less" else "Show More")
                }
                
                if (feedback.status == "pending") {
                    TextButton(onClick = onMarkResolved) {
                        Text("Mark Resolved")
                    }
                }
            }
        }
    }
}
```

---

## 📊 Analytics & Insights

### Display Average Ratings on Lessons

```kotlin
@Composable
fun LessonButton(
    lesson: Lesson,
    rating: LessonRating?,
    isCompleted: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // ... existing code ...
            
            // Show average rating if available
            rating?.let {
                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Filled.Star,
                            contentDescription = null,
                            tint = Color(0xFFFFB300),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = String.format("%.1f", it.averageRating),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    Text(
                        text = "${it.totalRatings} ratings",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
```

---

## 🔔 Notifications (Optional)

### Notify Admin of New Feedback

```kotlin
// Send notification when feedback is submitted
fun notifyAdminOfNewFeedback(feedback: Feedback) {
    // Using Firebase Cloud Messaging
    val notification = mapOf(
        "title" to "New Feedback Received",
        "body" to "${feedback.userName}: ${feedback.title}",
        "type" to feedback.type
    )
    
    // Send to admin topic
    FirebaseMessaging.getInstance()
        .send(RemoteMessage.Builder("admin-notifications")
            .setData(notification)
            .build())
}
```

---

## ✅ Implementation Checklist

### Week 1: Basic Feedback
- [ ] Add Feedback tab to navigation
- [ ] Create feedback data models
- [ ] Implement feedback submission form
- [ ] Setup Firestore collection

### Week 2: Material Ratings
- [ ] Add star rating component
- [ ] Track completed lessons
- [ ] Calculate average ratings
- [ ] Display ratings on lessons

### Week 3: Admin Dashboard
- [ ] Create admin feedback view
- [ ] Add filtering options
- [ ] Implement mark as resolved
- [ ] Add admin notes feature

### Week 4: Polish
- [ ] Add animations
- [ ] Implement notifications
- [ ] Test all scenarios
- [ ] Update documentation

---

## 🎯 Benefits

✅ **User Engagement** - Users feel heard
✅ **Quality Improvement** - Identify weak content
✅ **Feature Requests** - Know what users want
✅ **Bug Reports** - Fix issues quickly
✅ **Social Proof** - Ratings build trust
✅ **Data-Driven** - Make informed decisions

---

**This feedback system will help you continuously improve CodeCore! 🚀**
