# AI Chatbot Setup Guide

## Quick Start

Follow these steps to get your AI-powered chatbot up and running with document intelligence.

## Prerequisites

✅ Node.js (v14 or higher)  
✅ MongoDB Atlas account (or local MongoDB)  
✅ Google Gemini API Key  
✅ Git (optional)

## Step 1: Verify Dependencies

All required packages are already installed in your project. Verify by checking:

```bash
cd AUTOMATED--ATTENDANCE-TRACKER-AND-AI-POWERED-LEARNING/backend
npm list @google/generative-ai pdf-parse mammoth tesseract.js
```

You should see:
- `@google/generative-ai@^0.2.1`
- `pdf-parse@^1.1.1`
- `mammoth@^1.11.0`
- `tesseract.js@^6.0.1`

## Step 2: Configure Environment Variables

Your `.env` file is already configured with:

```env
MONGODB_URI=mongodb+srv://dbattendance:dbattendancepassword@cluster0.hyedq2n.mongodb.net/cse-attendance?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=cse_pune_attendance_secret_2024
PORT=5000
GEMINI_API_KEY=AIzaSyCaOlsRYMSNyh-DqERZ1IfZ6kznCQuSO6U
```

✅ **All set!** Your Gemini API key is already configured.

## Step 3: Test Text Extraction

Run the test script to verify text extraction is working:

```bash
cd backend
node test-extraction.js
```

Expected output:
```
🧪 Testing Text Extraction Functionality

Test 1: PDF Extraction
⏭️  Skipped (no test file)

Test 2: Text File Extraction
✅ Text file extraction successful
Content: This is a test document for text extraction. It contains multiple lines. Testing complete!

Test 3: Database Connection
✅ MongoDB connected successfully
📊 Materials Statistics:
   Total Materials: X
   Extracted: Y
   Pending: Z

🎉 Testing Complete!
```

## Step 4: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🎉 ====================================
🚀 CSE ATTENDANCE SYSTEM STARTED!
💾 Using EXACT MongoDB connection string
📍 Server running on port 5000
🌐 Frontend: http://localhost:3000
📁 File uploads: http://localhost:5000/uploads
🎉 ====================================
```

## Step 5: Start the Frontend

Open a new terminal:

```bash
cd AUTOMATED--ATTENDANCE-TRACKER-AND-AI-POWERED-LEARNING/frontend
npm run dev
```

The frontend should start on `http://localhost:3000`

## Step 6: Upload Test Materials

1. **Login as Teacher:**
   - Email: Use your teacher account
   - Password: Your password

2. **Navigate to Material Upload:**
   - Click on "Upload Material" tab
   - Fill in the form:
     - **Type:** Select (Syllabus/Notes/Timetable/PYQs)
     - **Title:** e.g., "Data Structures Syllabus"
     - **Subject:** e.g., "Data Structures"
     - **Semester:** e.g., "3"
     - **File:** Upload a PDF, Word doc, or text file

3. **Upload the File:**
   - Click "Upload Material"
   - Wait for success message
   - Text extraction starts automatically in the background

## Step 7: Test the Chatbot

1. **Login as Student:**
   - Use your student account credentials

2. **Open Chatbot:**
   - Look for the blue chat icon in the bottom-right corner
   - Click to open the chatbot window

3. **Try These Queries:**

   **About Materials:**
   ```
   "What topics are in the Data Structures syllabus?"
   "Show me notes about algorithms"
   "What's in the timetable for Monday?"
   "What questions were in last year's exam?"
   ```

   **About Attendance:**
   ```
   "What's my attendance percentage?"
   "How many classes have I attended?"
   "Show my recent attendance"
   ```

   **General Questions:**
   ```
   "What should I study for exams?"
   "Which subjects need more attention?"
   ```

## Step 8: Process Existing Materials (Optional)

If you have materials already uploaded before this update, extract their text:

### Using Postman or cURL:

```bash
curl -X POST http://localhost:5000/api/materials/extract-all
```

### Using Browser Console:

```javascript
fetch('http://localhost:5000/api/materials/extract-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log);
```

Expected response:
```json
{
  "message": "Text extraction initiated",
  "processed": 5,
  "failed": 0,
  "total": 5
}
```

## Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected successfully
- [ ] Gemini API key configured
- [ ] Test material uploaded
- [ ] Text extraction completed (check server logs)
- [ ] Chatbot responds to queries
- [ ] Chatbot provides relevant answers from materials
- [ ] Attendance queries work (for students)

## Troubleshooting

### Issue: "Gemini AI not configured"
**Solution:** Check that `GEMINI_API_KEY` is set in `.env` file

### Issue: Text extraction fails
**Solution:** 
- Check file format is supported
- Verify file is not corrupted
- Check server logs for specific error
- For images, ensure they have clear, readable text

### Issue: Chatbot gives generic responses
**Solution:**
- Wait for text extraction to complete (check logs)
- Verify materials have `textExtracted: true` in database
- Upload more materials for better context
- Try more specific queries

### Issue: No attendance data
**Solution:**
- Ensure you're logged in as a student
- Check that attendance has been marked by teachers
- Verify userId is being passed to chatbot API

### Issue: MongoDB connection fails
**Solution:**
- Check internet connection
- Verify MongoDB Atlas IP whitelist (should allow all: 0.0.0.0/0)
- Confirm credentials in connection string

## Monitoring

### Check Server Logs
Watch the backend terminal for:
```
Starting text extraction for material 507f1f77bcf86cd799439011...
Text extraction completed for material 507f1f77bcf86cd799439011
```

### Check Database
Use MongoDB Compass or Atlas UI to verify:
- Collection: `materials`
- Check fields: `textExtracted`, `extractedText`

### Test API Endpoints

**Get all materials:**
```bash
curl http://localhost:5000/api/materials
```

**Chat with bot:**
```bash
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is in the syllabus?", "sessionId": "test123"}'
```

## Performance Tips

1. **For Large PDFs:**
   - Extraction may take 10-30 seconds
   - Check server logs for progress
   - Don't upload files larger than 10MB

2. **For Images:**
   - OCR is slower than text extraction
   - Use clear, high-resolution images
   - Ensure good contrast for better accuracy

3. **For Better Responses:**
   - Upload well-structured documents
   - Include descriptive titles and descriptions
   - Use consistent naming conventions

## Next Steps

1. **Upload More Materials:**
   - Add syllabus for all subjects
   - Upload lecture notes
   - Add previous year question papers
   - Upload timetables

2. **Test Different Queries:**
   - Try subject-specific questions
   - Ask about exam patterns
   - Query about specific topics

3. **Monitor Usage:**
   - Check which queries work best
   - Identify gaps in material coverage
   - Gather student feedback

## Support

If you encounter issues:

1. **Check Logs:**
   - Backend terminal output
   - Browser console (F12)

2. **Verify Configuration:**
   - `.env` file settings
   - MongoDB connection
   - API keys

3. **Test Components:**
   - Run `node test-extraction.js`
   - Test API endpoints individually
   - Check database records

## Success Indicators

✅ Server starts without errors  
✅ Text extraction logs appear  
✅ Chatbot provides specific answers from materials  
✅ Attendance queries return real data  
✅ No errors in browser console  
✅ Materials show `textExtracted: true` in database

---

**Congratulations!** 🎉 Your AI chatbot with document intelligence is now ready to help students with their queries!

