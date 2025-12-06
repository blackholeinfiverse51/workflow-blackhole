# Enhanced Salary Management Dashboard - Complete Guide

## 🎯 Overview

The Enhanced Salary Management Dashboard integrates **live attendance records**, **biometric data uploads**, and **Work From Home (WFH) tracking** to provide accurate salary calculations with automatic working hours computation and a 30-minute allowance for start/end times.

---

## ✨ Key Features

### 1. **Live Attendance Integration**
- Automatically fetches attendance data from `DailyAttendance` collection
- Integrates both manual check-ins (Start Day/End Day) and biometric data
- Real-time calculation of working hours

### 2. **Biometric Data Upload**
- Upload Excel/CSV files with employee punch-in/punch-out times
- Supports multiple file formats (.xlsx, .xls, .csv)
- Automatic reconciliation with existing attendance records

### 3. **30-Minute Allowance**
- **Start of Day**: Automatically grants 30 minutes before recorded start time
- **End of Day**: Automatically grants 30 minutes after recorded end time
- Accounts for biometric sync delays and grace periods

### 4. **WFH vs Office Tracking**
- Automatically identifies WFH days from AIM records
- Tracks office vs remote work patterns
- Provides comparative analytics

### 5. **Working Hours Calculation**
- **Regular Hours**: Up to 8 hours per day
- **Overtime**: Hours beyond 8 per day (at 1.5x rate)
- **Midnight Crossing**: Handles night shifts correctly
- **Data Quality Checks**: Flags suspicious or incomplete data

### 6. **Intelligent Data Reconciliation**
- Prefers biometric data (more reliable)
- Validates against manual check-ins
- Flags discrepancies for review

---

## 🏗️ Architecture

### Backend Components

#### 1. **Working Hours Calculator** (`server/services/workingHoursCalculator.js`)
```javascript
// Key Methods:
- calculateWorkingHours(startTime, endTime, applyAllowance)
- calculateMonthlySalary(monthlyHours, salaryInfo)
- processAttendanceRecord(attendanceRecord)
- calculateMonthlyHours(userId, year, month)
- generateQualityReport(monthlyHours)
```

**Features:**
- Time parsing with multiple format support
- Automatic 30-minute allowance application
- Overtime calculation (1.5x multiplier)
- Discrepancy detection
- Quality reporting

#### 2. **Enhanced Salary Controller** (`server/controllers/enhancedSalaryController.js`)
```javascript
// API Endpoints:
POST   /api/enhanced-salary/upload-biometric
GET    /api/enhanced-salary/dashboard/:year/:month
GET    /api/enhanced-salary/calculate/:userId/:year/:month
GET    /api/enhanced-salary/hours-breakdown/:userId/:year/:month
GET    /api/enhanced-salary/wfh-analysis/:userId/:year/:month
```

#### 3. **Routes** (`server/routes/enhancedSalary.js`)
- Authentication required for all endpoints
- Admin-only access for dashboard and uploads

### Frontend Components

#### 1. **Enhanced Salary Dashboard** (`client/src/pages/EnhancedSalaryDashboard.jsx`)
- Main dashboard interface
- Biometric file upload
- Monthly salary overview
- Employee breakdown table

#### 2. **API Service** (`client/src/services/enhancedSalaryAPI.js`)
- Centralized API communication
- File upload with progress tracking

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. BIOMETRIC DATA UPLOAD                                   │
│  User uploads Excel → Parse → Match employees → Update DB   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. ATTENDANCE RECONCILIATION                               │
│  Biometric + Manual Check-ins → Apply 30min allowance      │
│  → Detect discrepancies → Calculate hours                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. WFH TRACKING                                            │
│  Query AIM records → Identify WFH days → Tag attendance     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. WORKING HOURS CALCULATION                               │
│  For each day: Regular Hours (max 8) + Overtime (>8)       │
│  → Apply hourly/monthly rates → Calculate salary            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. QUALITY REPORT                                          │
│  Check data completeness → Flag discrepancies → Status      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Usage Guide

