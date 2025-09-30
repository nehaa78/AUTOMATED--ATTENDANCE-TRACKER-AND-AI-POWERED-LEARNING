const express = require('express');
const router = express.Router();

// Initialize Gemini AI (fallback if no API key)
let genAI;
let chatSessions = new Map();

try {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.log('Gemini AI not configured. Using simple chatbot.');
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

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!genAI) {
      // Simple chatbot fallback
      const lowerMessage = message.toLowerCase();
      let response = simpleResponses.default;
      
      if (lowerMessage.includes('syllabus')) response = simpleResponses.syllabus;
      else if (lowerMessage.includes('note')) response = simpleResponses.notes;
      else if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) response = simpleResponses.timetable;
      else if (lowerMessage.includes('previous') || lowerMessage.includes('pyq')) response = simpleResponses.pyqs;
      else if (lowerMessage.includes('attendance')) response = simpleResponses.attendance;
      
      return res.json({ 
        response: response + ' (Simple Bot Mode - Configure Gemini API for AI responses)',
        sessionId 
      });
    }

    // Initialize or get existing session
    if (!chatSessions.has(sessionId)) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{text: "You are a helpful assistant for computer science students. Help them with syllabus, notes, timetable, previous year questions, and attendance related queries."}],
          },
          {
            role: "model",
            parts: [{text: "Hello! I'm here to help you with your computer science studies. I can assist with syllabus information, study notes, timetable queries, previous year questions, and attendance tracking. What would you like to know?"}],
          },
        ],
      });
      chatSessions.set(sessionId, chat);
    }

    const chat = chatSessions.get(sessionId);
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text, sessionId });
  } catch (error) {
    res.status(500).json({ 
      error: 'Chatbot service unavailable. Using simple mode.',
      response: simpleResponses.default
    });
  }
});

module.exports = router;


