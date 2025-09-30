# 🤖 AI-Powered Chatbot for CSE Attendance System

## 🌟 Overview

An intelligent chatbot that extracts and queries data from teacher-uploaded materials (syllabus, notes, timetables, PYQs) and provides personalized attendance information to students.

---

## ✨ Key Features

### 📄 Document Intelligence
- **Automatic Text Extraction** from PDFs, Word docs, images, and text files
- **OCR Support** for scanned documents and images
- **Multi-format Processing** with specialized libraries
- **Background Processing** for non-blocking uploads

### 🧠 AI-Powered Responses
- **RAG (Retrieval Augmented Generation)** for accurate answers
- **Context-Aware** responses based on actual uploaded content
- **Google Gemini AI** integration for natural language understanding
- **Source Attribution** in responses

### 📊 Attendance Integration
- **Real-time Statistics** - percentage, present/absent counts
- **Recent History** - last 5-10 attendance records
- **Personalized Insights** - recommendations and warnings
- **Subject-wise Breakdown** - attendance per course

### 🔍 Smart Search
- **Keyword Matching** across all materials
- **Type Detection** - automatically identifies material type
- **Relevance Ranking** - returns most relevant results
- **Fast Retrieval** - indexed database queries

---

## 🚀 Quick Start

### 1. Start the System
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Upload Materials (Teacher)
- Login as teacher
- Navigate to "Upload Material"
- Select file and fill metadata
- Upload → Text extraction happens automatically

### 3. Query Chatbot (Student)
- Login as student
- Click chat icon (bottom-right)
- Ask questions about materials or attendance
- Get intelligent, context-aware responses

---

## 💬 Example Queries

### About Materials
```
"What topics are in the Data Structures syllabus?"
"Explain binary search from the notes"
"When is the Database class?"
"What questions were asked in last year's exam?"
```

### About Attendance
```
"What's my attendance percentage?"
"How many classes have I missed?"
"Show my recent attendance"
"Am I at risk of low attendance?"
```

### Study Help
```
"What should I study for the exam?"
"Which subjects need more attention?"
"Explain pointers from the notes"
"Compare BFS and DFS"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    STUDENT INTERFACE                     │
│  • Chat window with message history                     │
│  • Real-time responses                                   │
│  • Loading indicators                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   CHATBOT API LAYER                      │
│  • Query analysis                                        │
│  • Material search                                       │
│  • Attendance retrieval                                  │
│  • Context building                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI AI                       │
│  • Natural language processing                           │
│  • Context-aware generation                              │
│  • Intelligent responses                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                      │
│  • Materials with extracted text                         │
│  • Attendance records                                    │
│  • User information                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Backend
- **Express.js** - REST API framework
- **Mongoose** - MongoDB ODM
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **mammoth** - Word document processing
- **tesseract.js** - OCR for images
- **@google/generative-ai** - Gemini AI SDK

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **Lucide Icons** - Icon library
- **Tailwind CSS** - Styling

### Database
- **MongoDB Atlas** - Cloud database
- **Text Indexing** - Full-text search capability

### AI
- **Google Gemini AI** - Language model
- **RAG Pattern** - Retrieval Augmented Generation

---

## 📁 Project Structure

```
AUTOMATED--ATTENDANCE-TRACKER-AND-AI-POWERED-LEARNING/
│
├── backend/
│   ├── models/
│   │   └── Material.js          # Enhanced with text extraction fields
│   ├── routes/
│   │   ├── chatbotRoutes.js     # AI chatbot logic with RAG
│   │   └── materialRoutes.js    # Material upload with extraction
│   ├── utils/
│   │   └── extractText.js       # Text extraction utilities
│   ├── test-extraction.js       # Testing script
│   └── server.js                # Main server file
│
├── src/
│   ├── components/
│   │   └── Student/
│   │       └── Chatbot.jsx      # Enhanced chatbot UI
│   └── services/
│       └── api.js               # API client with userId support
│
├── Documentation/
│   ├── AI_CHATBOT_README.md     # Feature documentation
│   ├── SETUP_GUIDE.md           # Detailed setup instructions
│   ├── ARCHITECTURE.md          # System architecture
│   ├── EXAMPLE_QUERIES.md       # Query examples
│   ├── QUICK_START.md           # Quick reference
│   └── IMPLEMENTATION_SUMMARY.md # This implementation summary
│
└── .env                         # Environment variables
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Supported File Formats
- **PDF** (.pdf) - Full text extraction
- **Word** (.doc, .docx) - Complete content
- **Text** (.txt) - Direct reading
- **Images** (.jpg, .png) - OCR extraction
- **PowerPoint** (.ppt, .pptx) - Basic support

### File Size Limits
- Maximum upload size: **10MB**
- Recommended: **< 5MB** for faster processing

---

## 🎯 How It Works

