const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const DailyAttendance = require('../models/DailyAttendance');
const Aim = require('../models/Aim');
const User = require('../models/User');
const Department = require('../models/Department');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// ========================================
// 1. GET LIVE ATTENDANCE WITH LOCATIONS AND AIMS
// ========================================
// Helper to build local day range from query date (handles YYYY-MM-DD safely)
function getDayRange(dateParam) {
  if (!dateParam) {
    const d = new Date();
    const start = new Date(d);
    start.setHours(0,0,0,0);
    const end = new Date(d);
    end.setHours(23,59,59,999);
    return { startOfDay: start, endOfDay: end, targetDate: d };
  }

  let targetDate;
  // If format is YYYY-MM-DD, construct using local time to avoid UTC shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [y,m,d] = dateParam.split('-').map(Number);
    targetDate = new Date(y, m - 1, d); // local midnight
  } else {
    targetDate = new Date(dateParam);
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23,59,59,999);
  return { startOfDay, endOfDay, targetDate };
}
router.get('/locations', auth, adminAuth, async (req, res) => {
  try {
    const { date, department } = req.query;
    const { startOfDay, endOfDay, targetDate } = getDayRange(date);

    // Build query
    let userQuery = { stillExist: 1 }; // Only active employees
    if (department && department !== 'all') {
      userQuery.department = department;
    }

    // Get all active users with department info
    const allUsers = await User.find(userQuery)
      .select('_id name email avatar department employeeId role')
      .populate('department', 'name color')
      .lean();

    // Fetch today's AIMS (exclude default aims)
    const aimsRecords = await Aim.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      user: { $in: allUsers.map(u => u._id) },
      aims: { $ne: 'Daily work objectives - to be updated' }
    })
      .populate('user', 'name email')
      .lean();

    // Fetch today's attendance with location data
    const attendanceRecords = await DailyAttendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      user: { $in: allUsers.map(u => u._id) }
    })
      .populate('user', 'name email avatar department employeeId role')
      .lean();

    // Create maps for quick lookup
    const attendanceMap = new Map();
    const aimsMap = new Map();
    
    attendanceRecords.forEach(record => {
      if (record.user && record.user._id) {
        attendanceMap.set(record.user._id.toString(), record);
      }
    });

    aimsRecords.forEach(aim => {
      if (aim.user && aim.user._id) {
        aimsMap.set(aim.user._id.toString(), aim);
      }
    });

    // Build complete list with locations and AIMS integration
    const liveAttendance = allUsers.map(user => {
      const userId = user._id.toString();
      const attendance = attendanceMap.get(userId);
      const aim = aimsMap.get(userId);
      
      // Determine presence status: Has AIMS OR has started day
      const hasAim = !!aim;
      const hasStartedDay = attendance && attendance.startDayTime;
      const isPresent = hasAim || hasStartedDay;
      
      // Use start time from AIMS if available, otherwise from attendance
      let startTime = null;
      if (aim && aim.workSessionInfo && aim.workSessionInfo.startDayTime) {
        startTime = aim.workSessionInfo.startDayTime;
      } else if (aim && aim.createdAt) {
        startTime = aim.createdAt; // Use AIMS submission time as start time
      } else if (attendance && attendance.startDayTime) {
        startTime = attendance.startDayTime;
      }

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department || { name: 'No Department', color: 'bg-gray-500' },
        status: isPresent ? 'Present' : 'Absent',
        workStatus: attendance?.endDayTime ? 'Offline' : (isPresent ? 'Working' : 'Offline'),
        startTime: startTime,
        endTime: attendance?.endDayTime,
        hoursWorked: attendance?.totalHoursWorked || 0,
        workLocationType: attendance?.workLocationType || 'Office',
        location: attendance?.startDayLocation ? {
          latitude: attendance.startDayLocation.latitude,
          longitude: attendance.startDayLocation.longitude,
          address: attendance.startDayLocation.address || 'Location tracked',
          accuracy: attendance.startDayLocation.accuracy
        } : null,
        isPresent: isPresent,
        hasLocation: !!attendance?.startDayLocation,
        hasAim: hasAim,
        aimDetails: aim ? {
          aims: aim.aims,
          completionStatus: aim.completionStatus,
          progressPercentage: aim.progressPercentage || 0,
          completionComment: aim.completionComment
        } : null
      };
    });

    // Calculate statistics
    const totalEmployees = liveAttendance.length;
    const working = liveAttendance.filter(e => e.workStatus === 'Working').length;
    const offline = liveAttendance.filter(e => e.workStatus === 'Offline').length;
    const present = liveAttendance.filter(e => e.isPresent).length;
    const absent = liveAttendance.filter(e => !e.isPresent).length;
    const withLocation = liveAttendance.filter(e => e.hasLocation).length;
    const withAims = liveAttendance.filter(e => e.hasAim).length;
    
    // Calculate total hours worked
    const totalHours = liveAttendance.reduce((sum, emp) => sum + (emp.hoursWorked || 0), 0);
    const avgHours = present > 0 ? Math.round((totalHours / present) * 100) / 100 : 0;

    console.log('📊 Attendance Stats:', {
      total: totalEmployees,
      present,
      absent,
      withAims,
      employeesCount: liveAttendance.length
    });

    res.json({
      success: true,
      data: {
        employees: liveAttendance,
        stats: {
          total: totalEmployees,
          working,
          offline,
          present,
          absent,
          withLocation,
          withAims,
          withoutAims: present - withAims,
          presentPercentage: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
          absentPercentage: totalEmployees > 0 ? Math.round((absent / totalEmployees) * 100) : 0,
          totalHoursWorked: totalHours,
          averageHoursWorked: avgHours,
          avgHours: avgHours,
          totalHours: totalHours
        },
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get live locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live locations',
      details: error.message
    });
  }
});

