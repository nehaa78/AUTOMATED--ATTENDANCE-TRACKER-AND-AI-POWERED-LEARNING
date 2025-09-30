const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const mongoose = require('mongoose');

// Initialize Gemini AI (fallback if no API key)
let genAI;
let chatSessions = new Map();

try {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.log('⚠️  No GEMINI_API_KEY found. Using simple chatbot mode.');
  }
} catch (error) {
  console.log('❌ Gemini AI initialization failed:', error.message);
  console.log('Using simple chatbot mode.');
}

// Simple response database for fallback
const simpleResponses = {
  'syllabus': 'You can find the syllabus in the Materials section under Syllabus category.',
  'notes': 'Study notes are available in the Materials library. Filter by subject to find relevant notes.',
  'timetable': 'Check the Timetable section in Materials for current class schedules.',
  'pyqs': 'Previous year questions are available in PYQs category in Materials.',
  'attendance': 'Check your attendance records in the Student Dashboard. You can view attendance by subject and see your overall percentage.',
  'default': 'I can help you with syllabus, notes, timetable, previous year questions, and attendance queries. Please check the Materials section or ask specific questions.'
};

// Helper function to search relevant materials based on query
async function searchRelevantMaterials(query) {
  try {
    const lowerQuery = query.toLowerCase();

    // Determine material type from query
    let materialType = null;
    if (lowerQuery.includes('syllabus')) materialType = 'syllabus';
    else if (lowerQuery.includes('note')) materialType = 'notes';
    else if (lowerQuery.includes('timetable') || lowerQuery.includes('schedule')) materialType = 'timetable';
    else if (lowerQuery.includes('pyq') || lowerQuery.includes('previous year') || lowerQuery.includes('question')) materialType = 'pyqs';

    // Build search filter
    const filter = { textExtracted: true };
    if (materialType) filter.type = materialType;

    // Search using text index or regex
    const materials = await Material.find(filter)
      .select('title description type subject semester extractedText')
      .limit(5)
      .sort({ uploadDate: -1 });

    // Filter materials that contain relevant keywords
    const relevantMaterials = materials.filter(material => {
      const searchText = `${material.title} ${material.description} ${material.extractedText}`.toLowerCase();
      const queryWords = lowerQuery.split(' ').filter(word => word.length > 3);
      return queryWords.some(word => searchText.includes(word));
    });

    return relevantMaterials.length > 0 ? relevantMaterials : materials;
  } catch (error) {
    console.error('Error searching materials:', error);
    return [];
  }
}

// Helper function to get attendance data for context
async function getAttendanceContext(userId) {
  try {
    const Attendance = mongoose.model('Attendance');

    if (!userId) return null;

    // Get recent attendance records
    const records = await Attendance.find({ studentId: userId })
      .sort({ date: -1 })
      .limit(10);

    if (records.length === 0) return null;

    // Calculate statistics
    const totalClasses = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const attendancePercentage = ((presentCount / totalClasses) * 100).toFixed(2);

    return {
      totalClasses,
      presentCount,
      absentCount: totalClasses - presentCount,
      attendancePercentage,
      recentRecords: records.slice(0, 5).map(r => ({
        date: r.date.toLocaleDateString(),
        status: r.status,
        subject: r.subject
      }))
    };
  } catch (error) {
    console.error('Error getting attendance context:', error);
    return null;
  }
}

// Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    // Search for relevant materials based on the query
    const relevantMaterials = await searchRelevantMaterials(message);

    // Get attendance context if user is asking about attendance
    let attendanceContext = null;
    if (message.toLowerCase().includes('attendance') && userId) {
      attendanceContext = await getAttendanceContext(userId);
    }

    // Build enhanced response with context
    let enhancedResponse = '';

    // If no AI available, use smart fallback with actual data
    if (!genAI) {
      const lowerMessage = message.toLowerCase();

      // Handle attendance queries with real data
      if (lowerMessage.includes('attendance') && attendanceContext) {
        enhancedResponse = `📊 Your Attendance Summary:\n\n`;
        enhancedResponse += `Total Classes: ${attendanceContext.totalClasses}\n`;
        enhancedResponse += `Present: ${attendanceContext.presentCount}\n`;
        enhancedResponse += `Absent: ${attendanceContext.absentCount}\n`;
        enhancedResponse += `Attendance Percentage: ${attendanceContext.attendancePercentage}%\n\n`;
        enhancedResponse += `Recent Attendance:\n`;
        attendanceContext.recentRecords.forEach(record => {
          enhancedResponse += `- ${record.date}: ${record.status}${record.subject ? ` (${record.subject})` : ''}\n`;
        });
      }
      // Handle material queries with real data
      else if (relevantMaterials.length > 0) {
        enhancedResponse = `📚 I found ${relevantMaterials.length} relevant material(s):\n\n`;
        relevantMaterials.forEach((material, index) => {
          enhancedResponse += `${index + 1}. ${material.title}\n`;
          enhancedResponse += `   Type: ${material.type} | Subject: ${material.subject} | Semester: ${material.semester}\n`;
          if (material.description) {
            enhancedResponse += `   Description: ${material.description}\n`;
          }
          if (material.extractedText) {
            const snippet = material.extractedText.substring(0, 200).trim();
            enhancedResponse += `   Preview: ${snippet}...\n`;
          }
          enhancedResponse += `\n`;
        });
      }
      // Generic fallback
      else {
        if (lowerMessage.includes('syllabus')) enhancedResponse = simpleResponses.syllabus;
        else if (lowerMessage.includes('note')) enhancedResponse = simpleResponses.notes;
        else if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) enhancedResponse = simpleResponses.timetable;
        else if (lowerMessage.includes('previous') || lowerMessage.includes('pyq')) enhancedResponse = simpleResponses.pyqs;
        else if (lowerMessage.includes('attendance')) enhancedResponse = simpleResponses.attendance;
        else enhancedResponse = simpleResponses.default;
      }

      return res.json({
        response: enhancedResponse,
        sessionId
      });
    }

    // AI is available - build context
    let contextText = '';

    if (relevantMaterials.length > 0) {
      contextText += '\n\nRelevant Materials Found:\n';
      relevantMaterials.forEach((material, index) => {
        contextText += `\n${index + 1}. ${material.title} (${material.type} - ${material.subject}, Semester ${material.semester})\n`;
        contextText += `Description: ${material.description || 'N/A'}\n`;

        // Include a snippet of extracted text (first 500 characters)
        if (material.extractedText) {
          const snippet = material.extractedText.substring(0, 500);
          contextText += `Content Preview: ${snippet}...\n`;
        }
      });
    }

    if (attendanceContext) {
      contextText += `\n\nStudent Attendance Information:\n`;
      contextText += `- Total Classes: ${attendanceContext.totalClasses}\n`;
      contextText += `- Present: ${attendanceContext.presentCount}\n`;
      contextText += `- Absent: ${attendanceContext.absentCount}\n`;
      contextText += `- Attendance Percentage: ${attendanceContext.attendancePercentage}%\n`;
      contextText += `\nRecent Attendance:\n`;
      attendanceContext.recentRecords.forEach(record => {
        contextText += `- ${record.date}: ${record.status}${record.subject ? ` (${record.subject})` : ''}\n`;
      });
    }

    // Initialize or get existing session
    if (!chatSessions.has(sessionId)) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{text: "You are a helpful AI assistant for computer science students. You help them with syllabus, notes, timetable, previous year questions, and attendance queries. When provided with material content or attendance data, use that information to give accurate, specific answers. Be concise and helpful."}],
          },
          {
            role: "model",
            parts: [{text: "Hello! I'm your AI study assistant. I can help you with syllabus information, study notes, timetable queries, previous year questions, and attendance tracking. I have access to your uploaded materials and can provide specific information from them. What would you like to know?"}],
          },
        ],
      });
      chatSessions.set(sessionId, chat);
    }

    const chat = chatSessions.get(sessionId);

    // Combine user message with context
    const enhancedMessage = contextText
      ? `${message}\n\n[Context Information]:${contextText}`
      : message;

    const result = await chat.sendMessage(enhancedMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text, sessionId });
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);

    // Fallback to smart response even on error
    const { message, sessionId, userId } = req.body;
    const lowerMessage = message.toLowerCase();

    // Try to provide useful response even without AI
    let fallbackResponse = simpleResponses.default;

    try {
      // Get attendance if asked
      if (lowerMessage.includes('attendance') && userId) {
        const attendanceContext = await getAttendanceContext(userId);
        if (attendanceContext) {
          fallbackResponse = `📊 Your Attendance Summary:\n\n`;
          fallbackResponse += `Total Classes: ${attendanceContext.totalClasses}\n`;
          fallbackResponse += `Present: ${attendanceContext.presentCount}\n`;
          fallbackResponse += `Absent: ${attendanceContext.absentCount}\n`;
          fallbackResponse += `Attendance Percentage: ${attendanceContext.attendancePercentage}%\n`;
        }
      }
      // Get materials if asked
      else {
        const relevantMaterials = await searchRelevantMaterials(message);
        if (relevantMaterials.length > 0) {
          fallbackResponse = `📚 Found ${relevantMaterials.length} relevant material(s):\n\n`;
          relevantMaterials.forEach((material, index) => {
            fallbackResponse += `${index + 1}. ${material.title} (${material.type})\n`;
          });
        }
      }
    } catch (e) {
      // If even fallback fails, use simple response
      console.error('Fallback also failed:', e.message);
    }

    res.json({
      response: fallbackResponse,
      sessionId
    });
  }
});

module.exports = router;


