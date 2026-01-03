const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const DailyAttendance = require('../models/DailyAttendance');
const Aim = require('../models/Aim');
const User = require('../models/User');

// ============================================
// DAILY ATTENDANCE DATA PERSISTENCE SERVICE
// ============================================
// This service ensures attendance data is permanently stored at end of day

/**
 * Auto-end active work sessions and persist data to DailyAttendance
 * Runs at 11:59 PM every day
 */
function startAttendancePersistenceCron() {
  // Run at 11:59 PM every day
  cron.schedule('59 23 * * *', async () => {
    console.log('🔄 [CRON] Starting end-of-day attendance persistence...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find all attendance records from today
      const todayAttendance = await Attendance.find({
        date: { $gte: today, $lt: tomorrow }
      }).populate('user', 'name email department');

      // Get all AIMS from today
      const todayAims = await Aim.find({
        date: { $gte: today, $lt: tomorrow }
      });

      const aimMap = new Map();
      todayAims.forEach(aim => {
        aimMap.set(aim.user.toString(), aim);
      });

      let persistedCount = 0;
      let autoEndedCount = 0;

      for (const attendance of todayAttendance) {
        if (!attendance.user) continue;
        
        const userId = attendance.user._id;
        const aim = aimMap.get(userId.toString());
        
        // Calculate hours worked (but don't auto-end - let user manually end)
        const now = new Date();
        let endTime = attendance.endDayTime;
        let hoursWorked = attendance.hoursWorked || 0;
        
        // Only calculate hours if day is already ended by user
        // If not ended, calculate up to current time for reporting purposes only
        if (!endTime && attendance.startDayTime) {
          // Calculate hours worked up to now (for reporting) but don't auto-end
          hoursWorked = (now - attendance.startDayTime) / (1000 * 60 * 60);
          // Keep endTime as null - user must manually end day
          // attendance.endDayTime = null; // Explicitly keep as null
          // attendance.hoursWorked = Math.round(hoursWorked * 100) / 100; // Update for reporting
          // Don't save - let it continue running
          // await attendance.save(); // REMOVED - don't auto-end
          
          // Don't increment autoEndedCount - we're not auto-ending anymore
          // autoEndedCount++; // REMOVED
          console.log(`ℹ️ User ${attendance.user.name} has active work day (${Math.round(hoursWorked * 100) / 100}h) - waiting for manual end`);
        } else if (endTime && attendance.startDayTime) {
          // Day already ended by user - calculate final hours
          hoursWorked = (endTime - attendance.startDayTime) / (1000 * 60 * 60);
        }

        // Create or update DailyAttendance record
        let dailyRecord = await DailyAttendance.findOne({
          user: userId,
          date: { $gte: today, $lt: tomorrow }
        });

        if (!dailyRecord) {
          // Create new daily record
          dailyRecord = new DailyAttendance({
            user: userId,
            date: today,
            startDayTime: attendance.startDayTime,
            endDayTime: endTime,
            totalHoursWorked: hoursWorked,
            workLocationType: attendance.workLocationType || 'Office',
            startDayLocation: attendance.startDayLocation,
            endDayLocation: attendance.endDayLocation,
            isPresent: !!attendance.startDayTime,
            status: attendance.startDayTime ? 'Present' : 'Absent',
            verificationMethod: attendance.verificationMethod || 'manual',
            dailyProgressCompleted: !!attendance.progressSubmitted,
            dailyAimCompleted: aim ? (aim.completionStatus !== 'Pending') : false,
            aimCompletionStatus: aim?.completionStatus || 'Not Set',
            aimCompletionComment: aim?.completionComment || '',
            autoEnded: attendance.autoEnded || false
          });
        } else {
          // Update existing record
          dailyRecord.endDayTime = endTime;
          dailyRecord.totalHoursWorked = hoursWorked;
          dailyRecord.endDayLocation = attendance.endDayLocation;
          dailyRecord.dailyProgressCompleted = !!attendance.progressSubmitted;
          dailyRecord.dailyAimCompleted = aim ? (aim.completionStatus !== 'Pending') : false;
          dailyRecord.aimCompletionStatus = aim?.completionStatus || 'Not Set';
          dailyRecord.aimCompletionComment = aim?.completionComment || '';
          dailyRecord.autoEnded = attendance.autoEnded || false;
        }

        await dailyRecord.save();
        persistedCount++;
      }

      // Handle employees who didn't start their day (mark as absent)
      const activeUsers = await User.find({ stillExist: 1 }).select('_id');
      const attendedUserIds = new Set(todayAttendance.map(a => a.user._id.toString()));
      
      for (const user of activeUsers) {
        const userId = user._id.toString();
        if (!attendedUserIds.has(userId)) {
          // Check if they have an AIM (present via AIM only)
          const aim = aimMap.get(userId);
          
          let dailyRecord = await DailyAttendance.findOne({
            user: user._id,
            date: { $gte: today, $lt: tomorrow }
          });

          if (!dailyRecord) {
            // Create absent record (unless they have AIMS)
            const isPresent = !!aim;
            dailyRecord = new DailyAttendance({
              user: user._id,
              date: today,
              isPresent: isPresent,
              status: isPresent ? 'Present' : 'Absent',
              totalHoursWorked: 0,
              dailyAimCompleted: aim ? (aim.completionStatus !== 'Pending') : false,
              aimCompletionStatus: aim?.completionStatus || 'Not Set',
              workLocationType: 'Not Applicable'
            });
            
            await dailyRecord.save();
            persistedCount++;
          }
        }
      }

      console.log(`✅ [CRON] End-of-day persistence complete:`);
      console.log(`   - ${persistedCount} DailyAttendance records persisted`);
      console.log(`   - Note: Auto-end day is disabled - users must manually end their work day`);
      
    } catch (error) {
      console.error('❌ [CRON] Error in attendance persistence:', error);
    }
  });

  console.log('📅 Attendance persistence cron job scheduled (11:59 PM daily)');
}

