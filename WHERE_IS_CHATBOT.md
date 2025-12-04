# 🔍 Where to Find the Admin Chatbot

## ⚠️ IMPORTANT: The chatbot is ONLY visible in these conditions:

1. ✅ You must be logged in as **Admin** (not Manager or User)
2. ✅ You must be on the **Admin Dashboard** page
3. ✅ Look in the **bottom-right corner** of the screen

---

## 📍 Step-by-Step Guide to See the Chatbot:

### Step 1: Open the Application
```
http://localhost:5173
```

### Step 2: Login as Admin
- Use your Admin credentials
- NOT Manager or User role

### Step 3: Navigate to Admin Dashboard
Click on one of these:
- **"Admin"** in the sidebar menu
- **"Admin Dashboard"** link
- Or go directly to: `http://localhost:5173/admin-dashboard`

### Step 4: Look in Bottom-Right Corner
You should see a **purple circular chat bubble** with a message icon.

---

## 🎨 What the Chatbot Looks Like:

### When Closed:
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                        🟣       │  <- Purple circle with 
│                                 │     chat icon (bottom-right)
└─────────────────────────────────┘
```

### When Open:
```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────┐       │
│   │ 🤖 AI Assistant    X│       │
│   ├─────────────────────┤       │
│   │ 👋 Hello! I'm your │       │
│   │ AI assistant...     │       │
│   │                     │       │
│   │ [Type message...]   │       │
│   └─────────────────────┘       │
└─────────────────────────────────┘
```

---

## ❌ Why You Might NOT See It:

### Reason 1: Wrong Page
**Problem:** You're not on the Admin Dashboard  
**Solution:** Navigate to `/admin-dashboard`

### Reason 2: Wrong User Role
**Problem:** You're logged in as User or Manager  
**Solution:** Login as Admin

### Reason 3: Component Not Loaded
**Problem:** JavaScript error or component failed to load  
**Solution:** 
- Press F12 to open DevTools
- Check Console for errors
- Look for red error messages

### Reason 4: CSS/Display Issue
**Problem:** Element is hidden or not positioned correctly  
**Solution:**
- Try refreshing the page (Ctrl+R)
- Clear browser cache
- Try a different browser

---

## 🧪 Test if Chatbot is Working:

### Test 1: Check Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for any errors related to "chatbot" or "admin-chatbot"

### Test 2: Check Network
1. Press **F12** to open DevTools
2. Go to **Network** tab
3. Look for API calls to `/api/chatbot/`

### Test 3: Direct Component Test
Open browser console and type:
```javascript
console.log(document.querySelector('.fixed.bottom-6.right-6'))
```
If it returns `null`, the component isn't rendering.

---

## 🔧 Quick Fix Commands:

### If Frontend Won't Load:
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\client
npm run dev
```

### If You See Errors:
```powershell
cd C:\Users\Microsoft\Desktop\Complete-Infiverse-2\client
npm install --force
npm run dev
```

---

## 📸 Visual Checklist:

When you're on the correct page, you should see:
- [ ] "Admin Dashboard" in the page title
- [ ] Department cards/statistics
- [ ] User management section
- [ ] **Purple chat bubble in bottom-right** ← THIS IS THE CHATBOT

---

## 🎯 Exact URL to Visit:

```
http://localhost:5173/admin-dashboard
```

Make sure you're logged in as Admin first!

---

## 💡 Pro Tip:

If you still don't see it, take a screenshot of your screen and check:
1. Are you on the Admin Dashboard?
2. Can you see the sidebar with "Admin" option?
3. Is your user role "Admin" in the profile?

---

## 🆘 Still Not Seeing It?

Try these in order:

1. **Hard Refresh:** Ctrl + Shift + R
2. **Clear Cache:** Ctrl + Shift + Delete
3. **Different Browser:** Try Chrome/Edge/Firefox
4. **Check User Role:** 
   ```
   - Click your profile
   - Verify role shows "Admin"
   ```

---

## ✅ Success Indicators:

You'll know it's working when you see:
- 🟣 Purple circular button in bottom-right
- Hover effect when you move mouse over it
- Click opens a chat window
- Welcome message from AI assistant

---

**The chatbot IS there - you just need to be on the right page! 🎯**

