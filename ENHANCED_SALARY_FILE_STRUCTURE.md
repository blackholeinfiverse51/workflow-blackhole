# 📁 Enhanced Salary Management - File Structure

## New Files Created

```
workflow-blackhole-main/
│
├── server/
│   ├── services/
│   │   └── workingHoursCalculator.js          ← NEW ✨ Core calculation engine
│   │
│   ├── controllers/
│   │   └── enhancedSalaryController.js        ← NEW ✨ API handlers
│   │
│   ├── routes/
│   │   └── enhancedSalary.js                  ← NEW ✨ Route definitions
│   │
│   ├── uploads/
│   │   └── biometric/                          ← NEW ✨ Upload directory
│   │
│   └── index.js                                ← MODIFIED ⚡ Added routes
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── EnhancedSalaryDashboard.jsx    ← NEW ✨ Main UI component
│   │   │
│   │   └── services/
│   │       └── enhancedSalaryAPI.js           ← NEW ✨ API service
│   │
│   └── App.jsx                                 ← MODIFIED ⚡ Added route
│
└── Documentation/
    ├── ENHANCED_SALARY_MANAGEMENT_GUIDE.md    ← NEW 📚 Complete guide
    ├── ENHANCED_SALARY_QUICK_START.md         ← NEW 📚 Quick start
    ├── ENHANCED_SALARY_IMPLEMENTATION_SUMMARY.md ← NEW 📚 Tech summary
    ├── ENHANCED_SALARY_COMPLETE.md            ← NEW 📚 Overview
    └── ENHANCED_SALARY_FILE_STRUCTURE.md      ← NEW 📚 This file

```

## File Purposes

### Backend Services

#### `server/services/workingHoursCalculator.js`
**Purpose:** Core calculation engine  
**Lines:** 600+  
**Functions:**
- `calculateWorkingHours()` - Hours calculation with 30-min allowance
- `calculateSalary()` - Salary computation with overtime
- `processAttendanceRecord()` - Biometric + manual reconciliation
- `calculateMonthlyHours()` - Monthly aggregation with WFH tracking
- `generateQualityReport()` - Data validation and discrepancy detection

**Key Features:**
- ✅ 30-minute allowance on start/end times
- ✅ Regular hours (max 8/day) + Overtime (1.5x)
- ✅ Midnight crossing support for night shifts
- ✅ WFH detection from AIM records
- ✅ Quality checks and error detection

---

#### `server/controllers/enhancedSalaryController.js`
**Purpose:** API request handlers  
**Lines:** 500+  
**Endpoints:**
- `uploadBiometricData()` - POST /upload-biometric
- `getSalaryDashboard()` - GET /dashboard/:year/:month
- `calculateEmployeeSalary()` - GET /calculate/:userId/:year/:month
- `getHoursBreakdown()` - GET /hours-breakdown/:userId/:year/:month
- `getWFHAnalysis()` - GET /wfh-analysis/:userId/:year/:month

**Key Features:**
- ✅ Excel/CSV file parsing (xlsx library)
- ✅ Employee matching and validation
- ✅ Attendance record updates
- ✅ Dashboard data aggregation
- ✅ Error handling and logging

---

#### `server/routes/enhancedSalary.js`
**Purpose:** API route definitions  
**Lines:** 50+  
**Routes:**
```javascript
POST   /api/enhanced-salary/upload-biometric        (Admin only)
GET    /api/enhanced-salary/dashboard/:year/:month  (Admin only)
GET    /api/enhanced-salary/calculate/:userId/:year/:month
GET    /api/enhanced-salary/hours-breakdown/:userId/:year/:month
GET    /api/enhanced-salary/wfh-analysis/:userId/:year/:month
```

**Middleware:**
- ✅ `authenticateToken` - JWT validation
- ✅ `isAdmin` - Admin role check

---

### Frontend Components

#### `client/src/pages/EnhancedSalaryDashboard.jsx`
**Purpose:** Main dashboard UI  
**Lines:** 500+  
**Components:**
- Month/Year selectors
- Summary statistics cards
- Biometric upload button with progress
- Employee data table
- Export to Excel button
- Error/Success alerts

**State Management:**
```javascript
- selectedYear, selectedMonth
- dashboardData
- loading, error, success
- uploadProgress
```

**Key Features:**
- ✅ Real-time data fetching
- ✅ File upload with progress tracking
- ✅ Excel export (file-saver library)
- ✅ Responsive design (Tailwind CSS)
- ✅ Icons (Lucide React)

