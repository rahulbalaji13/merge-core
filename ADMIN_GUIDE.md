# Admin Panel Guide - CodeCore

## 🔐 Admin Access Setup

### Step 1: Add Your Email as Admin

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `admins`
4. Document ID: **your-email@gmail.com** (use your actual email)
5. Add field:
   - Field: `approved`
   - Type: `boolean`
   - Value: `true`
6. Add field:
   - Field: `addedAt`
   - Type: `timestamp`
   - Value: (current time)
7. Click "Save"

**Important**: Only emails in this collection can access the admin dashboard!

---

## 📚 Managing Topics

### Adding a New Topic

1. Sign in to the app with your admin email
2. Navigate to Admin Dashboard
3. Click "Topics" tab
4. Click "+" button
5. Fill in the form:
   - **Title**: e.g., "Operating Systems"
   - **Description**: e.g., "Learn OS fundamentals"
   - **Icon**: Choose an emoji (💻, 🌳, ⚡, 🗄️, etc.)
   - **Color**: Pick a hex color (#FF6B6B, #4ECDC4, etc.)
   - **Order**: Number for sorting (1, 2, 3...)
6. Click "Save"

### Editing a Topic

1. Go to Topics tab
2. Click on the topic card
3. Click "Edit" icon
4. Update fields
5. Click "Save"

### Deleting a Topic

1. Go to Topics tab
2. Click on the topic card
3. Click "Delete" icon
4. Confirm deletion
5. **Note**: This will also delete all lessons in this topic!

---

## 📝 Managing Lessons

### Preparing Google Drive Links

**Before adding lessons, prepare your PDFs:**

1. Upload PDF to Google Drive
2. Right-click the file → "Get link"
3. Change sharing to "Anyone with the link can view"
4. Copy the link (should look like: `https://drive.google.com/file/d/XXXXX/view`)

**Supported link formats:**
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/uc?id=FILE_ID`

### Adding a New Lesson

1. Go to Admin Dashboard → "Lessons" tab
2. Select the topic from dropdown
3. Click "+" button
4. Fill in the form:
   - **Title**: e.g., "Introduction to OS"
   - **Description**: e.g., "Basic concepts and functions"
   - **Google Drive Link**: Paste the link from above
   - **Duration**: e.g., "15 min" or "20 min"
   - **Order**: Lesson number (1, 2, 3...)
5. Click "Save"

### Editing a Lesson

1. Go to Lessons tab
2. Select topic
3. Click on lesson card
4. Click "Edit" icon
5. Update fields (you can change the Drive link here)
6. Click "Save"

### Deleting a Lesson

1. Go to Lessons tab
2. Select topic
3. Click on lesson card
4. Click "Delete" icon
5. Confirm deletion

---

## 🎨 Recommended Topic Colors

Use these hex colors for a cohesive look:

| Topic | Color | Hex Code |
|-------|-------|----------|
| Operating Systems | Red/Orange | #FF6B6B |
| Data Structures | Teal | #4ECDC4 |
| Algorithms | Purple | #9B59B6 |
| Databases | Blue | #3498DB |
| Networks | Green | #2ECC71 |
| OOP | Pink | #E91E63 |
| Web Development | Orange | #FF9800 |
| Mobile Dev | Indigo | #673AB7 |

---

## 📊 Content Organization Best Practices

### Topic Structure

**Recommended topics for CS fundamentals:**
1. Programming Basics
2. Data Structures
3. Algorithms
4. Object-Oriented Programming
5. Operating Systems
6. Database Management
7. Computer Networks
8. Software Engineering
9. Web Development
10. Mobile Development

### Lesson Structure

**For each topic, organize lessons progressively:**

**Example: Operating Systems**
1. Introduction to OS (15 min)
2. Process Management (20 min)
3. Threads and Concurrency (25 min)
4. CPU Scheduling (20 min)
5. Memory Management (25 min)
6. Virtual Memory (20 min)
7. File Systems (20 min)
8. I/O Systems (18 min)

**Tips:**
- Start with fundamentals
- Progress to advanced topics
- Keep lessons 15-30 minutes
- Use clear, descriptive titles
- Add helpful descriptions

---

## 🔗 Google Drive Setup

### Organizing Your Drive

**Recommended folder structure:**
```
CodeCore Materials/
├── Operating Systems/
│   ├── 01-Introduction-to-OS.pdf
│   ├── 02-Process-Management.pdf
│   └── ...
├── Data Structures/
│   ├── 01-Arrays-and-Lists.pdf
│   ├── 02-Stacks-and-Queues.pdf
│   └── ...
└── Algorithms/
    ├── 01-Sorting-Algorithms.pdf
    └── ...
```

### File Naming Convention

Use this format for easy management:
- `01-Topic-Name.pdf`
- `02-Topic-Name.pdf`
- etc.

This helps you:
- Keep lessons in order
- Quickly find files
- Update content easily

---

## 📱 Testing Your Content

### After Adding Content

1. **Sign out** from admin account
2. **Sign in** with a test student account (different Gmail)
3. **Navigate** to the topic you added
4. **Click** on a lesson
5. **Verify** the PDF loads correctly
6. **Check** that the content is readable

### Common Issues

**PDF doesn't load:**
- ✅ Check Drive link sharing is set to "Anyone with link"
- ✅ Verify the link format is correct
- ✅ Try opening the link in a browser first

**Wrong order:**
- ✅ Check the "order" field for each lesson
- ✅ Make sure numbers are sequential (1, 2, 3...)

**Missing topic:**
- ✅ Verify you saved the topic
- ✅ Check Firestore to confirm it exists
- ✅ Refresh the app

---

## 📈 Analytics Dashboard

### Viewing User Progress

**Coming in Phase 7:**
- Total users
- Active users (daily/weekly)
- Most popular topics
- Completion rates
- Average time per lesson

### Accessing Analytics

1. Go to Admin Dashboard
2. Click "Analytics" tab
3. View metrics and charts

---

## 🔄 Updating Content

### Updating a PDF

**If you need to update a lesson's PDF:**

1. Upload new PDF to Google Drive
2. Get the new share link
3. Go to Admin Dashboard → Lessons
4. Find the lesson
5. Click "Edit"
6. Replace the old Drive link with new one
7. Click "Save"

**Students will see the updated content immediately!**

### Reordering Lessons

1. Go to Lessons tab
2. Select topic
3. Click "Reorder" button
4. Drag lessons to new positions
5. Click "Save Order"

---

## 🛡️ Security Best Practices

### Protecting Admin Access

- ✅ Only add trusted emails to `admins` collection
- ✅ Use a strong Google account password
- ✅ Enable 2-factor authentication on your Google account
- ✅ Don't share admin credentials
- ✅ Regularly review the admins list

### Content Security

- ✅ Only share Drive links set to "view only"
- ✅ Don't use "edit" permissions
- ✅ Keep original files backed up
- ✅ Use descriptive file names (no sensitive info)

---

## 📋 Admin Workflow Checklist

### Weekly Tasks
- [ ] Check for user feedback
- [ ] Review analytics
- [ ] Add new lessons (if planned)
- [ ] Update outdated content

### Monthly Tasks
- [ ] Review all topics for completeness
- [ ] Check all Drive links are working
- [ ] Update lesson descriptions
- [ ] Add new topics (if needed)

### As Needed
- [ ] Respond to user questions (via AI assistant logs)
- [ ] Fix broken links
- [ ] Reorder lessons for better flow
- [ ] Archive old content

---

## 🆘 Troubleshooting

### "Access Denied" Error

**Problem**: Can't access admin dashboard
**Solution**:
1. Verify your email is in Firestore `admins` collection
2. Check the `approved` field is `true`
3. Sign out and sign in again
4. Clear app cache

### Can't Add Topic/Lesson

**Problem**: Save button doesn't work
**Solution**:
1. Check all required fields are filled
2. Verify internet connection
3. Check Firebase Console for errors
4. Try again after a few minutes

### Students Can't See Content

**Problem**: Lessons not appearing for students
**Solution**:
1. Verify topic and lessons are saved in Firestore
2. Check the `order` field is set correctly
3. Ensure Drive links are public
4. Ask students to refresh the app

---

## 💡 Pro Tips

### Efficient Content Management

1. **Batch Upload**: Prepare all PDFs for a topic before adding lessons
2. **Consistent Naming**: Use the same format for all lesson titles
3. **Test First**: Always test Drive links before adding to app
4. **Plan Ahead**: Outline all topics and lessons before starting
5. **Get Feedback**: Ask beta users which topics they want next

### Creating Great Content

1. **Keep PDFs concise** (5-10 pages ideal)
2. **Use clear headings** in PDFs
3. **Add examples** and diagrams
4. **Include practice questions** at the end
5. **Provide references** for further reading

### Engaging Students

1. **Release content gradually** (weekly drops)
2. **Announce new topics** via notifications (future feature)
3. **Create topic series** (beginner → advanced)
4. **Mix theory and practice**
5. **Update based on feedback**

---

## 📞 Support

### If You Need Help

1. **Check this guide** first
2. **Review Firebase Console** for errors
3. **Test with a student account**
4. **Check the main documentation** (IMPLEMENTATION_PLAN.md)

### Common Questions

**Q: How many topics can I add?**
A: Unlimited! But 8-12 topics is ideal for beginners.

**Q: Can I use other file types besides PDF?**
A: Currently only PDFs are supported. Video support coming soon!

**Q: How do I remove an admin?**
A: Go to Firestore → `admins` collection → Delete the document.

**Q: Can I have multiple admins?**
A: Yes! Just add more email documents to the `admins` collection.

**Q: What if a Drive link breaks?**
A: Simply edit the lesson and paste a new link.

---

## 🎯 Quick Reference

### Admin Dashboard Shortcuts

| Action | Steps |
|--------|-------|
| Add Topic | Dashboard → Topics → + |
| Add Lesson | Dashboard → Lessons → Select Topic → + |
| Edit Topic | Topics → Click Card → Edit |
| Edit Lesson | Lessons → Select Topic → Click Card → Edit |
| Delete Topic | Topics → Click Card → Delete |
| Delete Lesson | Lessons → Select Topic → Click Card → Delete |
| View Analytics | Dashboard → Analytics |

### Firestore Collections

| Collection | Purpose | Fields |
|------------|---------|--------|
| `admins` | Admin access control | email, approved, addedAt |
| `topics` | Learning topics | id, title, description, icon, color, order |
| `lessons` | Individual lessons | id, topicId, title, description, driveLink, duration, order |
| `users` | User profiles | uid, email, displayName, completedLessons |

---

**Happy teaching! 🎓**

*Last updated: January 22, 2026*
