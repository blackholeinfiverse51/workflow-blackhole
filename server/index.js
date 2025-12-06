

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const socketIo = require("socket.io");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const userNotificationRoutes = require('./routes/user-notifications');
// const taskRoutes = require("./routes/tasks");
// const departmentRoutes = require("./routes/departments");
// const userRoutes = require("./routes/users");
// const authRoutes = require("./routes/auth");
// const aiRoutes = require("./routes/ai");
// const adminRoutes = require('./routes/admin');
// const dashboardRoutes = require('./routes/dashboard');
// const submissionRoutes = require('./routes/submission');
// const aiNewRoutes = require('./routes/aiRoutes');
// const progressRoutes = require('./routes/progress'); // Add this line
// const notificationRoutes = require('./routes/notifications'); // Add this line
// const aimRoutes = require('./routes/aims_unified');
// // const aiRoutePy = require('./routes/aiRoutePy')
// // Create Express app
// const app = express();

// // Create HTTP server and initialize Socket.IO
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: ['http://localhost:5173','http://192.168.1.2:5173','https://main-workflow.vercel.app'],  // Replace with your frontend's URL
//     methods: ['GET', 'POST'],
//     credentials: true,  // Allow credentials (cookies, HTTP authentication)
//   },
// });

// // CORS Configuration
// const corsOptions = {
//   origin: ['http://localhost:5173','http://192.168.1.2:5173','https://main-workflow.vercel.app'],  // Replace with your frontend's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,  // Allow credentials (cookies, HTTP authentication)
// };
// app.use(cors(corsOptions));

// app.use(express.json());

// // Connect to MongoDB
// require('dotenv').config();  // Add this line at the top

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));


// // Socket.IO connection
// io.on("connection", (socket) => {
//   console.log("New client connected");

//   socket.on("join", (rooms) => {
//     if (Array.isArray(rooms)) {
//       rooms.forEach((room) => socket.join(room));
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // Make io available to routes
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// app.get('/api/ping', (req, res) => {
//   res.json({ message: 'Pong!' });
// });


// // Serve static files from Vite build
// app.use(express.static(path.join(__dirname, '../client/dist')));

// // Serve frontend only for non-API routes
// app.get(/^\/(?!api).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });


// // Routes
// app.use("/api/tasks", taskRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/submissions", submissionRoutes);
// app.use('/api/new/ai', aiNewRoutes);
// app.use('/api/progress', progressRoutes); // Add this line
// app.use('/api/notifications', notificationRoutes); // Add this line
// app.use('/api/aims', aimRoutes);
// app.use('/api/user-notifications', userNotificationRoutes);

// // app.use('/api/new/ai',aiRoutePy)



// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Something went wrong!" });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path");
const userNotificationRoutes = require('./routes/user-notifications');
const taskRoutes = require("./routes/tasks");
const departmentRoutes = require("./routes/departments");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const submissionRoutes = require('./routes/submission');
const aiNewRoutes = require('./routes/aiRoutes');
const progressRoutes = require('./routes/progress'); // Add this line
const notificationRoutes = require('./routes/notifications'); // Add this line
const aimRoutes = require('./routes/aims_universal');
const pushRoutes = require('./routes/push'); // Add this line
const attendanceRoutes = require('./routes/attendance'); // New attendance routes
const leaveRoutes = require('./routes/leave'); // New leave routes
const enhancedSalaryRoutes = require('./routes/enhancedSalary'); // Enhanced salary with live attendance
const enhancedAimsRoutes = require('./routes/enhancedAims'); // Enhanced aims routes
const consentRoutes = require('./routes/consent'); // Consent routes
const alertRoutes = require('./routes/alerts'); // Alert routes
const emsRoutes = require('./routes/ems'); // EMS automation routes
const procurementRoutes = require('./routes/procurement'); // Procurement routes
const chatbotRoutes = require('./routes/chatbot'); // Admin chatbot routes
const biometricAttendanceRoutes = require('./routes/biometricAttendance'); // Biometric attendance and salary routes
const { startAttendancePersistenceCron, syncExistingAttendance } = require('./services/attendanceCronJobs'); // Attendance persistence cron
// const aiRoutePy = require('./routes/aiRoutePy')
// Create Express app
const app = express();

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        'https://blackhole-workflow.vercel.app',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);
      if (!origin || isLocalhost || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      'https://blackhole-workflow.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);
    if (!origin || isLocalhost || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^http:\/\/localhost:\d+$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Connect to MongoDB
require('dotenv').config();  // Add this line at the top

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Socket.IO connection
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join", (rooms) => {
    if (Array.isArray(rooms)) {
      rooms.forEach((room) => {
        socket.join(room);
        console.log(`👤 Socket ${socket.id} joined room: ${room}`);
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Pong!' });
});

// Test Linux browser detection endpoint
app.get('/api/test-browser-detection', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    console.log('🧪 Testing Linux browser detection...');

    const results = {};

    // Test if commands are installed
    try {
      await execAsync('which xdotool');
      results.xdotool = 'installed';
      console.log('✅ xdotool is installed');
    } catch (error) {
      results.xdotool = 'not installed: ' + error.message;
      console.log('❌ xdotool not installed:', error.message);
    }

    try {
      await execAsync('which wmctrl');
      results.wmctrl = 'installed';
      console.log('✅ wmctrl is installed');
    } catch (error) {
      results.wmctrl = 'not installed: ' + error.message;
      console.log('❌ wmctrl not installed:', error.message);
    }

    try {
      await execAsync('which scrot');
      results.scrot = 'installed';
      console.log('✅ scrot is installed');
    } catch (error) {
      results.scrot = 'not installed: ' + error.message;
      console.log('❌ scrot not installed:', error.message);
    }

    try {
      await execAsync('which convert');
      results.imagemagick = 'installed';
      console.log('✅ imagemagick is installed');
    } catch (error) {
      results.imagemagick = 'not installed: ' + error.message;
      console.log('❌ imagemagick not installed:', error.message);
    }

    // Test X11 environment
    try {
      const { stdout } = await execAsync('echo $DISPLAY');
      results.display = stdout.trim() || 'not set';
      console.log('🖥️ DISPLAY environment:', results.display);
    } catch (error) {
      results.display = 'error: ' + error.message;
    }

    res.json({
      success: true,
      platform: process.platform,
      commands: results,
      message: 'Linux command test completed'
    });

  } catch (error) {
    console.error('🧪 Command test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      platform: process.platform
    });
  }
});


