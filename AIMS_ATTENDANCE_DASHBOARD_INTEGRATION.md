# AIMS-Integrated Attendance Dashboard

## Overview
The Live Attendance Dashboard now fully integrates with the AIMS (Attendance & Integrated Management System) to automatically track employee presence based on their daily AIMS submissions.

## ✅ How It Works

### **Automatic Presence Detection**
Employees are marked as **PRESENT** if either condition is met:
1. **They set their daily AIMS** (Daily work objectives)
2. **They start their workday** (Clock-in via attendance system)

Employees are marked as **ABSENT** if:
- They have NOT set their AIMS for the day
- AND they have NOT started their workday

### **Data Sources**
The system pulls data from:
- **AIMS Collection**: `Aim` model - Daily work objectives set by employees
- **Attendance Collection**: `DailyAttendance` model - Clock-in/out records
- **User Collection**: `User` model - Employee information with `stillExist: 1` (active employees only)

## 🎯 Features Implemented

### 1. **Summary Cards in Live View**
Three new cards display real-time statistics:
- **Present Employees**: Total count of employees marked present (via AIMS or clock-in)
- **Absent Employees**: Total count of employees who haven't checked in
- **Average Working Time**: Calculated average hours worked by all present employees

### 2. **Employee Name Filtering**
When admin selects a status filter:
- **Select "Present"**: Displays list of all present employee names
- **Select "Absent"**: Displays list of all absent employee names

Each employee card shows:
- Employee name
- Department
- Email
- **AIMS Badge**: 📋 AIMS indicator for employees present via AIMS
- **Start Time**: When they started their day

### 3. **AIMS Integration Banner**
- Appears when employees are present via AIMS
- Shows count of AIMS-based attendance
- Explains the integration to admins

## 📊 Backend Integration

### **Primary Endpoint**: `/attendance-dashboard/locations`
This endpoint is now used for all view modes to ensure consistent AIMS integration.

**Logic Flow**:
```javascript
// For each employee:
1. Check if AIMS exists for today (excluding default AIMS)
2. Check if attendance record exists with startDayTime
3. Mark as Present if (hasAIMS OR hasStartedDay)
4. Use AIMS submission time or attendance clock-in as start time
```

**Key Code Section** (server/routes/attendanceDashboard.js):
```javascript
// Determine presence status
const hasAim = !!aim;
const hasStartedDay = attendance && attendance.startDayTime;
const isPresent = hasAim || hasStartedDay;

// Priority: AIMS start time > Attendance start time
let startTime = null;
if (aim && aim.workSessionInfo && aim.workSessionInfo.startDayTime) {
  startTime = aim.workSessionInfo.startDayTime;
} else if (aim && aim.createdAt) {
  startTime = aim.createdAt; // AIMS submission time
} else if (attendance && attendance.startDayTime) {
  startTime = attendance.startDayTime;
}
```

### **Response Data Structure**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "userId": "...",
        "name": "John Doe",
        "status": "Present",
        "isPresent": true,
        "hasAim": true,
        "startTime": "2025-12-04T09:30:00Z",
        "hoursWorked": 8.5,
        "department": {...},
        "aimDetails": {
          "aims": "Complete project documentation",
          "completionStatus": "In Progress"
        }
      }
    ],
    "stats": {
      "total": 100,
      "present": 85,
      "absent": 15,
      "withAims": 60,
      "withoutAims": 25,
      "presentPercentage": 85,
      "absentPercentage": 15
    }
  }
}
```

## 🔧 Frontend Changes

### **File**: `client/src/pages/AttendanceDashboard.jsx`

#### Changes Made:
1. **Unified Endpoint Usage**
   - All view modes now use `/attendance-dashboard/locations`
   - Ensures AIMS integration across all views

2. **Summary Cards**
   - Calculate totals from complete `liveAttendance` array
   - Display accurate counts regardless of filters
   - Show average working time for present employees

3. **Employee List with AIMS Badges**
   - Visual indicator (📋 AIMS) for AIMS-based attendance
   - Shows start time for present employees
   - Color-coded cards (green for present, red for absent)

4. **AIMS Integration Banner**
   - Displays when `withAims > 0`
   - Informs admins about automatic presence tracking

## 📋 Testing Checklist

### To Verify AIMS Integration:
1. ✅ Have an employee set their daily AIMS
2. ✅ Check Live Dashboard - employee should show as "Present"
3. ✅ Click "Present" filter - employee name should appear
4. ✅ AIMS badge (📋) should be visible next to the name
5. ✅ Employee should NOT need to clock in separately

### To Verify Absence Tracking:
1. ✅ Employee with no AIMS and no clock-in should show as "Absent"
2. ✅ Click "Absent" filter - employee name should appear in red card

### To Verify Statistics:
1. ✅ Present count = (employees with AIMS) + (employees clocked in without AIMS)
2. ✅ Absent count = (total active employees) - (present count)
3. ✅ Average working time calculated only for present employees

## 🎨 UI/UX Features

### Visual Indicators:
- **Green Theme**: Present employees (cards, badges, borders)
- **Red Theme**: Absent employees (cards, badges, borders)
- **Blue Theme**: AIMS indicators and info banners
- **Hover Effects**: All cards have smooth hover animations
- **Responsive**: Grid layout adapts to screen size (1/2/3 columns)

### Accessibility:
- Clear color contrast for readability
- Dark mode support throughout
- Tooltips on AIMS badges
- Truncation prevents text overflow

## 🚀 Benefits

1. **Automatic Tracking**: No manual intervention needed
2. **Dual Source**: Captures attendance from both AIMS and clock-in
3. **Real-time Updates**: Dashboard refreshes every 30 seconds
4. **Accurate Reporting**: Combines multiple data sources
5. **Better Visibility**: Admins can see who set AIMS vs who clocked in

## 📌 Important Notes

- **Default AIMS Excluded**: AIMS with text "Daily work objectives - to be updated" are not counted
- **Active Employees Only**: Only employees with `stillExist: 1` are included
- **Date Range**: Uses local time zone for accurate daily ranges
- **Priority**: AIMS start time takes priority over attendance clock-in time

## 🔄 Future Enhancements

Potential improvements:
- Export employee list with AIMS status
- Filter by "AIMS Only" or "Clock-in Only"
- Show AIMS completion percentage in employee cards
- Notification for employees without AIMS or clock-in
- Historical trend of AIMS-based vs clock-in attendance

---

**Last Updated**: December 4, 2025
**Version**: 2.0
**Status**: ✅ Production Ready
