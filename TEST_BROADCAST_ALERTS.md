# 🧪 Test Broadcast Alerts - Quick Guide

## Problem: Alerts sent by admin but not appearing for users

Follow these steps to diagnose and fix the issue:

---

## ✅ Step 1: Check Server Logs

When admin clicks "Broadcast Reminders", you should see:

```
📢 Alert emitted to user 674a1b2c3d4e5f6g7h8i9j0l: {
  _id: '...',
  title: '⚠️ Task Completion Reminder',
  ...
}
```

**If you DON'T see this:**
- Check if tasks were found
- Check if `req.io` is available
- Look for error messages

---

## ✅ Step 2: Check User's Browser Console

When user is logged in, you should see:

```
✅ Socket connected: abc123xyz
```

When admin broadcasts, you should see:

```
🚨 Monitoring alert event: { _id: '...', title: '⚠️ Task Completion Reminder', ... }
```

**If you DON'T see "Socket connected":**
- User's socket.io is not connecting
- Check network tab for WebSocket connection
- Verify VITE_API_URL in client/.env

**If you DON'T see "Monitoring alert event":**
- User is not receiving the socket event
- Check if user joined the correct room
- Verify user ID matches

---

## ✅ Step 3: Verify User ID Matches

**In User's Browser Console:**
```javascript
const user = JSON.parse(localStorage.getItem('WorkflowUser'))
console.log('User ID:', user.id)
```

**In Server Logs (when user connects):**
```
👤 Socket abc123xyz joined room: user_674a1b2c3d4e5f6g7h8i9j0l
                                        ↑
                                   This should match user.id
```

**In Server Logs (when admin broadcasts):**
```
📢 Alert emitted to user 674a1b2c3d4e5f6g7h8i9j0l
                            ↑
                       This should match user.id
```

**If IDs don't match:**
- User is joining wrong room
- Alert is being sent to wrong room
- They will never meet!

---

## ✅ Step 4: Check Task Assignment

Make sure the task is assigned to the correct user:

**In MongoDB:**
```javascript
db.tasks.findOne({ title: "Test Task" })

// Check:
// - assignee: Should be user's MongoDB _id (ObjectId)
// - dueDate: Should be today or earlier
// - status: Should NOT be "completed"
```

**Create a test task:**
```javascript
db.tasks.insertOne({
  title: "Test Task for Alerts",
  assignee: ObjectId("674a1b2c3d4e5f6g7h8i9j0l"), // Use actual user _id
  dueDate: new Date(),
  status: "pending",
  priority: "high",
  description: "Test task",
  department: ObjectId("...") // User's department
})
```

---

## ✅ Step 5: Test Socket Emission Manually

**In server console or add to route:**
```javascript
// Test if socket emission works
const testUserId = '674a1b2c3d4e5f6g7h8i9j0l' // Replace with actual user ID

io.to(`user_${testUserId}`).emit('monitoring-alert', {
  _id: 'test123',
  title: '🧪 Test Alert',
  description: 'If you see this, socket emission works!',
  severity: 'low',
  alert_type: 'productivity_drop',
  timestamp: new Date(),
  status: 'active',
  employee: testUserId
})

console.log(`🧪 Test alert sent to user_${testUserId}`)
```

**If user receives this test alert:**
- ✅ Socket emission works
- ✅ User is in correct room
- ❌ Problem is in the broadcast-reminders endpoint

**If user does NOT receive this test alert:**
- ❌ Socket emission not working
- ❌ User not in correct room
- ❌ Socket.io connection issue

---

## ✅ Step 6: Add Debug Logging

**Add to server/routes/notifications.js (line ~225):**
```javascript
console.log('🔌 io available:', !!io)
console.log('📊 Users to notify:', Array.from(userAlerts.keys()))
```

**Add to server/routes/notifications.js (line ~273):**
```javascript
console.log(`🎯 Emitting to room: user_${userId}`)
console.log(`📦 Alert data:`, alertData)
```

**Add to client/src/context/socket-context.jsx (line ~44):**
```javascript
console.log('🎯 Joining rooms:', [`user_${user.id}`, `department_${user.department}`])
console.log('👤 User object:', user)
```

**Add to client/src/components/notifications/Alerts.jsx (line ~13):**
```javascript
console.log('📊 Current monitoringAlerts:', monitoringAlerts)
console.log('🔢 Unread count:', unreadCount)
```

