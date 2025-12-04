# ✅ FIXED - Admin Chatbot Startup Guide

## 🔧 Issues Resolved

✅ **Port 5000 conflict** - Cleared  
✅ **Wrong directory navigation** - Fixed  
✅ **Dependencies** - Installed  

---

## 🚀 OPTION 1: Automated Startup (EASIEST)

### From Project Root Directory:
```powershell
# Navigate to project root first
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2

# Run the automated script
.\START_SERVERS.ps1
```

**OR** double-click `START_SERVERS.ps1` in File Explorer

---

## 🚀 OPTION 2: Use Batch File (Windows)

### From Project Root Directory:
```cmd
# Navigate to project root first
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2

# Run the batch file
START_CHATBOT.bat
```

**OR** double-click `START_CHATBOT.bat` in File Explorer

---

## 🚀 OPTION 3: Manual Commands (2 Terminals)

### Terminal 1 - Backend Server:
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\server
npm start
```

### Terminal 2 - Frontend Client:
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\client
npm run dev
```

---

## 📍 Current Situation

You are currently here:
```
C:\Users\Microsoft\Desktop\Complete-Infiverse-2\server
```

To fix your current terminal:

### If you want to start backend (you're already in server):
```powershell
npm start
```

### If you want to start frontend:
```powershell
cd ..\client
npm run dev
```

---

## 🎯 What Happens Next

1. **Backend starts** on http://localhost:5000
   - Look for: "Connected to MongoDB"
   - Look for: "✅ Groq AI service initialized successfully"

2. **Frontend starts** on http://localhost:5173
   - Browser should auto-open
   - Login as Admin
   - Go to Admin Dashboard
   - See purple chat bubble in bottom-right

---

## ⚠️ Troubleshooting

### If Port 5000 is Still in Use:

**Find the process:**
```powershell
Get-Process -Name node | Select-Object Id, ProcessName
```

**Kill all Node processes:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

**Then try starting again**

### If Dependencies Missing:

**Backend:**
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\server
npm install groq-sdk
```

**Frontend:**
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\client
npm install @radix-ui/react-scroll-area
```

### If GROQ_API_KEY Error:

Check `server\.env` file has:
```env
GROQ_API_KEY=your_api_key_here
```

---

## 📊 Quick Test Commands

### Test if backend is running:
```powershell
curl http://localhost:5000/api/ping
```

### Test if frontend is accessible:
```
Open browser: http://localhost:5173
```

### Test chatbot API (after login):
```powershell
# Get your JWT token from browser (F12 -> Application -> Local Storage)
# Then test:
curl http://localhost:5000/api/chatbot/status -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login as Admin
- [ ] Can see Admin Dashboard
- [ ] Purple chat bubble visible
- [ ] Chatbot opens and responds

---

## 📝 Files Created for Easy Startup

1. **START_SERVERS.ps1** - PowerShell automation script
2. **START_CHATBOT.bat** - Windows batch file
3. **This guide** - Step-by-step instructions

---

## 💡 Pro Tips

1. **Always start from project root** for scripts
2. **Check logs** in each terminal window
3. **Wait 5 seconds** after backend starts before testing
4. **Close old terminals** before restarting
5. **Use Ctrl+C** to stop servers gracefully

---

## 🆘 Still Having Issues?

1. Close ALL terminal windows
2. Open ONE new PowerShell terminal
3. Run:
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2
.\START_SERVERS.ps1
```

If that doesn't work, run Option 3 (Manual Commands) in separate terminals.

---

**Everything is ready to go! 🚀**

