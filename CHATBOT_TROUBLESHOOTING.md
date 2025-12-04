# 🔧 Chatbot Connection Issue - FIXED

## ❌ Problem
Error message: **"I apologize, but I'm having trouble connecting right now. Please try again in a moment."**

## ✅ Root Cause
The **GROQ_API_KEY** or **XAI_API_KEY** is not configured in your `server/.env` file.

---

## 🔑 Solution: Add Your Grok API Key

### Option 1: Using Text Editor

1. Open `server/.env` file
2. Add this line:
```env
GROQ_API_KEY=your_actual_grok_api_key_here
```
**OR** if you're using X.AI:
```env
XAI_API_KEY=your_xai_api_key_here
```

3. Save the file
4. Restart the backend server

### Option 2: Quick Command

```powershell
# Navigate to server directory
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\server

# Add the API key (replace with your actual key)
Add-Content .env "`nGROQ_API_KEY=your_actual_api_key_here"

# Restart the server
# Press Ctrl+C in the server terminal, then run:
npm start
```

---

## 🎯 How to Get Your API Key

### For Grok API (Groq):
1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### For X.AI API:
1. Go to https://x.ai
2. Sign up for API access
3. Get your API key from the dashboard
4. Copy the key

---

## 🔄 After Adding the Key

### Step 1: Restart Backend Server
Go to the terminal running the backend (terminal 18) and:
```
Press Ctrl+C to stop
Then run: npm start
```

### Step 2: Test the Chatbot
1. Refresh your browser (F5)
2. Open the chatbot (click the brain icon 🧠)
3. Send a test message like "Hello"
4. You should get an AI response!

---

## 🧪 Testing Checklist

- [ ] Backend server running (check terminal 18)
- [ ] Frontend running on http://localhost:5173
- [ ] `.env` file has GROQ_API_KEY or XAI_API_KEY
- [ ] Backend restarted after adding key
- [ ] Browser refreshed
- [ ] Chatbot opens successfully
- [ ] AI responds to messages

---

## 📋 Your `.env` File Should Look Like:

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# Email (optional - causing those errors but not critical)
EMAIL_USER=your_email
EMAIL_PASS=your_password

# AI/Chatbot (REQUIRED for chatbot)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
# OR
XAI_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxx

# Optional: Choose model
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## ⚠️ Common Mistakes

1. **Wrong Key Name**: Use `GROQ_API_KEY` not `GROK_API_KEY`
2. **Spaces**: No spaces around the `=`
   - ❌ `GROQ_API_KEY = key` 
   - ✅ `GROQ_API_KEY=key`
3. **Quotes**: No quotes needed
   - ❌ `GROQ_API_KEY="key"`
   - ✅ `GROQ_API_KEY=key`
4. **Not Restarting**: Server MUST be restarted after adding key

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ No error message in chatbot
- ✅ AI responds to your messages
- ✅ Server logs show: "✅ Groq AI service initialized successfully"
- ✅ Conversation flows naturally

---

## 🆘 Still Not Working?

### Check Server Logs
Look in terminal 18 for:
- ❌ "GROQ_API_KEY not found" - Key not set
- ❌ "Invalid API key" - Wrong key
- ✅ "Groq AI service initialized" - Working!

### Check Browser Console
Press F12 and look for:
- Network errors (red)
- 403 errors (permission)
- 500 errors (server issue)

### Verify API Key
Test your key directly:
```powershell
curl https://api.groq.com/openai/v1/models `
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 📞 Quick Fix Summary

```powershell
# 1. Add API key to server/.env
echo GROQ_API_KEY=your_key >> server/.env

# 2. Restart server
cd server
# Ctrl+C then:
npm start

# 3. Refresh browser
# Press F5

# 4. Test chatbot
# Click brain icon and send message
```

---

**That's it! Your chatbot should now be working! 🎉🧠💬**

