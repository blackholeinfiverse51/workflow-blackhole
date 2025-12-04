# 🔍 Broadcast Alerts Debugging Guide

## Issue: Alerts not appearing on user side

This guide will help you debug why alerts are not showing up for users.

---

## 🧪 Step-by-Step Debugging

### Step 1: Check Admin Side (Broadcast)

1. **Open Admin Dashboard**
2. **Open Browser Console** (F12)
3. **Click "Broadcast Reminders" button**
4. **Check console for:**
   ```
   ✅ Should see: Success toast with alert count
   ```

5. **Check Server Logs** for:
   ```
   📢 Alert emitted to user 674a1b2c...
   ```

**Expected Output:**
```
📢 Alert emitted to user 674a1b2c3d4e5f6g7h8i9j0l: {
  _id: '...',
  title: '⚠️ Task Completion Reminder',
  description: 'You have 2 incomplete tasks...',
  severity: 'medium',
  alert_type: 'productivity_drop',
  timestamp: '2025-11-28T...',
  status: 'active',
  employee: '674a1b2c3d4e5f6g7h8i9j0l'
}
```

---

### Step 2: Check User Side (Socket Connection)

1. **Login as a user** (who has incomplete tasks)
2. **Open Browser Console** (F12)
3. **Check for socket connection:**

**Expected Console Output:**
```
✅ Socket connected: abc123xyz
👤 Joined rooms: user_674a1b2c..., department_...
```

**If you see:**
```
❌ Socket disconnected
🔌 Socket connection error
```
→ **Problem**: Socket.io not connecting properly

---

### Step 3: Check Socket Room Joining

**In Server Logs**, look for:
```
✅ New client connected: abc123xyz
👤 Socket abc123xyz joined room: user_674a1b2c3d4e5f6g7h8i9j0l
👤 Socket abc123xyz joined room: department_...
```

**Important**: The `user_` room ID must match the user's MongoDB `_id`

---

### Step 4: Check Alert Reception

**In User's Browser Console**, after admin broadcasts:
```
🚨 Monitoring alert event: {
  _id: '...',
  title: '⚠️ Task Completion Reminder',
  description: 'You have 2 incomplete tasks...',
  severity: 'medium',
  ...
}
```

**If you DON'T see this:**
→ **Problem**: Alert not being received via socket

---

### Step 5: Check Alert State

**In User's Browser Console**, type:
```javascript
// Check if alerts are in state
console.log('Monitoring Alerts:', window.__SOCKET_ALERTS__)
```

Or add this temporarily to `Alerts.jsx`:
```javascript
console.log('Current monitoringAlerts:', monitoringAlerts)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Socket Not Connecting

**Symptoms:**
- Console shows: `Socket connection error`
- No socket connected message

**Solutions:**
1. Check if server is running
2. Verify `VITE_API_URL` in `.env` file
3. Check CORS settings in `server/index.js`
4. Restart both client and server

**Test:**
```bash
# In browser console
window.location.origin
# Should match server URL
```

---

### Issue 2: Wrong User ID

**Symptoms:**
- Server emits to `user_674a1b2c...`
- But user joined room `user_undefined` or different ID

**Solutions:**
1. Check user object in browser:
   ```javascript
   JSON.parse(localStorage.getItem('WorkflowUser'))
   ```
2. Verify `user.id` matches MongoDB `_id`
3. Check if user is logged in properly

**Fix in socket-context.jsx:**
```javascript
// Make sure user.id is correct
socketInstance.emit('join', [`user_${user.id}`, `department_${user.department}`]);
```

---

### Issue 3: Alert Not Emitted

**Symptoms:**
- Admin sees success message
- But server logs show no "Alert emitted" messages

**Solutions:**
1. Check if `req.io` is available:
   ```javascript
   console.log('io available:', !!io)
   ```
2. Verify middleware in `server/index.js`:
   ```javascript
   app.use((req, res, next) => {
     req.io = io;
     next();
   });
   ```
3. Check if alerts were created in database

---

### Issue 4: Alert Structure Mismatch

**Symptoms:**
- Alert received but not displayed
- Console shows alert data but UI doesn't update

**Solutions:**
1. Check alert structure in `socket-context.jsx`:
   ```javascript
   { type: 'new-alert', data: {...}, timestamp: ... }
   ```
2. Verify `Alerts.jsx` accesses `alert.data._id` correctly
3. Check if `monitoringAlerts` array is updating

**Debug in Alerts.jsx:**
```javascript
console.log('monitoringAlerts:', monitoringAlerts)
console.log('unreadCount:', unreadCount)
```

---

### Issue 5: Tasks Not Found

**Symptoms:**
- Admin sees: "No tasks due today or overdue"
- But tasks exist in database

**Solutions:**
1. Check task `dueDate` - must be today or earlier
2. Check task `status` - must NOT be "completed"
3. Check task `assignee` - must be populated

**Test Query:**
```javascript
// In MongoDB or server console
Task.find({
  dueDate: { $lte: new Date() },
  status: { $ne: "completed" }
}).populate("assignee")
```

---

## 🧪 Manual Testing Script

### Test 1: Create Test Task
```javascript
// In MongoDB or via API
{
  title: "Test Task for Alerts",
  assignee: "USER_ID_HERE", // Use actual user MongoDB _id
  dueDate: new Date(), // Today
  status: "pending",
  priority: "high"
}
```

### Test 2: Check User ID
```javascript
// In user's browser console
const user = JSON.parse(localStorage.getItem('WorkflowUser'))
console.log('User ID:', user.id)
console.log('User Email:', user.email)
```

### Test 3: Manually Emit Alert
```javascript
// In server console or route
io.to('user_674a1b2c3d4e5f6g7h8i9j0l').emit('monitoring-alert', {
  _id: 'test123',
  title: 'Test Alert',
  description: 'This is a test',
  severity: 'low',
  alert_type: 'productivity_drop',
  timestamp: new Date(),
  status: 'active'
})
```

### Test 4: Check Socket Rooms
```javascript
// In server console
io.sockets.adapter.rooms.forEach((value, key) => {
  console.log('Room:', key, 'Sockets:', value)
})
```

---

## 📊 Expected Flow

```
1. Admin clicks "Broadcast Reminders"
   ↓
