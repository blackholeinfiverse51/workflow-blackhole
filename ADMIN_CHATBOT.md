# Admin AI Chatbot - Implementation Guide

## Overview
The Admin AI Chatbot is an intelligent assistant integrated into the admin dashboard that helps administrators manage the Infiverse workflow management system more efficiently. It uses the Grok AI API to provide real-time insights, answer questions, and suggest actions.

## Features

### 🤖 Intelligent Assistance
- **Real-time System Data**: Access to current statistics (users, tasks, departments, attendance)
- **Context-Aware Responses**: Understands the current system state
- **Natural Conversations**: Maintains conversation history for contextual interactions
- **Multi-topic Support**: Can handle various admin-related queries

### 💬 Conversation Features
- **Persistent Sessions**: Conversation history maintained during the session
- **Clear Chat**: Reset conversation at any time
- **Minimize/Maximize**: Non-intrusive interface that can be minimized
- **Responsive Design**: Works on desktop and mobile devices

### 🎯 What the Chatbot Can Help With
1. **System Statistics & Insights**
   - Current user count and activity
   - Task distribution and status
   - Department information
   - Attendance tracking

2. **Task Management Advice**
   - Workload optimization
   - Priority recommendations
   - Deadline management tips
   - Resource allocation suggestions

3. **User & Department Queries**
   - User role information
   - Department structure insights
   - Team composition analysis

4. **Workflow Optimization**
   - Process improvement suggestions
   - Best practices recommendations
   - Efficiency tips

5. **General Admin Assistance**
   - Feature explanations
   - Navigation help
   - Quick answers to common questions

## Technical Implementation

### Backend (`server/routes/chatbot.js`)

**Endpoints:**
- `POST /api/chatbot/chat` - Send a message and receive AI response
- `POST /api/chatbot/clear` - Clear conversation history
- `GET /api/chatbot/status` - Get system status and context

**Key Features:**
- Uses Groq SDK with configurable model
- Gathers real-time system context from database
- Maintains conversation history in memory
- Automatic session cleanup after 1 hour
- Admin-only access with authentication middleware

**Context Data Gathered:**
```javascript
{
  totalUsers: Number,
  totalTasks: Number,
  totalDepartments: Number,
  attendanceThisWeek: Number,
  taskStats: {
    pending: Number,
    inProgress: Number,
    completed: Number,
    overdue: Number
  },
  departments: Array,
  recentTasks: Array
}
```

### Frontend (`client/src/components/admin/admin-chatbot.jsx`)

**Component Features:**
- Floating chat bubble interface
- Minimize/maximize functionality
- Auto-scroll to latest messages
- Loading states with animations
- Error handling with user-friendly messages
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

**UI/UX Highlights:**
- Gradient purple-to-blue theme
- Smooth animations and transitions
- Clear distinction between user and AI messages
- Timestamp display on all messages
- Loading indicator during AI processing

## Configuration

### Environment Variables
Ensure these are set in your `.env` file:

```env
# Required
GROQ_API_KEY=your_grok_api_key_here

# Optional (defaults provided)
GROQ_MODEL=llama-3.3-70b-versatile
MONGODB_URI=your_mongodb_connection_string
```

### Available Models
The chatbot supports various Groq models:
- `llama-3.3-70b-versatile` (default) - Best for general conversation
- `llama-3.2-90b-vision-preview` - Supports vision capabilities
- `llama3-8b-8192` - Faster, lighter model

## Installation

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install groq-sdk
```

**Frontend:**
```bash
cd client
npm install @radix-ui/react-scroll-area
```

### 2. Environment Setup
Add your Grok API key to `server/.env`:
```env
GROQ_API_KEY=your_api_key_here
```

### 3. Start the Application
```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm run dev
```

## Usage

### Accessing the Chatbot
1. Log in as an Admin user
2. Navigate to the Admin Dashboard
3. Click the purple chat bubble in the bottom-right corner
4. Start typing your questions!

### Example Queries
```
"How many tasks are currently overdue?"
"What's the status of our departments?"
"Show me user statistics"
"How can I improve task assignment?"
"What are the best practices for managing deadlines?"
"How many users are active this week?"
```

### Tips for Best Results
- Be specific in your questions
- Ask one question at a time for clearer responses
- Use the context from previous messages in follow-up questions
- Clear the chat if switching to a completely different topic

## Architecture

### Flow Diagram
```
User Input → Frontend Component → API Request
                                       ↓
                            Auth Middleware (Check Admin)
                                       ↓
                            Gather System Context (DB Queries)
                                       ↓
                            Build System Prompt + User Message
                                       ↓
                            Groq AI API Call
                                       ↓
                            Parse & Format Response
                                       ↓
                            Return to Frontend
                                       ↓
                            Display in Chat UI
```

### Security
- **Authentication Required**: Only admin users can access the chatbot
- **JWT Token Validation**: All requests validated with auth middleware
- **Rate Limiting**: Consider implementing rate limiting in production
- **Data Privacy**: Conversation history stored temporarily (1 hour max)

## Customization

### Changing the AI Model
Edit `server/routes/chatbot.js`:
```javascript
model: 'your-preferred-model',
```

### Adjusting Response Length
Modify the `max_tokens` parameter:
```javascript
max_tokens: 1024, // Increase for longer responses
```

### Customizing the System Prompt
Edit the `buildSystemPrompt` function in `server/routes/chatbot.js` to adjust the AI's behavior and capabilities.

### Styling the Chat UI
The chatbot uses Tailwind CSS. Modify the classes in `client/src/components/admin/admin-chatbot.jsx`:
- Colors: Change `purple-600`, `blue-600` to your brand colors
- Size: Adjust `w-96` for width, `h-[600px]` for height
- Position: Modify `bottom-6 right-6` for different placement

## Troubleshooting

### Chatbot Not Responding
1. Check if `GROQ_API_KEY` is set in `.env`
2. Verify the server is running and connected to MongoDB
3. Check browser console for error messages
4. Verify user is logged in as Admin

### "Access Denied" Error
- Ensure you're logged in with an Admin account
- Check JWT token is valid and not expired

### Slow Responses
- This is normal for AI processing (2-5 seconds typically)
- Consider using a faster model if response time is critical
- Check your internet connection

### Installation Issues
```bash
# If ScrollArea component issues:
cd client
npm install @radix-ui/react-scroll-area --force

# If Groq SDK issues:
cd server
npm install groq-sdk --save
```

## Future Enhancements

### Potential Features
- [ ] Voice input support
- [ ] Conversation history persistence (database storage)
- [ ] Multi-language support
- [ ] Suggested prompts/quick actions
- [ ] Integration with task creation/management
- [ ] Export conversation history
- [ ] Analytics dashboard for chatbot usage
- [ ] Custom training on company-specific data

### Performance Improvements
- [ ] Implement Redis for conversation history
- [ ] Add response caching for common queries
- [ ] Rate limiting and request queuing
- [ ] Streaming responses for longer AI outputs

## Support

For issues or questions:
1. Check this documentation first
2. Review the code comments in the implementation files
3. Test the API endpoints directly using tools like Postman
4. Check Groq AI documentation: https://console.groq.com/docs

## Credits

**Built with:**
- Groq AI API (Grok/LLaMA models)
- React + Vite
- Tailwind CSS + Radix UI
- Express.js + MongoDB
- Socket.io for real-time features

**Component Libraries:**
- shadcn/ui components
- Lucide React icons
- Axios for API calls

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Production Ready ✅