---

#### `client/src/services/enhancedSalaryAPI.js`
**Purpose:** API communication layer  
**Lines:** 100+  
**Methods:**
```javascript
- uploadBiometric(file, onProgress)
- getDashboard(year, month, filters)
- calculateEmployeeSalary(userId, year, month)
- getHoursBreakdown(userId, year, month)
- getWFHAnalysis(userId, year, month)
```

**Features:**
- ✅ Axios HTTP client
- ✅ JWT token handling
- ✅ Progress callbacks for uploads
- ✅ Error handling

---

### Documentation

#### `ENHANCED_SALARY_MANAGEMENT_GUIDE.md`
**Purpose:** Complete technical documentation  
**Lines:** 1000+  
**Contents:**
- Overview and features
- Architecture diagrams
- Data flow explanations
- Usage guide (admin & developer)
- Configuration options
- Calculation examples
- Data quality checks
- UI components
- Security & permissions
- Troubleshooting
- Complete API reference
- Deployment instructions
- Integration with payroll-n8n
- Best practices

---

#### `ENHANCED_SALARY_QUICK_START.md`
**Purpose:** Quick setup and usage guide  
**Lines:** 300+  
**Contents:**
- 2-minute setup instructions
- 30-second usage guide
- Biometric file format
- Dashboard overview
- Key features explained
- API endpoint summary
- Common troubleshooting
- Example usage

---

#### `ENHANCED_SALARY_IMPLEMENTATION_SUMMARY.md`
**Purpose:** Technical architecture and implementation details  
**Lines:** 600+  
**Contents:**
- Implementation summary
- File-by-file breakdown
- Technical architecture diagram
- Configuration parameters
- Data integration points
- Feature breakdown
- UI descriptions
- API integration examples
- Deployment checklist
- Testing checklist
- Success metrics

---

#### `ENHANCED_SALARY_COMPLETE.md`
**Purpose:** Executive summary and quick reference  
**Lines:** 400+  
**Contents:**
- Executive summary
- Requirements vs implementation
- Quick start (2 commands)
- Key features explained
- Dashboard overview
- API endpoints
- Integration with payroll-n8n
- Complete flow diagram
- Configuration
- Testing scenarios
- Common issues & solutions

---

## Dependencies

### Server (package.json)
```json
{
  "dependencies": {
    "moment": "^2.30.1",        ← NEW
    "multer": "existing",
    "xlsx": "existing",
    "mongoose": "existing"
  }
}
```

### Client (package.json)
```json
{
  "dependencies": {
    "file-saver": "^2.0.5",     ← NEW
    "xlsx": "^0.18.5",
    "axios": "existing",
    "react": "existing"
  }
}
```

---

## Routes Added

### Backend (server/index.js)
```javascript
// Added this line:
const enhancedSalaryRoutes = require('./routes/enhancedSalary');

// Added this line:
app.use("/api/enhanced-salary", enhancedSalaryRoutes);
```

### Frontend (client/src/App.jsx)
```javascript
// Added this import:
import EnhancedSalaryDashboard from "./pages/EnhancedSalaryDashboard";

// Added this route:
<Route
  path="/enhanced-salary-dashboard"
  element={
    <ProtectedRoute>
      <EnhancedSalaryDashboard />
    </ProtectedRoute>
  }
/>
```

---

## Database Collections Used

### Primary Collections:

#### `DailyAttendance`
```javascript
{
  user: ObjectId,
  date: Date,
  biometricTimeIn: Date,      // From Excel upload
  biometricTimeOut: Date,     // From Excel upload
  startDayTime: Date,         // Manual check-in
  endDayTime: Date,           // Manual check-out
  totalHoursWorked: Number,   // Calculated
  regularHours: Number,       // Calculated
  overtimeHours: Number,      // Calculated
  isPresent: Boolean,
  status: String
}
```

#### `Aim`
```javascript
{
  user: ObjectId,
  createdAt: Date,
  workSessionInfo: {
    workLocationType: String,  // "Home" or "Office"
    workLocationTag: String    // "WFH" or "Office"
  }
}
```

#### `User`
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  employeeId: String,
  salary: Number,         // Monthly salary
  hourlyRate: Number,     // Hourly rate
  department: String,
  tag: String            // "Employee", "Intern", etc.
}
```

---

## API Flow Diagram

```
CLIENT REQUEST
     ↓
[Enhanced Salary Dashboard]
     ↓
