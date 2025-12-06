# 🚀 Enhanced Salary Management - Quick Start

## What's New?

Your salary management dashboard now includes:

✅ **Live Attendance Integration** - Automatic hours calculation from daily attendance  
✅ **Biometric Data Upload** - Process Excel files with punch-in/out times  
✅ **30-Minute Allowance** - Automatic grace period for start/end times  
✅ **WFH Tracking** - Separate tracking for work-from-home vs office days  
✅ **Smart Reconciliation** - Combines biometric + manual check-ins  
✅ **Quality Reports** - Automatic data validation and discrepancy detection  

---

## 🎯 Quick Setup (2 Minutes)

### Step 1: Install Dependencies

```bash
cd server
npm install moment
```

### Step 2: Verify Routes

The routes are already integrated in `server/index.js`:
```javascript
app.use("/api/enhanced-salary", enhancedSalaryRoutes);
```

### Step 3: Start Application

```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm start
```

### Step 4: Access Dashboard

Navigate to: `http://localhost:5173/enhanced-salary-dashboard`

---

## 📊 How to Use (30 Seconds)

### For Admins:

1. **Select Month/Year** from dropdowns
2. **View Salary Dashboard** - See all employees automatically
3. **Upload Biometric Data** (optional) - Click "Upload Biometric" button
4. **Export Report** - Click "Export Report" for Excel file

That's it! The system automatically:
- ✅ Fetches live attendance from database
- ✅ Calculates working hours with 30-min allowance
- ✅ Tracks WFH vs Office days from AIM records
- ✅ Applies overtime rates (1.5x after 8 hours)
- ✅ Generates quality reports

---

## 📁 Biometric File Format

Create Excel with these columns:

| Employee ID | Name | Date | Punch In | Punch Out |
|------------|------|------|----------|-----------|
| EMP001 | John Doe | 2024-12-01 | 09:00 | 18:00 |
| EMP002 | Jane Smith | 2024-12-01 | 09:15 | 17:30 |

**Supported Formats:** .xlsx, .xls, .csv

---

## 🎨 Dashboard Overview

```
┌─────────────────────────────────────────────┐
│  Enhanced Salary Management                  │
│  [Dec ▼] [2024 ▼] [Upload] [Export]        │
└─────────────────────────────────────────────┘

Summary Cards:
├─ Total Payroll: $45,250
├─ Total Hours: 1,840
├─ WFH Days: 120
└─ Employees: 25 (3 need review)

Employee Table:
Name    | Dept | Present | WFH | Office | Hours | Salary
John    | Eng  |   22    | 10  |  12    | 176   | $4,400
Jane    | HR   |   20    |  8  |  12    | 160   | $4,000
```

---

## 💡 Key Features Explained

### 1. **30-Minute Allowance**
Automatically adds 30 minutes to both start and end times:
- Punch In: 09:05 AM → Adjusted: 08:35 AM
- Punch Out: 05:50 PM → Adjusted: 06:20 PM
- **Total: 9.75 hours** (instead of 8.75)

### 2. **Smart Reconciliation**
- Prefers biometric data (more accurate)
- Falls back to manual check-ins if no biometric
- Flags discrepancies > 1 hour difference

### 3. **WFH Tracking**
Automatically detects from AIM records:
- Checks `workLocationType: 'Home'`
- Tags attendance accordingly
- Shows separate WFH/Office stats

### 4. **Overtime Calculation**
- Regular: First 8 hours/day at base rate
- Overtime: Hours beyond 8 at 1.5x rate
- Example: 9 hours = 8 regular + 1 OT

---

## 🔗 API Endpoints

All endpoints require authentication token.

### Main Endpoints:
```
POST   /api/enhanced-salary/upload-biometric
GET    /api/enhanced-salary/dashboard/:year/:month
GET    /api/enhanced-salary/calculate/:userId/:year/:month
GET    /api/enhanced-salary/hours-breakdown/:userId/:year/:month
GET    /api/enhanced-salary/wfh-analysis/:userId/:year/:month
```

---

## 🐛 Troubleshooting

### Upload fails?
- ✓ Check file format (.xlsx, .xls, .csv)
- ✓ Verify Employee IDs exist in system
- ✓ Ensure columns match format above

### Hours seem wrong?
- ✓ 30-minute allowance adds to total hours (this is correct!)
- ✓ Check quality report for discrepancies
- ✓ Verify biometric times are valid

### WFH days not showing?
- ✓ Ensure AIM records exist for those dates
- ✓ Check `workLocationType` field is set
- ✓ Verify date ranges match

---

## 📂 New Files Created

### Backend:
- `server/services/workingHoursCalculator.js` - Core calculation logic
- `server/controllers/enhancedSalaryController.js` - API handlers
- `server/routes/enhancedSalary.js` - Route definitions

### Frontend:
- `client/src/pages/EnhancedSalaryDashboard.jsx` - Main UI
- `client/src/services/enhancedSalaryAPI.js` - API service

### Documentation:
- `ENHANCED_SALARY_MANAGEMENT_GUIDE.md` - Complete guide
- `ENHANCED_SALARY_QUICK_START.md` - This file

---

## ✨ Example Usage

### Calculate Single Employee:
```javascript
// GET /api/enhanced-salary/calculate/USER_ID/2024/12
Response: {
  summary: {
    daysPresent: 22,
    totalHoursWorked: 176,
    wfhDays: 10,
    officeDays: 12
  },
  totalSalaryEarned: 4400
}
```

### Upload Biometric:
```javascript
// POST /api/enhanced-salary/upload-biometric
// Body: FormData with file
Response: {
  processedCount: 150,
  errorCount: 2
}
```

---

## 🎓 Based On

Calculation logic inspired by [praj33/payroll-n8n](https://github.com/praj33/payroll-n8n):
- ✅ Smart time extraction
- ✅ Regular/overtime calculation
- ✅ Midnight crossing handling
- ✅ Data quality checks

Enhanced with:
- ✨ Live database integration
- ✨ Biometric reconciliation
- ✨ 30-minute allowance
- ✨ WFH tracking
- ✨ Real-time dashboard

---

## 🎉 You're Ready!

Navigate to `/enhanced-salary-dashboard` and start managing salaries with live attendance data!

**Need Help?** Check `ENHANCED_SALARY_MANAGEMENT_GUIDE.md` for detailed documentation.
