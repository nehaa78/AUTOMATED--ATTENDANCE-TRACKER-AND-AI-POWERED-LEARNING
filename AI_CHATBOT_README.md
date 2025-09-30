# AI Chatbot with Document Intelligence

## Overview
The AI chatbot has been enhanced to intelligently extract and query data from teacher-uploaded materials including syllabus, notes, timetables, and PYQs (Previous Year Questions). It also provides personalized attendance information to students.

## Features

### 1. **Document Text Extraction**
- Automatically extracts text from uploaded files
- Supported formats:
  - **PDF** - Full text extraction
  - **Word Documents** (.doc, .docx) - Complete content extraction
  - **Text Files** (.txt) - Direct reading
  - **Images** (.jpg, .png) - OCR (Optical Character Recognition)
  - **PowerPoint** (.ppt, .pptx) - Basic support

### 2. **Intelligent Query Processing**
- Searches through extracted content from all uploaded materials
- Identifies relevant documents based on query keywords
- Provides context-aware responses using Google Gemini AI

### 3. **Attendance Integration**
- Fetches real-time attendance data for students
- Calculates attendance percentage
- Shows recent attendance records
- Provides personalized attendance insights

### 4. **RAG (Retrieval Augmented Generation)**
- Combines document retrieval with AI generation
- Provides accurate answers based on actual uploaded content
- Includes source material references in responses

## How It Works

### Backend Architecture

```
User Query → Search Materials → Extract Relevant Content → 
→ Get Attendance Data (if needed) → Build Context → 
→ Send to Gemini AI → Generate Response → Return to User
```

### Key Components

1. **Text Extraction Utility** (`backend/utils/extractText.js`)
   - Handles multiple file formats
   - Uses specialized libraries for each format
   - Implements OCR for images

2. **Enhanced Material Model** (`backend/models/Material.js`)
   - Stores extracted text content
   - Tracks extraction status
   - Enables text search indexing

3. **Smart Chatbot Routes** (`backend/routes/chatbotRoutes.js`)
   - Searches relevant materials
   - Fetches attendance context
   - Integrates with Gemini AI
   - Provides contextual responses

## Usage

### For Students

1. **Ask About Materials:**
   ```
   "What topics are covered in the Data Structures syllabus?"
   "Show me notes about binary trees"
   "When is the Database class according to timetable?"
   "What questions were asked in last year's OS exam?"
   ```

2. **Check Attendance:**
   ```
   "What's my attendance percentage?"
   "How many classes have I missed?"
   "Show my recent attendance"
   ```

3. **General Queries:**
   ```
   "What should I study for the upcoming exam?"
   "Which subjects do I need to focus on?"
   ```

### For Teachers

1. **Upload Materials:**
   - Go to Material Upload section
   - Select file type (Syllabus, Notes, Timetable, PYQs)
   - Upload the document
   - Text extraction happens automatically in the background

2. **Monitor Extraction:**
   - Check server logs for extraction status
   - Materials are immediately available for chatbot queries

## API Endpoints

### Chat Endpoint
```
POST /api/chatbot/chat
Body: {
  message: "Your question here",
  sessionId: "unique-session-id",
  userId: "student-user-id" (optional)
}
```

### Extract Text from Existing Materials
```
POST /api/materials/extract-all
```
This utility endpoint processes all materials that haven't had text extracted yet.

## Configuration

### Environment Variables (.env)
```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### Required NPM Packages
Already installed in your project:
- `@google/generative-ai` - Gemini AI integration
- `pdf-parse` - PDF text extraction
- `mammoth` - Word document processing
- `tesseract.js` - OCR for images

## Testing the Chatbot

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Upload Test Materials
- Login as a teacher
- Upload sample documents (PDF, Word, etc.)
- Wait a few seconds for text extraction

### 4. Test Queries
- Login as a student
- Open the chatbot (bottom-right corner)
- Ask questions about the uploaded materials

## Example Interactions

### Query: "What is covered in the syllabus?"
**Response:**
```
Based on the Computer Networks syllabus for Semester 5, the following topics are covered:

1. Introduction to Networks
2. OSI Model and TCP/IP
3. Data Link Layer protocols
4. Network Layer and Routing
5. Transport Layer (TCP/UDP)
...

[Source: Computer Networks Syllabus - Semester 5]
```

### Query: "What's my attendance?"
**Response:**
```
Here's your attendance summary:

📊 Overall Statistics:
- Total Classes: 45
- Present: 38
- Absent: 7
- Attendance Percentage: 84.44%

📅 Recent Attendance:
- 2024-01-15: Present (Data Structures)
- 2024-01-14: Present (Computer Networks)
- 2024-01-13: Absent (Operating Systems)
...
```

## Troubleshooting

### Text Extraction Not Working
1. Check server logs for extraction errors
2. Verify file format is supported
3. Ensure file is not corrupted
4. Run manual extraction: `POST /api/materials/extract-all`

### Chatbot Not Responding
1. Verify GEMINI_API_KEY is set in .env
2. Check internet connection
3. Review server logs for errors
4. Ensure MongoDB is connected

### No Relevant Results
1. Upload more materials
2. Wait for text extraction to complete
3. Try different query keywords
4. Check if materials have `textExtracted: true`

## Performance Optimization

### Text Extraction
- Runs asynchronously to avoid blocking uploads
- Processes in background
- Stores results in database for quick retrieval

### Search Optimization
- Text indexing on Material model
- Limits results to top 5 most relevant
- Filters by material type when detected

### AI Response Caching
- Session-based chat history
- Reduces redundant API calls
- Maintains conversation context

## Future Enhancements

1. **Vector Embeddings** - Use embeddings for semantic search
2. **Multi-language Support** - Extract text in multiple languages
3. **Summary Generation** - Auto-generate material summaries
4. **Question Bank** - Extract and categorize questions from PYQs
5. **Study Recommendations** - AI-powered study plans based on attendance and materials

## Security Considerations

- User authentication required for attendance data
- Materials accessible only to enrolled students
- API rate limiting recommended
- Sensitive data not stored in chat logs

## Support

For issues or questions:
1. Check server logs: `backend/logs`
2. Review MongoDB collections: `materials`, `users`, `attendance`
3. Test API endpoints using Postman
4. Verify Gemini API quota and limits

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Powered by:** Google Gemini AI, MongoDB, Express, React