### For Administrators

#### **1. Upload Biometric Data**

**Step 1:** Prepare Excel file with columns:
```
| Employee ID | Name | Date | Punch In | Punch Out |
|------------|------|------|----------|-----------|
| EMP001     | John | 2024-12-01 | 09:00 | 18:00 |
| EMP002     | Jane | 2024-12-01 | 09:15 | 17:30 |
```

**Supported Column Names:**
- Employee ID: `Employee ID`, `EmployeeID`, `empId`, `ID`
- Name: `Name`, `Employee Name`, `EmployeeName`
- Date: `Date`, `date`, `Attendance Date`
- Punch In: `Punch In`, `PunchIn`, `In Time`, `Check In`
- Punch Out: `Punch Out`, `PunchOut`, `Out Time`, `Check Out`

**Step 2:** Navigate to Enhanced Salary Dashboard
```
URL: /enhanced-salary-dashboard
```

**Step 3:** Click "Upload Biometric" button and select file

**Step 4:** Wait for processing (progress bar shows status)

**Step 5:** Review processed records and errors (if any)

#### **2. View Salary Dashboard**

**Select Period:**
- Choose month and year from dropdowns
- Dashboard automatically refreshes

**Summary Cards Display:**
- **Total Payroll**: Sum of all employee salaries
- **Total Hours**: Aggregate working hours
- **WFH Days**: Total work-from-home days
- **Employees**: Count with review status

**Employee Table Shows:**
- Name and email
- Department and type
- Days present/absent
- WFH vs Office breakdown
- Total hours (regular + OT)
- Calculated salary
- Status (OK or needs review)

#### **3. Export Reports**

**Click "Export Report" button**
- Generates Excel file with complete data
- Filename: `salary-report-YYYY-MM.xlsx`
- Includes all employee details and calculations

### For Developers

#### **Calculate Salary for Single Employee**