[enhancedSalaryAPI.js]
     ↓
HTTP Request with JWT
     ↓
[Express Server]
     ↓
[Auth Middleware] → Verify token
     ↓
[Enhanced Salary Routes]
     ↓
[Enhanced Salary Controller]
     ↓
[Working Hours Calculator] → Calculate
     ↓
[MongoDB Models]
  - DailyAttendance
  - AIM
  - User
     ↓
[Database Queries]
     ↓
[Response with Data]
     ↓
[Client State Update]
     ↓
[UI Render]
```

---

## Calculation Flow

```
1. Fetch DailyAttendance records
         ↓
2. For each record:
   a. Get biometric times (if available)
   b. Get manual check-in times (if available)
   c. Apply 30-minute allowance to both
         ↓
3. Calculate hours:
   - Regular: min(hours, 8)
   - Overtime: max(hours - 8, 0)
         ↓
4. Check AIM for WFH status
         ↓
5. Calculate salary:
   - Regular pay: regular_hours × hourly_rate
   - OT pay: ot_hours × hourly_rate × 1.5
         ↓
6. Generate quality report:
   - Check for missing data
   - Detect discrepancies
   - Flag issues
         ↓
7. Return complete data
```

---

## Upload Flow

```
1. User selects Excel file
         ↓
2. File uploaded to server
         ↓
3. Parse Excel (xlsx library)
         ↓
4. Extract columns:
   - Employee ID
   - Name
   - Date
   - Punch In
   - Punch Out
         ↓
5. For each row:
   a. Find user by Employee ID
   b. Parse date and times
   c. Find/Create DailyAttendance record
   d. Update biometric times
   e. Calculate hours (with 30-min allowance)
   f. Save record
         ↓
6. Return summary:
   - Processed count
   - Error count
   - Detailed records
         ↓
7. Delete uploaded file
```

---

## Quality Check Flow

```
1. Fetch all attendance records
         ↓
2. For each record, check:
   ✓ Has punch in/out times?
   ✓ Times are valid?
   ✓ Hours < 24?
   ✓ Biometric vs manual match?
         ↓
3. Categorize issues:
   - High severity (>2 hour difference)
   - Medium severity (1-2 hour difference)
   - Warnings (missing data)
         ↓
4. Generate report:
   {
     overallStatus: "good" | "review_recommended" | "needs_attention",
     issues: [...],
     warnings: [...],
     summary: {
       attendanceRate: 92,
       dataCompleteness: 100
     }
   }
```

---

## Testing Locations

### Unit Tests (Recommended)
```
server/tests/
  └── workingHoursCalculator.test.js
  └── enhancedSalaryController.test.js

client/tests/
  └── EnhancedSalaryDashboard.test.jsx
  └── enhancedSalaryAPI.test.js
```

### Integration Tests
```
server/tests/integration/
  └── salary-upload-flow.test.js
  └── salary-calculation-flow.test.js
```

---

## Environment Variables

### Server (.env)
```bash
MONGODB_URI=mongodb://...
PORT=5001
JWT_SECRET=your_secret_key
```

### Client (.env.local)
```bash
VITE_API_URL=http://localhost:5001
```

---

## Build & Deploy

### Development
```bash
# Terminal 1 - Server
cd server
npm install
npm start

# Terminal 2 - Client
cd client
npm install
npm start
```

### Production
```bash
# Build client
cd client
npm run build

# Start server
cd ../server
npm start
```

---

## Access Points

### Main Dashboard
```
URL: http://localhost:5173/enhanced-salary-dashboard
Auth: Required (JWT token)
Role: Admin recommended (some features admin-only)
```

### API Base
```
URL: http://localhost:5001/api/enhanced-salary
Auth: Required (x-auth-token header)
```

---

## File Sizes

```
workingHoursCalculator.js      ~600 lines  (~25 KB)
enhancedSalaryController.js    ~500 lines  (~22 KB)
enhancedSalary.js              ~50 lines   (~2 KB)
EnhancedSalaryDashboard.jsx    ~500 lines  (~20 KB)
enhancedSalaryAPI.js           ~100 lines  (~4 KB)

Documentation                  ~2500 lines (~100 KB)
```

---

## 🎉 Complete!

All files are properly organized and documented. Navigate through the structure using the paths above.

**Main Entry Point:** `/enhanced-salary-dashboard`

**Documentation:** Start with `ENHANCED_SALARY_COMPLETE.md` for overview
