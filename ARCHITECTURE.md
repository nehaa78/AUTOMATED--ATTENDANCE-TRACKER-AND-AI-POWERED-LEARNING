# AI Chatbot Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT INTERFACE                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chatbot Component (React)                                │  │
│  │  - Message Input                                          │  │
│  │  - Chat History                                           │  │
│  │  - Loading States                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chatbot Routes (/api/chatbot/chat)                      │  │
│  │  1. Receive user query                                    │  │
│  │  2. Search relevant materials                             │  │
│  │  3. Fetch attendance data (if needed)                     │  │
│  │  4. Build context                                         │  │
│  │  5. Send to Gemini AI                                     │  │
│  │  6. Return response                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MATERIAL SEARCH ENGINE                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  searchRelevantMaterials()                                │  │
│  │  - Detect material type from query                        │  │
│  │  - Search MongoDB with filters                            │  │
│  │  - Match keywords in extracted text                       │  │
│  │  - Return top 5 relevant materials                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Materials Collection                                     │  │
│  │  {                                                        │  │
│  │    title: "Data Structures Syllabus",                    │  │
│  │    type: "syllabus",                                      │  │
│  │    subject: "Data Structures",                            │  │
│  │    extractedText: "Chapter 1: Arrays...",                │  │
│  │    textExtracted: true                                    │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Attendance Collection                                    │  │
│  │  {                                                        │  │
│  │    studentId: "507f...",                                  │  │
│  │    date: "2024-01-15",                                    │  │
│  │    status: "present",                                     │  │
│  │    subject: "Data Structures"                             │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE GEMINI AI                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Input: User Query + Context                             │  │
│  │  - Material excerpts                                      │  │
│  │  - Attendance statistics                                  │  │
│  │  - Chat history                                           │  │
│  │                                                            │  │
│  │  Output: Intelligent Response                             │  │
│  │  - Answers based on actual content                        │  │
│  │  - Personalized to student                                │  │
│  │  - Contextually relevant                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Material Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      TEACHER INTERFACE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Material Upload Form                                     │  │
│  │  - Select file (PDF, DOC, TXT, IMG)                      │  │
│  │  - Enter metadata (title, subject, type)                 │  │
│  │  - Click Upload                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Multipart Form Data
┌─────────────────────────────────────────────────────────────────┐
│                    MATERIAL UPLOAD ROUTE                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/materials/upload                               │  │
│  │  1. Receive file via Multer                               │  │
│  │  2. Save to disk (/uploads/materials/)                    │  │
│  │  3. Create Material document in MongoDB                   │  │
│  │  4. Trigger async text extraction                         │  │
│  │  5. Return success response                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Async
┌─────────────────────────────────────────────────────────────────┐
│                    TEXT EXTRACTION PROCESS                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  extractTextFromFile()                                    │  │
│  │                                                            │  │
│  │  PDF → pdf-parse → Extract text                          │  │
│  │  DOC/DOCX → mammoth → Extract text                       │  │
│  │  TXT → fs.readFile → Read text                           │  │
│  │  JPG/PNG → tesseract.js → OCR text                       │  │
│  │                                                            │  │
│  │  ↓                                                         │  │
│  │  Clean & normalize text                                   │  │
│  │  ↓                                                         │  │
│  │  Update Material document:                                │  │
│  │  - extractedText: "..."                                   │  │
│  │  - textExtracted: true                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MATERIAL NOW SEARCHABLE                       │
│  ✅ Available for chatbot queries                               │
│  ✅ Indexed for text search                                     │
│  ✅ Ready for AI context building                               │
└─────────────────────────────────────────────────────────────────┘
```

## Query Processing Flow

```
Student Query: "What topics are in the Data Structures syllabus?"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Query Analysis                                          │
│  - Detect keywords: "topics", "Data Structures", "syllabus"     │
│  - Identify material type: syllabus                              │
│  - Identify subject: Data Structures                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Material Search                                         │
│  - Query MongoDB: { type: "syllabus", textExtracted: true }    │
│  - Filter by keywords in extractedText                           │
│  - Sort by relevance and date                                    │
│  - Limit to top 5 results                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Context Building                                        │
│  Context:                                                        │
│  "Relevant Materials Found:                                      │
│   1. Data Structures Syllabus (Semester 3)                      │
│      Content: Chapter 1: Arrays and Linked Lists                │
│                Chapter 2: Stacks and Queues                      │
│                Chapter 3: Trees and Graphs..."                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: AI Processing (Gemini)                                 │
│  Input: Query + Context                                          │
│  Processing: RAG (Retrieval Augmented Generation)               │
│  Output: "Based on the Data Structures syllabus, the topics    │
│           covered include: 1. Arrays and Linked Lists..."       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Response Delivery                                       │
│  - Format response                                               │
│  - Send to frontend                                              │
│  - Display in chat window                                        │
│  - Store in chat history                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Attendance Query Flow

```
Student Query: "What's my attendance percentage?"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Detect Attendance Query                                 │
│  - Keywords: "attendance", "percentage"                          │
│  - Extract userId from request                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Fetch Attendance Data                                   │
│  - Query: { studentId: userId }                                  │
│  - Get last 10 records                                           │
│  - Calculate statistics:                                         │
│    * Total classes                                               │
│    * Present count                                               │
│    * Absent count                                                │
│    * Percentage                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Build Attendance Context                                │
│  Context:                                                        │
│  "Student Attendance Information:                                │
│   - Total Classes: 45                                            │
│   - Present: 38                                                  │
│   - Absent: 7                                                    │
│   - Attendance Percentage: 84.44%                                │
│   Recent Attendance:                                             │
│   - 2024-01-15: Present (Data Structures)..."                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: AI Response Generation                                  │
│  - Gemini AI processes query + attendance context               │
│  - Generates personalized response                               │
│  - Includes insights and recommendations                         │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React** - UI framework
- **Lucide Icons** - Icon library
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Backend
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Mongoose** - MongoDB ODM

### AI & ML
- **Google Gemini AI** - Language model
- **Tesseract.js** - OCR for images

### Text Extraction
- **pdf-parse** - PDF text extraction
- **mammoth** - Word document processing
- **fs** - Text file reading

### Database
- **MongoDB Atlas** - Cloud database
- **Text Indexing** - Full-text search

## Data Models

### Material Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: Enum['syllabus', 'notes', 'timetable', 'pyqs'],
  subject: String,
  semester: Number,
  filename: String,
  originalName: String,
  filePath: String,
  uploadedBy: ObjectId (ref: User),
  uploadDate: Date,
  extractedText: String,        // NEW
  textExtracted: Boolean,        // NEW
  extractionError: String        // NEW
}
```

### Attendance Model
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  date: Date,
  status: Enum['present', 'absent'],
  subject: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Authentication Required**
   - User must be logged in
   - JWT token validation

2. **File Upload Security**
   - File type validation
   - Size limits (10MB)
   - Sanitized filenames

3. **Data Privacy**
   - Attendance data only for logged-in student
   - Materials accessible to enrolled students
   - No sensitive data in chat logs

4. **API Security**
   - CORS enabled
   - Rate limiting (recommended)
   - Input validation

## Performance Optimizations

1. **Async Text Extraction**
   - Non-blocking uploads
   - Background processing
   - Progress logging

2. **Database Indexing**
   - Text index on extractedText
   - Compound indexes on queries
   - Efficient filtering

3. **Response Caching**
   - Session-based chat history
   - Reduced API calls
   - Context preservation

4. **Query Optimization**
   - Limit results to top 5
   - Selective field projection
   - Efficient text matching

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless API design
   - Session storage in memory (can move to Redis)
   - Load balancer ready

2. **File Storage**
   - Currently: Local disk
   - Future: Cloud storage (S3, GCS)

3. **Database**
   - MongoDB Atlas auto-scaling
   - Sharding support
   - Replica sets for HA

4. **AI API**
   - Rate limiting awareness
   - Fallback to simple mode
   - Error handling

---

**Architecture Version:** 1.0.0  
**Last Updated:** 2024