```javascript
import enhancedSalaryAPI from './services/enhancedSalaryAPI';

const calculateSalary = async (userId, year, month) => {
  try {
    const result = await enhancedSalaryAPI.calculateEmployeeSalary(
      userId, 
      year, 
      month
    );
    
    console.log('Salary:', result.data.totalSalaryEarned);
    console.log('Hours:', result.data.summary);
    console.log('Quality:', result.data.qualityReport);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### **Get Hours Breakdown**

```javascript
const getBreakdown = async (userId, year, month) => {
  const result = await enhancedSalaryAPI.getHoursBreakdown(
    userId, 
    year, 
    month
  );
  
  result.data.dailyBreakdown.forEach(day => {
    console.log(`${day.date}: ${day.totalHours} hours (${day.workLocation})`);
  });
};
```

#### **Get WFH Analysis**

```javascript
const getWFHStats = async (userId, year, month) => {
  const result = await enhancedSalaryAPI.getWFHAnalysis(
    userId, 
    year, 
    month
  );
  
  console.log('WFH Days:', result.data.wfh.totalDays);
  console.log('Office Days:', result.data.office.totalDays);
  console.log('WFH Avg Hours:', result.data.wfh.averageHours);
  console.log('Office Avg Hours:', result.data.office.averageHours);
};
```

---

## 🔧 Configuration

### Working Hours Calculator Settings

Located in `server/services/workingHoursCalculator.js`:

```javascript
this.OVERTIME_MULTIPLIER = 1.5;           // Overtime rate
this.MAX_REGULAR_HOURS_PER_DAY = 8;       // Regular hours threshold
this.DAYS_IN_MONTH = 31;                  // For monthly calculations
this.START_DAY_ALLOWANCE_MINUTES = 30;    // Start allowance
this.END_DAY_ALLOWANCE_MINUTES = 30;      // End allowance
this.BIOMETRIC_GRACE_PERIOD = 15;         // Sync tolerance
```

### User Salary Information

Set in User model:
```javascript
{
  salary: 5000,        // Monthly salary
  hourlyRate: 25,      // Hourly rate (optional)
  dailyRate: 161.29    // Daily rate (optional)
}
```

---

## 📈 Calculation Examples

### Example 1: Regular Day with Allowance

**Biometric Data:**
- Punch In: 09:05 AM
- Punch Out: 05:50 PM

**With 30-minute allowance:**
- Adjusted In: 08:35 AM (09:05 - 30 min)
- Adjusted Out: 06:20 PM (05:50 + 30 min)
- **Total Hours: 9.75 hours**
- **Regular: 8 hours**
- **Overtime: 1.75 hours**

**Salary Calculation:**
- Hourly Rate: $25/hour
- Overtime Rate: $37.50/hour (1.5x)
- Regular Earnings: 8 × $25 = $200
- Overtime Earnings: 1.75 × $37.50 = $65.63
- **Total: $265.63**

### Example 2: Night Shift (Midnight Crossing)

**Biometric Data:**
- Punch In: 10:00 PM
- Punch Out: 06:00 AM (next day)

**Calculation:**
- Handles midnight crossing automatically
- Total Hours: 8 hours
- Regular: 8 hours, Overtime: 0

### Example 3: WFH Day

**Data Sources:**
- AIM record shows `workLocationType: 'Home'`
- Manual check-in: 09:00 AM
- Manual check-out: 06:00 PM

**Result:**
- Tagged as WFH day
- Hours: 9 hours (8 regular + 1 OT)
- Included in WFH statistics

---

## 🚨 Data Quality Checks

### Issue Detection

#### **1. Missing Data**
```
Status: needs_review
Note: "missing_checkout"
Action: Manual verification required
```

#### **2. Time Discrepancies**
```
Biometric: 09:00 - 18:00 (9 hours)
Manual: 09:30 - 17:30 (8 hours)
Difference: 1 hour
Severity: Medium
Action: Review both sources
```

#### **3. Suspicious Hours**
```
Total Hours: 26 hours
Note: "worked_over_24h"
Status: Invalid
Action: Check data entry
```

#### **4. Low Attendance**
```
Attendance Rate: 65%
Warning: Below 80% threshold
Action: Review absences
```

---

## 🎨 UI Components

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Enhanced Salary Management                              │
│  [Month ▼] [Year ▼] [Upload Biometric] [Export Report] │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Payroll│  Total Hours │   WFH Days   │   Employees  │
│   $45,250    │    1,840     │     120      │      25      │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────┐
│  Employee Salary Breakdown                               │
├─────────────────────────────────────────────────────────┤
│ Name    │ Dept │ Present│ WFH │ Office│ Hours│ Salary   │
│ John    │ Eng  │   22   │ 10  │  12   │ 176  │ $4,400  │
│ Jane    │ HR   │   20   │  8  │  12   │ 160  │ $4,000  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security & Permissions

### API Access Control

- **All Endpoints**: Require authentication token
- **Dashboard & Upload**: Admin role only
- **Individual Calculations**: User can view own data

### Data Privacy

- Employee salary data encrypted at rest
- API uses HTTPS in production
- File uploads cleaned up after processing

---

## 🐛 Troubleshooting

### Common Issues

#### **Issue: Biometric upload fails**
**Solution:**
1. Check file format (must be .xlsx, .xls, or .csv)
2. Verify column names match supported formats
3. Ensure Employee IDs exist in system
4. Check file size (max 10MB)

#### **Issue: Hours calculation seems incorrect**
**Solution:**
1. Verify biometric times are in correct format
2. Check if 30-minute allowance is applied
3. Review attendance record for discrepancies
4. Check quality report for warnings

#### **Issue: WFH days not showing**
**Solution:**
1. Ensure AIM records exist for those dates
2. Verify `workLocationType` is set to 'Home'
3. Check date ranges match

#### **Issue: Discrepancies flagged**
**Solution:**
1. Review both biometric and manual times
2. Check if employee used different devices
3. Verify clock synchronization
4. Approve or correct as needed

---

## 📚 API Reference

### POST /api/enhanced-salary/upload-biometric

Upload biometric attendance data file.

**Headers:**
```
x-auth-token: <JWT token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <Excel/CSV file>
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric data uploaded successfully",
  "data": {
    "processedCount": 150,
    "errorCount": 2,
    "records": [...],
    "errors": [...]
  }
}
```

### GET /api/enhanced-salary/dashboard/:year/:month

Get salary dashboard for all employees.

**Parameters:**
- `year`: Year (e.g., 2024)
- `month`: Month (1-12)

**Query Params (optional):**
- `department`: Filter by department
- `tag`: Filter by employee type

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "year": 2024,
      "month": 12,
      "monthName": "December"
    },
    "stats": {
      "totalEmployees": 25,
      "totalSalary": 45250,
      "totalHours": 1840,
      "totalWFHDays": 120,
      "totalOfficeDays": 430,
      "averageSalary": 1810,
      "averageHours": 73.6,
      "employeesNeedingReview": 3
    },
    "employees": [...]
  }
}
```