// Serve static files from Vite build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve frontend only for non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/submissions", submissionRoutes);
app.use('/api/new/ai', aiNewRoutes);
app.use('/api/progress', progressRoutes); // Add this line
app.use('/api/notifications', notificationRoutes); // Add this line
app.use('/api/aims', aimRoutes);
app.use('/api/user-notifications', userNotificationRoutes);
app.use("/api/push", pushRoutes) // Added push routes use
app.use("/api/monitoring", require("./routes/monitoring")); // Employee monitoring routes
app.use("/api/attendance", attendanceRoutes); // Attendance management routes
app.use("/api/attendance-dashboard", require("./routes/attendanceDashboard")); // Live attendance dashboard routes
app.use("/api/leave", leaveRoutes); // Leave management routes
app.use("/api/enhanced-salary", enhancedSalaryRoutes); // Enhanced salary with live attendance and WFH tracking
app.use("/api/enhanced-aims", enhancedAimsRoutes); // Enhanced aims with progress routes
app.use('/api/consent', consentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ems', emsRoutes); // EMS automation routes
app.use('/api/procurement', procurementRoutes); // Procurement routes
app.use('/api/chatbot', chatbotRoutes); // Admin chatbot routes
app.use('/api/biometric-attendance', biometricAttendanceRoutes); // Biometric attendance and salary management routes

// app.use('/api/new/ai',aiRoutePy)



// Auto-end day background job
const Attendance = require('./models/Attendance');
const DailyAttendance = require('./models/DailyAttendance');

const autoEndDayJob = async () => {
  try {
    const AUTO_END_DAY_ENABLED = process.env.AUTO_END_DAY_ENABLED === 'true';
    const MAX_WORKING_HOURS = parseInt(process.env.MAX_WORKING_HOURS) || 8;

    if (!AUTO_END_DAY_ENABLED) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all attendance records that started today but haven't ended
    const activeAttendance = await Attendance.find({
      date: today,
      startDayTime: { $exists: true },
      endDayTime: { $exists: false }
    }).populate('user', 'name email');

    const currentTime = new Date();

    for (const record of activeAttendance) {
      const hoursWorked = (currentTime - record.startDayTime) / (1000 * 60 * 60);

      if (hoursWorked >= MAX_WORKING_HOURS) {
        // Auto end the day
        record.endDayTime = currentTime;
        record.employeeNotes = `Auto-ended after ${MAX_WORKING_HOURS} hours of work`;
        record.autoEnded = true;

        // Calculate hours worked
        const startTime = new Date(record.startDayTime);
        const endTime = currentTime;
        const timeDiff = endTime - startTime;
        const calculatedHours = Math.round((timeDiff / (1000 * 60 * 60)) * 100) / 100;
        record.hoursWorked = calculatedHours;

        await record.save();

        // Also update DailyAttendance for permanent storage
        await DailyAttendance.findOneAndUpdate(
          { user: record.user._id, date: today },
          {
            $set: {
              endDayTime: currentTime,
              hoursWorked: calculatedHours,
              status: 'present',
              autoEnded: true,
              employeeNotes: `Auto-ended after ${MAX_WORKING_HOURS} hours of work`
            }
          },
          { upsert: true, new: true }
        );

        console.log(`✅ Auto-ended day for user: ${record.user.name} after ${calculatedHours} hours`);

        // Emit socket event
        io.emit('attendance:auto-day-ended', {
          userId: record.user._id,
          userName: record.user.name,
          endTime: currentTime,
          hoursWorked: calculatedHours,
          reason: 'Exceeded maximum working hours'
        });
      }
    }
  } catch (error) {
    console.error('❌ Auto end day job error:', error);
  }
};

// Run auto-end day job every 30 minutes
setInterval(autoEndDayJob, 30 * 60 * 1000);

// Run on server start to catch any that should have already ended
autoEndDayJob();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auto-end day job: ${process.env.AUTO_END_DAY_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`Max working hours: ${process.env.MAX_WORKING_HOURS || 8} hours`);
  
  // Start attendance persistence cron job
  console.log('🕐 Starting attendance persistence cron job (runs daily at 11:59 PM)...');
  startAttendancePersistenceCron();
  
  // Sync existing attendance data for the last 30 days
  console.log('📊 Syncing historical attendance data for the last 30 days...');
  await syncExistingAttendance();
  console.log('✅ Server initialization complete');
});