/**
 * Sync existing attendance records to DailyAttendance (run on server start)
 * Enhanced to sync ALL available data and backfill historical records
 */
async function syncExistingAttendance() {
  try {
    console.log('🔄 Syncing existing attendance records to DailyAttendance...');
    
    // Get the last 90 days of attendance (extended from 30 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);
    
    // Get earliest attendance record date (for completeness)
    const earliestAttendance = await Attendance.findOne()
      .sort({ date: 1 })
      .select('date')
      .lean();
    
    const startDate = earliestAttendance ? new Date(earliestAttendance.date) : ninetyDaysAgo;
    startDate.setHours(0, 0, 0, 0);
    
    console.log(`📅 Syncing attendance from ${startDate.toISOString().split('T')[0]} to today...`);
    
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate }
    }).populate('user', '_id name email');

    let syncedCount = 0;
    let skippedCount = 0;
    
    for (const attendance of attendanceRecords) {
      if (!attendance.user) continue;
      
      const dateStart = new Date(attendance.date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      
      // Check if DailyAttendance already exists
      const existing = await DailyAttendance.findOne({
        user: attendance.user._id,
        date: { $gte: dateStart, $lt: dateEnd }
      });
      
      if (existing) {
        skippedCount++;
        continue;
      }
      
      // Calculate hours even if day is not ended (current time if not ended)
      let hoursWorked = 0;
      let endTime = attendance.endDayTime;
      
      if (attendance.startDayTime) {
        // If no end-day, use current time for ongoing sessions
        if (!endTime) {
          const now = new Date();
          const dayStart = new Date(attendance.date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          // Only count hours if still on same day
          if (now < dayEnd) {
            endTime = now;
          } else {
            // Use end of day if session spans multiple days
            endTime = dayEnd;
          }
        }
        
        hoursWorked = (endTime - attendance.startDayTime) / (1000 * 60 * 60);
        hoursWorked = Math.max(0, hoursWorked); // Ensure non-negative
      }
      
      // Create DailyAttendance record
      const dailyRecord = new DailyAttendance({
        user: attendance.user._id,
        date: attendance.date,
        startDayTime: attendance.startDayTime,
        endDayTime: endTime,
        totalHoursWorked: Math.round(hoursWorked * 100) / 100,
        workLocationType: attendance.workLocationType || 'Office',
        startDayLocation: attendance.startDayLocation,
        endDayLocation: attendance.endDayLocation,
        isPresent: !!attendance.startDayTime,
        status: attendance.startDayTime ? 'Present' : 'Absent',
        verificationMethod: attendance.verificationMethod || 'manual'
      });
      
      await dailyRecord.save();
      syncedCount++;
    }
    
    console.log(`✅ Synced ${syncedCount} historical attendance records (${skippedCount} already synced)`);
    
  } catch (error) {
    console.error('❌ Error syncing existing attendance:', error);
  }
}

/**
 * Force sync attendance records for a specific date range
 * Can be called manually or on demand
 */
async function forceSyncAttendanceRange(startDate, endDate) {
  try {
    console.log(`🔄 Force syncing attendance from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`);
    
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('user', '_id name email');

    let syncedCount = 0;
    
    for (const attendance of attendanceRecords) {
      if (!attendance.user) continue;
      
      const dateStart = new Date(attendance.date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      
      // Check if DailyAttendance already exists
      let existing = await DailyAttendance.findOne({
        user: attendance.user._id,
        date: { $gte: dateStart, $lt: dateEnd }
      });
      
      // Calculate hours even if day is not ended
      let hoursWorked = 0;
      let endTime = attendance.endDayTime;
      
      if (attendance.startDayTime) {
        if (!endTime) {
          const now = new Date();
          const dayStart = new Date(attendance.date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          if (now < dayEnd) {
            endTime = now;
          } else {
            endTime = dayEnd;
          }
        }
        
        hoursWorked = (endTime - attendance.startDayTime) / (1000 * 60 * 60);
        hoursWorked = Math.max(0, hoursWorked);
      }
      
      if (existing) {
        // Update existing record
        existing.startDayTime = attendance.startDayTime;
        existing.endDayTime = endTime;
        existing.totalHoursWorked = Math.round(hoursWorked * 100) / 100;
        existing.workLocationType = attendance.workLocationType || 'Office';
        existing.startDayLocation = attendance.startDayLocation;
        existing.endDayLocation = attendance.endDayLocation;
        existing.isPresent = !!attendance.startDayTime;
        existing.status = attendance.startDayTime ? 'Present' : 'Absent';
        existing.verificationMethod = attendance.verificationMethod || 'manual';
        await existing.save();
      } else {
        // Create new record
        const dailyRecord = new DailyAttendance({
          user: attendance.user._id,
          date: attendance.date,
          startDayTime: attendance.startDayTime,
          endDayTime: endTime,
          totalHoursWorked: Math.round(hoursWorked * 100) / 100,
          workLocationType: attendance.workLocationType || 'Office',
          startDayLocation: attendance.startDayLocation,
          endDayLocation: attendance.endDayLocation,
          isPresent: !!attendance.startDayTime,
          status: attendance.startDayTime ? 'Present' : 'Absent',
          verificationMethod: attendance.verificationMethod || 'manual'
        });
        await dailyRecord.save();
      }
      
      syncedCount++;
    }
    
    console.log(`✅ Force sync complete: ${syncedCount} records processed`);
    return syncedCount;
    
  } catch (error) {
    console.error('❌ Error in force sync:', error);
    throw error;
  }
}

module.exports = {
  startAttendancePersistenceCron,
  syncExistingAttendance,
  forceSyncAttendanceRange
};
