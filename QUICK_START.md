# 🚀 Quick Start Guide - AI Chatbot

Get your AI chatbot running in 5 minutes!

## ⚡ Prerequisites Check

```bash
✅ Node.js installed
✅ MongoDB connection string ready
✅ Gemini API key configured
✅ Project dependencies installed
```

## 🎯 3-Step Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd AUTOMATED--ATTENDANCE-TRACKER-AND-AI-POWERED-LEARNING/backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected Successfully!
🚀 CSE ATTENDANCE SYSTEM STARTED!
📍 Server running on port 5000
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd AUTOMATED--ATTENDANCE-TRACKER-AND-AI-POWERED-LEARNING/frontend
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
➜ Local: http://localhost:3000
```

### Step 3: Test the Chatbot
1. Open browser: `http://localhost:3000`
2. Login as student
3. Click chat icon (bottom-right)
4. Ask: "What's my attendance?"

---

## 🧪 Quick Test Checklist

### ✅ Backend Tests
```bash
# Test 1: Check server health
curl http://localhost:5000/api/health

# Test 2: Get materials
curl http://localhost:5000/api/materials

# Test 3: Test chatbot
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}'
```

### ✅ Frontend Tests
1. **Login Page** - Can you login?
2. **Dashboard** - Does it load?
3. **Chatbot Icon** - Visible in bottom-right?
4. **Chat Window** - Opens when clicked?
5. **Message Send** - Can you send messages?

---

## 📤 Upload Test Material

### Quick Upload (Teacher Account)
1. Login as teacher
2. Go to "Upload Material"
3. Fill form:
   - **Type:** Syllabus
   - **Title:** Test Syllabus
   - **Subject:** Computer Science
   - **Semester:** 3
   - **File:** Upload any PDF/TXT file
4. Click "Upload Material"
5. Check server logs for: `Text extraction completed`

### Create Test File
```bash
# Create a test text file
cd backend/test-files
echo "Chapter 1: Introduction to Data Structures
Arrays: Linear data structure
Linked Lists: Dynamic data structure
Stacks: LIFO principle
Queues: FIFO principle" > test-syllabus.txt
```

---

## 💬 Test Queries

### Basic Queries (Copy & Paste)
```
1. "Hello"
2. "What can you help me with?"
3. "What's in the syllabus?"
4. "Show me notes"
5. "What's my attendance?"
```

### Advanced Queries
```
1. "What topics are covered in Data Structures?"
2. "Explain binary search"
3. "When is the Database class?"
4. "What questions come in exams?"
5. "How is my attendance percentage?"
```

---

## 🔧 Troubleshooting

### Problem: Chatbot not responding
**Quick Fix:**
```bash
# Check if Gemini API key is set
cd backend
cat .env | grep GEMINI_API_KEY
```

### Problem: No materials found
**Quick Fix:**
```bash
# Extract text from existing materials
curl -X POST http://localhost:5000/api/materials/extract-all
```

### Problem: Attendance not showing
**Quick Fix:**
- Ensure you're logged in as student
- Check if attendance has been marked
- Verify userId is passed to API

### Problem: Server won't start
**Quick Fix:**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <PID> /F

# Restart server
npm run dev
```

---

## 📊 Verify Installation

### Check Database
```javascript
// In MongoDB Compass or Atlas
// Collection: materials
// Check for: textExtracted: true

// Sample query
db.materials.find({ textExtracted: true }).count()
```

### Check Logs
```bash
# Backend logs should show:
Starting text extraction for material...
Text extraction completed for material...
```

### Check API Response
```bash
# Should return material with extractedText
curl http://localhost:5000/api/materials | json_pp
```

---

## 🎯 Success Indicators

✅ **Backend Running**
- Server starts without errors
- MongoDB connected
- Port 5000 listening

✅ **Frontend Running**
- Vite dev server running
- Port 3000 accessible
- No console errors

✅ **Chatbot Working**
- Chat icon visible
- Messages send successfully
- Responses received
- No "Simple Bot Mode" message

✅ **Text Extraction Working**
- Upload completes successfully
- Logs show extraction started
- Materials have extractedText field
- Chatbot uses material content

✅ **Attendance Integration**
- Student can query attendance
- Real data is returned
- Percentage calculated correctly

---

## 🚀 Next Steps

### 1. Upload More Materials
- Add syllabus for all subjects
- Upload lecture notes (PDF/Word)
- Add previous year questions
- Upload timetables

### 2. Test Different Scenarios
- Try various query types
- Test with different file formats
- Check error handling
- Verify response accuracy

### 3. Monitor Performance
- Check extraction time for large files
- Monitor API response times
- Review chat session handling
- Check memory usage

### 4. Gather Feedback
- Ask students to test
- Collect query examples
- Identify gaps in responses
- Note improvement areas

---

## 📚 Documentation Links

- **Full Setup:** `SETUP_GUIDE.md`
- **Architecture:** `ARCHITECTURE.md`
- **Examples:** `EXAMPLE_QUERIES.md`
- **Features:** `AI_CHATBOT_README.md`

---

## 🆘 Quick Help

### Common Commands
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Test extraction
cd backend && node test-extraction.js

# Check materials
curl http://localhost:5000/api/materials

# Extract all
curl -X POST http://localhost:5000/api/materials/extract-all
```

### Environment Variables
```env
MONGODB_URI=<your-mongodb-connection>
GEMINI_API_KEY=<your-gemini-key>
PORT=5000
JWT_SECRET=<your-secret>
```

### Ports
- **Backend:** 5000
- **Frontend:** 3000
- **MongoDB:** 27017 (if local)

---

## ✨ Features Checklist

- [x] Text extraction from PDFs
- [x] Text extraction from Word docs
- [x] Text extraction from images (OCR)
- [x] Material search and retrieval
- [x] Attendance integration
- [x] AI-powered responses
- [x] Session management
- [x] Context-aware answers
- [x] Source referencing
- [x] Error handling

---

## 🎉 You're All Set!

Your AI chatbot is now ready to:
- Answer questions about syllabus
- Provide information from notes
- Share timetable details
- Help with PYQ queries
- Show attendance statistics
- Give personalized study recommendations

**Happy Learning! 📚🤖**

---

**Need Help?**
- Check server logs
- Review documentation
- Test API endpoints
- Verify database records

**Version:** 1.0.0  
**Last Updated:** 2024