// ========================================
// 2. GET START-TIME SUMMARY WITH AIMS
// ========================================
router.get('/start-time-summary', auth, adminAuth, async (req, res) => {
  try {
    const { date, department } = req.query;
    const { startOfDay, endOfDay, targetDate } = getDayRange(date);

    // Build match condition for attendance
    const matchCondition = {
      date: { $gte: startOfDay, $lte: endOfDay },
      startDayTime: { $exists: true, $ne: null }
    };

    // Get all start-day records with user details
    let startDayRecords = await DailyAttendance.find(matchCondition)
      .populate({
        path: 'user',
        select: 'name email avatar department employeeId',
        populate: {
          path: 'department',
          select: 'name color'
        }
      })
      .sort({ startDayTime: 1 })
      .lean();

    // Get AIMS records for employees who haven't started day
    const aimsRecords = await Aim.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      aims: { $ne: 'Daily work objectives - to be updated' }
    })
      .populate({
        path: 'user',
        select: 'name email avatar department employeeId',
        populate: {
          path: 'department',
          select: 'name color'
        }
      })
      .lean();

    // Create a map of users who already started their day
    const startedUsers = new Set(startDayRecords.map(r => r.user?._id.toString()));

    // Add AIMS-only records (employees with AIMS but no start day)
    const aimsOnlyRecords = aimsRecords
      .filter(aim => aim.user && !startedUsers.has(aim.user._id.toString()))
      .map(aim => ({
        user: aim.user,
        startDayTime: aim.workSessionInfo?.startDayTime || aim.createdAt,
        workLocationType: aim.workLocation || 'Office',
        startDayLocation: { address: 'Via AIMS submission' },
        fromAims: true
      }));

    // Combine and sort all records
    const allRecords = [...startDayRecords, ...aimsOnlyRecords].sort((a, b) => 
      new Date(a.startDayTime) - new Date(b.startDayTime)
    );

    // Filter by department if specified
    let filteredRecords = allRecords;
    if (department && department !== 'all') {
      filteredRecords = allRecords.filter(record => 
        record.user && record.user.department && 
        record.user.department._id.toString() === department
      );
    }

    // Calculate statistics
    const totalStarted = filteredRecords.length;
    const earliestStart = filteredRecords.length > 0 ? filteredRecords[0].startDayTime : null;
    const latestStart = filteredRecords.length > 0 ? 
      filteredRecords[filteredRecords.length - 1].startDayTime : null;

    // Group by department
    const departmentSummary = {};
    filteredRecords.forEach(record => {
      if (record.user && record.user.department) {
        const deptName = record.user.department.name;
        if (!departmentSummary[deptName]) {
          departmentSummary[deptName] = {
            department: record.user.department,
            count: 0,
            employees: []
          };
        }
        departmentSummary[deptName].count++;
        departmentSummary[deptName].employees.push({
          name: record.user.name,
          startTime: record.startDayTime,
          workLocationType: record.workLocationType,
          source: record.fromAims ? 'AIMS' : 'Attendance'
        });
      }
    });

    // Group by hour
    const hourlyDistribution = {};
    filteredRecords.forEach(record => {
      const hour = new Date(record.startDayTime).getHours();
      const hourKey = `${hour}:00`;
      if (!hourlyDistribution[hourKey]) {
        hourlyDistribution[hourKey] = 0;
      }
      hourlyDistribution[hourKey]++;
    });

    // Format for table
    const tableData = filteredRecords.map(record => ({
      employeeId: record.user?.employeeId || 'N/A',
      name: record.user?.name || 'Unknown',
      department: record.user?.department?.name || 'No Department',
      departmentColor: record.user?.department?.color || 'bg-gray-500',
      startTime: record.startDayTime,
      workLocationType: record.workLocationType || 'Office',
      location: record.startDayLocation?.address || 'N/A',
      source: record.fromAims ? 'AIMS' : 'Start Day'
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalStarted,
          earliestStart,
          latestStart,
          avgStartTime: earliestStart && latestStart ? 
            new Date((new Date(earliestStart).getTime() + new Date(latestStart).getTime()) / 2) : null
        },
        byDepartment: Object.values(departmentSummary),
        byHour: hourlyDistribution,
        tableData,
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get start-time summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch start-time summary',
      details: error.message
    });
  }
});