### GET /api/enhanced-salary/calculate/:userId/:year/:month

Calculate salary for specific employee.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "period": {...},
    "summary": {
      "daysPresent": 22,
      "daysAbsent": 2,
      "wfhDays": 10,
      "officeDays": 12,
      "totalHoursWorked": 176,
      "totalRegularHours": 168,
      "totalOvertimeHours": 8,
      "averageHoursPerDay": 8
    },
    "salary": {
      "hourlyRate": 25,
      "overtimeRate": 37.5,
      "totalEarnings": 4400
    },
    "dailyBreakdown": [...],
    "qualityReport": {...}
  }
}
```

---

## 🚀 Deployment

### Environment Variables

```bash
# Server .env
MONGODB_URI=mongodb://...
PORT=5001
JWT_SECRET=your_secret_key

# Client .env.local
VITE_API_URL=http://localhost:5001
```

### Production Setup

1. **Create uploads directory:**
```bash
mkdir -p server/uploads/biometric
chmod 755 server/uploads/biometric
```

2. **Install dependencies:**
```bash
cd server && npm install moment
cd ../client && npm install xlsx file-saver
```

3. **Build frontend:**
```bash
cd client && npm run build
```

4. **Start server:**
```bash
cd server && npm start
```

---

## 📝 Integration with Payroll-n8n

This implementation is based on the payroll calculation logic from [praj33/payroll-n8n](https://github.com/praj33/payroll-n8n) with enhancements:

✅ **Adopted from payroll-n8n:**
- Time parsing with multiple format support
- Regular hours (8/day) and overtime (1.5x) calculation
- Midnight crossing handling
- Data quality indicators

✨ **Enhanced Features:**
- Live attendance record integration
- Biometric + manual check-in reconciliation
- 30-minute allowance for biometric sync delays
- WFH vs Office tracking
- MongoDB integration
- Real-time dashboard

---

## 🎓 Best Practices

### For Accurate Calculations

1. **Upload biometric data regularly** (weekly or bi-weekly)
2. **Review discrepancies promptly** when flagged
3. **Verify employee hourly rates** are up-to-date
4. **Check quality reports** before finalizing payroll
5. **Export reports monthly** for records

### For System Maintenance

1. **Clean up old attendance records** periodically
2. **Monitor upload directory size**
3. **Review API logs** for errors
4. **Update employee information** when changed
5. **Backup database** before bulk operations

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API error messages
3. Check server logs for detailed errors
4. Verify database connections

---

## 🎉 Success!

Your Enhanced Salary Management Dashboard is now ready to:
- ✅ Calculate salaries from live attendance
- ✅ Upload and process biometric data
- ✅ Track WFH vs Office days
- ✅ Apply 30-minute allowances automatically
- ✅ Generate quality reports
- ✅ Export comprehensive salary reports

Navigate to `/enhanced-salary-dashboard` to get started!