2. Server finds incomplete tasks
   ✅ Check: Tasks found with assignees
   ↓
3. Server creates MonitoringAlert in DB
   ✅ Check: Alert created with correct employee ID
   ↓
4. Server emits socket event: io.to(`user_${userId}`)
   ✅ Check: Server logs show "Alert emitted to user..."
   ↓
5. User's socket receives event
   ✅ Check: Browser console shows "Monitoring alert event"
   ↓
6. socket-context.jsx adds to monitoringAlerts array
   ✅ Check: Array updates in React DevTools
   ↓
7. Alerts.jsx displays alert
   ✅ Check: Badge appears on AlertTriangle icon
   ↓
8. User clicks icon and sees alert
   ✅ Success!
```

---

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop servers
Ctrl+C (in both terminals)

# Clear node_modules cache (if needed)
npm cache clean --force

# Restart backend
cd server
npm start

# Restart frontend (new terminal)
cd client
npm run dev
```

### Fix 2: Check Environment Variables
```bash
# client/.env
VITE_API_URL=http://localhost:3000/api

# server/.env
PORT=3000
MONGODB_URI=mongodb://...
```

### Fix 3: Verify Socket.io Version
```bash
# Should be compatible versions
npm list socket.io
npm list socket.io-client
```

### Fix 4: Add Debug Logging

**In server/routes/notifications.js:**
```javascript
console.log('📊 Broadcasting to users:', Array.from(userAlerts.keys()))
console.log('🔌 io available:', !!io)
```

**In client/src/context/socket-context.jsx:**
```javascript
console.log('👤 User joining rooms:', [`user_${user.id}`, `department_${user.department}`])
```

**In client/src/components/notifications/Alerts.jsx:**
```javascript
console.log('📢 Current alerts:', monitoringAlerts)
console.log('🔢 Unread count:', unreadCount)
```

---

## ✅ Verification Checklist

- [ ] Server is running on correct port
- [ ] Client is running and connecting to server
- [ ] Socket.io connection established (check console)
- [ ] User joined correct room (check server logs)
- [ ] Tasks exist with correct criteria (dueDate, status, assignee)
- [ ] Admin can broadcast successfully
- [ ] Server logs show "Alert emitted to user..."
- [ ] User's console shows "Monitoring alert event"
- [ ] Alert appears in monitoringAlerts array
- [ ] Badge appears on AlertTriangle icon
- [ ] Clicking icon shows alert in popover

---

## 📞 Still Not Working?

1. **Check Database:**
   ```javascript
   // Verify alert was created
   db.monitoring_alerts.find().sort({timestamp: -1}).limit(1)
   ```

2. **Check Network Tab:**
   - Look for WebSocket connection
   - Should show "101 Switching Protocols"
   - Check for socket.io messages

3. **Check React DevTools:**
   - Find SocketProvider component
   - Check monitoringAlerts state
   - Verify it's updating when alert is received

4. **Enable Verbose Logging:**
   ```javascript
   // In socket-context.jsx
   const socketInstance = io(socketUrl, {
     transports: ['websocket', 'polling'],
     timeout: 20000,
     forceNew: true,
     debug: true // Add this
   });
   ```

---

## 🎯 Success Indicators

When everything works correctly, you should see:

**Server Console:**
```
✅ New client connected: abc123xyz
👤 Socket abc123xyz joined room: user_674a1b2c3d4e5f6g7h8i9j0l
📢 Alert emitted to user 674a1b2c3d4e5f6g7h8i9j0l
```

**User Browser Console:**
```
✅ Socket connected: abc123xyz
🚨 Monitoring alert event: { _id: '...', title: '⚠️ Task Completion Reminder', ... }
```

**User UI:**
```
🔺 with badge (1) ← Alert appears!
```

---

**Good luck debugging!** 🚀