// ========================================
// 3. GET ATTENDANCE TRACKING (PRESENT/ABSENT)
// ========================================
router.get('/attendance-tracking', auth, adminAuth, async (req, res) => {
  try {
    const { date, department, status } = req.query;
    const { startOfDay, endOfDay, targetDate } = getDayRange(date);

    // Get all active users
    let userQuery = { stillExist: 1 };
    if (department && department !== 'all') {
      userQuery.department = department;
    }

    const allUsers = await User.find(userQuery)
      .select('_id name email avatar department employeeId role')
      .populate('department', 'name color')
      .lean();

    // Fetch today's AIMS (exclude default aims)
    const aimsRecords = await Aim.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      user: { $in: allUsers.map(u => u._id) },
      aims: { $ne: 'Daily work objectives - to be updated' }
    }).lean();

    // Get attendance records
    const attendanceRecords = await DailyAttendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      user: { $in: allUsers.map(u => u._id) }
    }).lean();

    // Create maps for quick lookup
    const attendanceMap = new Map();
    const aimsMap = new Map();
    
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.user.toString(), record);
    });
    
    aimsRecords.forEach(aim => {
      aimsMap.set(aim.user.toString(), aim);
    });

    // Build attendance tracking data with AIMS integration
    let attendanceTracking = allUsers.map(user => {
      const userId = user._id.toString();
      const attendance = attendanceMap.get(userId);
      const aim = aimsMap.get(userId);
      
      // Determine presence: Has AIMS OR has started day
      const hasAim = !!aim;
      const hasStartedDay = attendance && attendance.startDayTime;
      const isPresent = hasAim || hasStartedDay;
      
      // Use start time from AIMS if available, otherwise from attendance
      let startTime = null;
      if (aim && aim.workSessionInfo && aim.workSessionInfo.startDayTime) {
        startTime = aim.workSessionInfo.startDayTime;
      } else if (aim && aim.createdAt) {
        startTime = aim.createdAt;
      } else if (attendance && attendance.startDayTime) {
        startTime = attendance.startDayTime;
      }
      
      const hoursWorked = attendance?.totalHoursWorked || 0;

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        employeeId: user.employeeId,
        department: user.department || { name: 'No Department', color: 'bg-gray-500' },
        status: isPresent ? 'Present' : 'Absent',
        isPresent,
        hasAim,
        startTime,
        endTime: attendance?.endDayTime,
        hoursWorked,
        workLocationType: attendance?.workLocationType,
        verificationMethod: attendance?.verificationMethod,
        location: attendance?.startDayLocation,
        hasLocation: !!attendance?.startDayLocation
      };
    });

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'present') {
        attendanceTracking = attendanceTracking.filter(e => e.isPresent);
      } else if (status === 'absent') {
        attendanceTracking = attendanceTracking.filter(e => !e.isPresent);
      }
    }

    // Calculate statistics
    const totalEmployees = allUsers.length;
    const presentCount = attendanceTracking.filter(e => e.isPresent).length;
    const absentCount = totalEmployees - presentCount;
    const presentPercentage = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
    const absentPercentage = 100 - presentPercentage;

    // Department-wise breakdown
    const departmentBreakdown = {};
    attendanceTracking.forEach(emp => {
      const deptName = emp.department.name;
      if (!departmentBreakdown[deptName]) {
        departmentBreakdown[deptName] = {
          department: emp.department,
          total: 0,
          present: 0,
          absent: 0
        };
      }
      departmentBreakdown[deptName].total++;
      if (emp.isPresent) {
        departmentBreakdown[deptName].present++;
      } else {
        departmentBreakdown[deptName].absent++;
      }
    });

    // Add percentages to department breakdown
    Object.values(departmentBreakdown).forEach(dept => {
      dept.presentPercentage = dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0;
      dept.absentPercentage = 100 - dept.presentPercentage;
    });

    console.log('📋 Attendance Tracking:', {
      total: totalEmployees,
      present: presentCount,
      absent: absentCount,
      status: status || 'all',
      returned: attendanceTracking.length
    });

    res.json({
      success: true,
      data: {
        employees: attendanceTracking,
        stats: {
          total: totalEmployees,
          present: presentCount,
          absent: absentCount,
          presentPercentage,
          absentPercentage
        },
        departmentBreakdown: Object.values(departmentBreakdown),
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get attendance tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance tracking',
      details: error.message
    });
  }
});