### 1. Material Upload Flow
```
Teacher uploads file
    ↓
File saved to disk (/uploads/materials/)
    ↓
Material document created in MongoDB
    ↓
Text extraction triggered (async)
    ↓
Extracted text stored in database
    ↓
Material now searchable by chatbot
```

### 2. Query Processing Flow
```
Student asks question
    ↓
System analyzes query keywords
    ↓
Searches relevant materials in database
    ↓
Fetches attendance data (if needed)
    ↓
Builds context with retrieved information
    ↓
Sends to Gemini AI with context
    ↓
AI generates intelligent response
    ↓
Response returned to student
```

### 3. RAG Implementation
```
Retrieval: Search MongoDB for relevant materials
    ↓
Augmentation: Add material content to AI prompt
    ↓
Generation: Gemini AI creates contextual response
```

---

## 📊 Performance

### Text Extraction Speed
| File Type | Size | Time |
|-----------|------|------|
| PDF | 10 pages | 2-5 sec |
| Word | 5 pages | 1-3 sec |
| Text | Any | <1 sec |
| Image | 1 page | 5-15 sec |

### Query Response Time
| Query Type | Time |
|------------|------|
| Simple | 1-2 sec |
| With search | 2-4 sec |
| With attendance | 2-3 sec |
| Complex | 3-5 sec |

---

## 🔒 Security

### Authentication
- JWT token validation
- User session management
- Role-based access control

### Data Privacy
- Attendance data only for logged-in student
- Materials accessible to enrolled students
- No sensitive data in chat logs

### File Upload Security
- File type validation
- Size limits enforced
- Sanitized filenames
- Secure storage path

---

## 🧪 Testing

### Run Test Script
```bash
cd backend
node test-extraction.js
```

### Test API Endpoints
```bash
# Test chatbot
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}'

# Extract all materials
curl -X POST http://localhost:5000/api/materials/extract-all

# Get materials
curl http://localhost:5000/api/materials
```

### Manual Testing Checklist
- [ ] Upload PDF material
- [ ] Check extraction logs
- [ ] Query chatbot about material
- [ ] Verify response accuracy
- [ ] Test attendance queries
- [ ] Check error handling

---

## 🐛 Troubleshooting

### Issue: Chatbot not responding
**Solution:** 
- Check GEMINI_API_KEY in .env
- Verify internet connection
- Check server logs for errors

### Issue: Text extraction fails
**Solution:**
- Verify file format is supported
- Check file is not corrupted
- Review server logs for specific error

### Issue: No relevant results
**Solution:**
- Wait for text extraction to complete
- Upload more materials
- Try different query keywords

### Issue: Attendance not showing
**Solution:**
- Ensure logged in as student
- Check attendance has been marked
- Verify userId is passed to API

---

## 📚 Documentation

### Available Guides
1. **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
4. **[EXAMPLE_QUERIES.md](EXAMPLE_QUERIES.md)** - Sample queries
5. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete summary

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Vector embeddings for semantic search
- [ ] Multi-language support
- [ ] Auto-generated summaries
- [ ] Question bank extraction from PYQs
- [ ] AI-powered study plans
- [ ] Voice input support
- [ ] File preview in chat
- [ ] Usage analytics

### Optimization
- [ ] Redis caching for frequent queries
- [ ] CDN for file delivery
- [ ] Batch processing for extraction
- [ ] Response compression
- [ ] API rate limiting

---

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure .env file
4. Start development servers
5. Make changes and test
6. Submit pull request

### Code Style
- Follow existing patterns
- Add comments for complex logic
- Write tests for new features
- Update documentation

---

## 📄 License

This project is part of the CSE Attendance System.

---

## 🙏 Acknowledgments

### Technologies Used
- Google Gemini AI for intelligent responses
- MongoDB for flexible data storage
- React for modern UI
- Express.js for robust backend

### Libraries
- pdf-parse for PDF extraction
- mammoth for Word processing
- tesseract.js for OCR
- multer for file uploads

---

## 📞 Support

### Getting Help
1. Check documentation files
2. Review example queries
3. Test with sample materials
4. Check server logs
5. Verify database records

### Debugging Tips
- Enable verbose logging
- Test API endpoints individually
- Check MongoDB records
- Verify environment variables
- Review extraction logs

---

## ✅ Success Checklist

- [x] Text extraction implemented
- [x] Material search functional
- [x] Attendance integration complete
- [x] AI responses working
- [x] Error handling robust
- [x] Documentation comprehensive
- [x] Testing scripts provided
- [x] Examples documented

---

## 🎉 Ready to Use!

Your AI chatbot is fully functional and ready to help students with:
- ✅ Syllabus queries
- ✅ Notes explanations
- ✅ Timetable information
- ✅ PYQ insights
- ✅ Attendance tracking
- ✅ Study recommendations

**Start the servers and begin learning! 📚🤖**

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready

