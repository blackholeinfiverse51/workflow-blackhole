# 🚀 Admin Chatbot - Quick Start Guide

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [x] Grok API key (already added to your `.env`)
- [x] MongoDB connection string
- [x] Node.js installed
- [x] Admin user account created

## 📦 Installation (3 Steps)

### Step 1: Install New Dependencies

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

### Step 2: Verify Environment Variables

Check your `server/.env` file has:
```env
GROQ_API_KEY=your_grok_api_key_here
# or
XAI_API_KEY=your_api_key_here

# Optional - use default if not specified
GROQ_MODEL=llama-3.3-70b-versatile
```

### Step 3: Restart Your Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## 🎯 Testing the Chatbot

1. **Login as Admin**
   - Open http://localhost:5173
   - Login with admin credentials

2. **Navigate to Admin Dashboard**
   - Click on "Admin" in the sidebar
   - Or go directly to `/admin-dashboard`

3. **Open the Chatbot**
   - Look for the purple chat bubble in the bottom-right corner
   - Click to open the chatbot

4. **Try These Test Questions:**
   ```
   "Hello! What can you help me with?"
   "How many users are in the system?"
   "What's the status of our tasks?"
   "Show me department statistics"
   "How can I improve workflow efficiency?"
   ```

## 🎨 What You'll See

### Chat Bubble (Closed)
- Purple circular button with chat icon
- Bottom-right corner of the screen
- Hover effect with scale animation

### Chat Window (Open)
- **Header**: AI Assistant with Grok branding
- **Controls**: Minimize, Clear, Close buttons
- **Chat Area**: Scrollable message history
- **Input**: Text field with send button
- **Messages**: 
  - AI messages: Gray background with bot icon
  - User messages: Purple gradient with user icon

## 🔍 Troubleshooting

### Issue: Chat bubble doesn't appear
**Solution:**
- Verify you're on the Admin Dashboard page
- Check browser console for errors
- Ensure you're logged in as Admin (not Manager or User)

### Issue: "Access Denied" when sending messages
**Solution:**
```bash
# Check user role in MongoDB
db.users.findOne({ email: "your@email.com" })

# Update role to Admin if needed
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "Admin" } }
)
```

### Issue: No response from chatbot
**Solution:**
1. Check server logs for errors
2. Verify GROQ_API_KEY in `.env`
3. Test API key with a simple request:
```bash
curl -X POST http://localhost:3000/api/chatbot/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Issue: Module not found errors
**Solution:**
```bash
# Backend missing dependencies
cd server
npm install

# Frontend missing dependencies  
cd client
npm install --force
```

## 📊 API Endpoints

Test directly with curl or Postman:

### 1. Chat Endpoint
```bash
POST http://localhost:3000/api/chatbot/chat
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "message": "Hello, how many users are in the system?",
  "sessionId": "optional-session-id"
}
```

### 2. Status Endpoint
```bash
GET http://localhost:3000/api/chatbot/status
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 3. Clear Chat
```bash
POST http://localhost:3000/api/chatbot/clear
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "sessionId": "your-session-id"
}
```

## 🎓 Usage Tips

### Best Questions to Ask:
✅ "How many tasks are overdue?"
✅ "What's the current user count?"
✅ "Show me department statistics"
✅ "How can I improve task assignment?"
✅ "What are best practices for deadline management?"

### Questions to Avoid:
❌ Very vague questions like "What?"
❌ Personal information requests
❌ Questions outside system scope
❌ Multiple unrelated questions in one message

## 🔧 Customization Quick Tips

### Change Chat Colors
Edit `client/src/components/admin/admin-chatbot.jsx`:
```jsx
// Find these classes and replace colors:
from-purple-600 to-blue-600  // Main gradient
bg-purple-500                // Bot avatar
```

### Change Position
```jsx
// In AdminChatbot component:
className="fixed bottom-6 right-6 z-50"
// Change bottom-6, right-6 to your preference
```

### Change Chat Size
```jsx
className="w-96 ... h-[600px]"
// Change w-96 (width) and h-[600px] (height)
```

## 📈 What's Included

### Files Created/Modified:
```
server/
  └── routes/chatbot.js          ✨ NEW - Chatbot API routes
  └── index.js                   📝 Modified - Added chatbot route

client/
  └── src/
      ├── components/
      │   ├── admin/
      │   │   └── admin-chatbot.jsx    ✨ NEW - Chatbot UI component
      │   └── ui/
      │       └── scroll-area.jsx      ✨ NEW - Scroll component
      └── pages/
          └── AdminDashboard.jsx       📝 Modified - Added chatbot

package.json files                     📝 Modified - Added dependencies
```

## 🚀 Next Steps

After successful installation:

1. **Test Basic Functionality**
   - Send a few test messages
   - Try the clear chat function
   - Test minimize/maximize

2. **Explore Capabilities**
   - Ask about system statistics
   - Request workflow recommendations
   - Get task management advice

3. **Customize (Optional)**
   - Adjust colors to match your brand
   - Modify position or size
   - Update system prompt for specific needs

4. **Monitor Performance**
   - Check response times
   - Review server logs
   - Monitor API usage

## 📞 Need Help?

1. **Check Logs:**
   - Browser Console (F12)
   - Server Terminal Output
   - Network Tab in DevTools

2. **Verify Setup:**
   - `.env` file exists and is loaded
   - All npm packages installed
   - MongoDB connected
   - Admin user exists

3. **Review Documentation:**
   - See `ADMIN_CHATBOT.md` for detailed docs
   - Check inline code comments
   - Review Groq API documentation

## ✨ Features at a Glance

| Feature | Status |
|---------|--------|
| Real-time chat | ✅ Working |
| System context awareness | ✅ Working |
| Conversation history | ✅ Working |
| Clear chat | ✅ Working |
| Minimize/Maximize | ✅ Working |
| Mobile responsive | ✅ Working |
| Admin-only access | ✅ Working |
| Error handling | ✅ Working |
| Loading states | ✅ Working |
| Keyboard shortcuts | ✅ Working |

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Purple chat bubble appears in bottom-right
- ✅ Clicking opens chat window with welcome message
- ✅ Typing and sending returns AI responses
- ✅ System context is included in responses
- ✅ No errors in browser console or server logs

---

**Enjoy your new AI assistant! 🤖💬**