// ========================================
// 4. GET ALL DEPARTMENTS
// ========================================
router.get('/departments', auth, async (req, res) => {
  try {
    const departments = await Department.find()
      .select('_id name description color')
      .populate('lead', 'name email')
      .lean();

    res.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments',
      details: error.message
    });
  }
});

// ========================================
// 5. GET COMPREHENSIVE DASHBOARD DATA WITH AIMS
// ========================================
router.get('/dashboard-data', auth, adminAuth, async (req, res) => {
  try {
    const { date, department } = req.query;
    const { startOfDay, endOfDay, targetDate } = getDayRange(date);

    // Build user query
    let userQuery = { stillExist: 1 };
    if (department && department !== 'all') {
      userQuery.department = department;
    }

    // Get all users
    const allUsers = await User.find(userQuery)
      .select('_id name email avatar department employeeId role')
      .populate('department', 'name color')
      .lean();

    // Get AIMS records
    const aimsRecords = await Aim.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      user: { $in: allUsers.map(u => u._id) },
      aims: { $ne: 'Daily work objectives - to be updated' }
    }).lean();

    // Get attendance records
    const attendanceRecords = await DailyAttendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      user: { $in: allUsers.map(u => u._id) }
    }).lean();

    // Create maps
    const attendanceMap = new Map();
    const aimsMap = new Map();
    
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.user.toString(), record);
    });
    
    aimsRecords.forEach(aim => {
      aimsMap.set(aim.user.toString(), aim);
    });

    // Build comprehensive data with AIMS integration
    const employees = allUsers.map(user => {
      const userId = user._id.toString();
      const attendance = attendanceMap.get(userId);
      const aim = aimsMap.get(userId);
      
      // Determine presence: Has AIMS OR has started day
      const hasAim = !!aim;
      const hasStartedDay = attendance && attendance.startDayTime;
      const isPresent = hasAim || hasStartedDay || (attendance && attendance.isPresent);
      
      // Use start time from AIMS or attendance
      let startTime = null;
      if (aim && aim.workSessionInfo && aim.workSessionInfo.startDayTime) {
        startTime = aim.workSessionInfo.startDayTime;
      } else if (aim && aim.createdAt) {
        startTime = aim.createdAt;
      } else if (attendance && attendance.startDayTime) {
        startTime = attendance.startDayTime;
      }

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department || { name: 'No Department', color: 'bg-gray-500' },
        status: isPresent ? 'Present' : 'Absent',
        isPresent,
        startTime: startTime,
        endTime: attendance?.endDayTime,
        hoursWorked: attendance?.totalHoursWorked || 0,
        workLocationType: attendance?.workLocationType || 'Office',
        workStatus: attendance?.endDayTime ? 'Offline' : (isPresent ? 'Working' : 'Offline'),
        location: attendance?.startDayLocation ? {
          latitude: attendance.startDayLocation.latitude,
          longitude: attendance.startDayLocation.longitude,
          address: attendance.startDayLocation.address,
          accuracy: attendance.startDayLocation.accuracy
        } : null,
        hasLocation: !!(attendance?.startDayLocation),
        hasAim: hasAim,
        verificationMethod: attendance?.verificationMethod
      };
    });

    // Calculate comprehensive stats
    const totalEmployees = employees.length;
    const present = employees.filter(e => e.isPresent).length;
    const absent = totalEmployees - present;
    const working = employees.filter(e => e.workStatus === 'Working').length;
    const offline = employees.filter(e => e.workStatus === 'Offline').length;
    const withLocation = employees.filter(e => e.hasLocation).length;
    const withAims = employees.filter(e => e.hasAim).length;
    
    // Calculate total and average hours
    const totalHours = employees.reduce((sum, e) => sum + e.hoursWorked, 0);
    const avgHours = present > 0 ? Math.round((totalHours / present) * 100) / 100 : 0;

    // Get earliest and latest start times
    const startTimes = employees.filter(e => e.startTime).map(e => e.startTime);
    const earliestStart = startTimes.length > 0 ? new Date(Math.min(...startTimes.map(t => new Date(t)))) : null;
    const latestStart = startTimes.length > 0 ? new Date(Math.max(...startTimes.map(t => new Date(t)))) : null;

    // Department breakdown
    const departmentStats = {};
    employees.forEach(emp => {
      const deptName = emp.department.name;
      if (!departmentStats[deptName]) {
        departmentStats[deptName] = {
          department: emp.department,
          total: 0,
          present: 0,
          absent: 0,
          withAims: 0,
          totalHours: 0
        };
      }
      departmentStats[deptName].total++;
      if (emp.isPresent) {
        departmentStats[deptName].present++;
        departmentStats[deptName].totalHours += emp.hoursWorked;
      } else {
        departmentStats[deptName].absent++;
      }
      if (emp.hasAim) {
        departmentStats[deptName].withAims++;
      }
    });

    // Calculate average hours per department
    Object.values(departmentStats).forEach(deptStat => {
      deptStat.avgHours = deptStat.present > 0 
        ? Math.round((deptStat.totalHours / deptStat.present) * 100) / 100 
        : 0;
      deptStat.presentPercentage = deptStat.total > 0 
        ? Math.round((deptStat.present / deptStat.total) * 100) 
        : 0;
    });

    res.json({
      success: true,
      data: {
        employees,
        stats: {
          total: totalEmployees,
          present,
          absent,
          working,
          offline,
          withLocation,
          withAims,
          withoutAims: present - withAims,
          presentPercentage: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
          absentPercentage: totalEmployees > 0 ? Math.round((absent / totalEmployees) * 100) : 0,
          totalHoursWorked: Math.round(totalHours * 100) / 100,
          averageHoursWorked: avgHours,
          earliestStart,
          latestStart
        },
        departmentStats: Object.values(departmentStats),
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

// ========================================
// 6. EXPORT START-TIME DATA AS CSV
// ========================================
router.get('/export/start-times', auth, adminAuth, async (req, res) => {
  try {
    const { date, department } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const matchCondition = {
      date: { $gte: startOfDay, $lte: endOfDay },
      startDayTime: { $exists: true, $ne: null }
    };

    let records = await DailyAttendance.find(matchCondition)
      .populate({
        path: 'user',
        select: 'name email employeeId department',
        populate: { path: 'department', select: 'name' }
      })
      .sort({ startDayTime: 1 })
      .lean();

    // Filter by department if specified
    if (department && department !== 'all') {
      records = records.filter(r => 
        r.user && r.user.department && 
        r.user.department._id.toString() === department
      );
    }

    // Generate CSV content
    const csvHeader = 'Employee ID,Name,Email,Department,Start Time,Work Location,Address\n';
    const csvRows = records.map(record => {
      const emp = record.user;
      const startTime = new Date(record.startDayTime).toLocaleString();
      const dept = emp?.department?.name || 'No Department';
      const location = record.workLocationType || 'Office';
      const address = record.startDayLocation?.address || 'N/A';
      
      return `"${emp?.employeeId || 'N/A'}","${emp?.name || 'Unknown'}","${emp?.email || 'N/A'}","${dept}","${startTime}","${location}","${address}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=start-times-${targetDate.toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Export start-times error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export start-time data',
      details: error.message
    });
  }
});

module.exports = router;
 
// ========================================
// 7. GET AVERAGE WORKING HOURS FOR A USER OVER RANGE
// ========================================
router.get('/user-average', auth, adminAuth, async (req, res) => {
  try {
    const { userId, from, to } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const startDate = from ? new Date(from) : new Date();
    const endDate = to ? new Date(to) : new Date();

    // Normalize to cover full days
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);

    // Fetch DailyAttendance records for the range
    const records = await DailyAttendance.find({
      user: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
      totalHoursWorked: { $exists: true }
    }).lean();

    const daysCount = records.length;
    const totalHours = records.reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0);
    const averageHours = daysCount > 0 ? Math.round((totalHours / daysCount) * 100) / 100 : 0;

    const userInfo = await User.findById(userId).select('name email employeeId department').populate('department','name color').lean();

    return res.json({
      success: true,
      data: {
        user: userInfo || { _id: userId },
        from: startDate,
        to: endDate,
        daysCount,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHours
      }
    });
  } catch (error) {
    console.error('Get user average hours error:', error);
    res.status(500).json({ success: false, error: 'Failed to compute average hours', details: error.message });
  }
});
 