---

## ✅ Step 7: Check Socket Rooms on Server

**Add to server/index.js (after socket connection):**
```javascript
// Add this after line 204
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join", (rooms) => {
    if (Array.isArray(rooms)) {
      rooms.forEach((room) => {
        socket.join(room);
        console.log(`👤 Socket ${socket.id} joined room: ${room}`);
      });
      
      // Show all rooms this socket is in
      console.log(`📋 Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
    }
  });
  
  // ... rest of code
});
```

---

## 🎯 Expected Output (When Working)

### Server Console:
```
✅ New client connected: abc123xyz
👤 Socket abc123xyz joined room: user_674a1b2c3d4e5f6g7h8i9j0l
👤 Socket abc123xyz joined room: department_507f1f77bcf86cd799439011
📋 Socket abc123xyz is now in rooms: Set { 'abc123xyz', 'user_674a1b2c3d4e5f6g7h8i9j0l', 'department_507f1f77bcf86cd799439011' }

[Admin broadcasts]

🔌 io available: true
📊 Users to notify: [ '674a1b2c3d4e5f6g7h8i9j0l' ]
🎯 Emitting to room: user_674a1b2c3d4e5f6g7h8i9j0l
📦 Alert data: { _id: '...', title: '⚠️ Task Completion Reminder', ... }
📢 Alert emitted to user 674a1b2c3d4e5f6g7h8i9j0l
```

### User Browser Console:
```
✅ Socket connected: abc123xyz
🎯 Joining rooms: ['user_674a1b2c3d4e5f6g7h8i9j0l', 'department_507f1f77bcf86cd799439011']
👤 User object: { id: '674a1b2c3d4e5f6g7h8i9j0l', email: 'user@example.com', ... }

[Admin broadcasts]

🚨 Monitoring alert event: { _id: '...', title: '⚠️ Task Completion Reminder', ... }
📊 Current monitoringAlerts: [{ type: 'new-alert', data: {...}, timestamp: ... }]
🔢 Unread count: 1
```

### User UI:
```
🔺 (1) ← Badge appears!
```

---

## 🐛 Common Issues

### Issue: "io available: false"
**Solution:** Check middleware in server/index.js:
```javascript
app.use((req, res, next) => {
  req.io = io;
  next();
});
```

### Issue: User ID mismatch
**Solution:** Make sure user.id in frontend matches MongoDB _id:
```javascript
// In auth-context.jsx or wherever user is set
const user = {
  id: userData._id.toString(), // Convert ObjectId to string
  ...
}
```

### Issue: Socket not connecting
**Solution:** Check CORS and socket.io configuration:
```javascript
// server/index.js
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### Issue: Alert received but not displayed
**Solution:** Check alert structure in Alerts.jsx:
- Should access `alert.data._id`, not `alert._id`
- Should access `alert.data.title`, not `alert.title`

---

## ✅ Quick Fix Checklist

1. [ ] Server is running
2. [ ] Client is running
3. [ ] User is logged in
4. [ ] Socket connected (check console)
5. [ ] User joined correct room (check server logs)
6. [ ] Task exists with correct assignee
7. [ ] Task dueDate is today or earlier
8. [ ] Task status is NOT "completed"
9. [ ] Admin broadcasts successfully
10. [ ] Server emits alert (check logs)
11. [ ] User receives alert (check console)
12. [ ] Badge appears on AlertTriangle icon

---

## 🚀 If All Else Fails

**Restart everything:**
```bash
# Stop all servers
Ctrl+C

# Clear caches
cd server && npm cache clean --force
cd ../client && npm cache clean --force

# Reinstall dependencies (if needed)
cd server && npm install
cd ../client && npm install

# Start fresh
cd server && npm start
# In new terminal
cd client && npm run dev
```

**Check versions:**
```bash
node --version  # Should be v14+
npm --version   # Should be v6+
```

**Check ports:**
```bash
# Make sure ports are not in use
netstat -ano | findstr :3000  # Server port
netstat -ano | findstr :5173  # Client port
```

---

## 📞 Need More Help?

See: `BROADCAST_ALERTS_DEBUGGING.md` for detailed debugging guide

**Good luck!** 🎉

