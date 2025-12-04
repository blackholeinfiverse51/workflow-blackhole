import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Timer,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../context/auth-context';
import EnhancedStartDayDialog from '../attendance/EnhancedStartDayDialog';

export function WorkHoursManager({ employee }) {
  const [workSession, setWorkSession] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showStartDayDialog, setShowStartDayDialog] = useState(false);
  const [frozenProgress, setFrozenProgress] = useState(null); // freeze UI time when paused
  const [clientBreakMinutes, setClientBreakMinutes] = useState(0); // extra break tracking when backend has no session
  const { toast } = useToast();
  const { user } = useAuth();

  // Use current user if no employee prop is provided (for user dashboard)
  const currentEmployee = employee || user;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current work session
  useEffect(() => {
    if (currentEmployee) {
      fetchWorkSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmployee]);

  // Load any client-side break minutes (for attendance-only days) and pause state
  useEffect(() => {
    if (!currentEmployee) return;

    const dateKey = new Date().toISOString().slice(0, 10);
    const breakKey = `workHoursClientBreak_${currentEmployee._id || currentEmployee.id}_${dateKey}`;
    const pauseKey = `workHoursPauseState_${currentEmployee._id || currentEmployee.id}`;

    try {
      const storedBreak = localStorage.getItem(breakKey);
      if (storedBreak) {
        const parsed = parseInt(storedBreak, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setClientBreakMinutes(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load client break minutes', e);
    }

    // We still restore pause UI state in the next effect when workSession is available
  }, [currentEmployee]);

  // Restore pause state from localStorage after refresh so time stays frozen until user resumes
  useEffect(() => {
    if (!currentEmployee || !workSession) return;

    try {
      const key = `workHoursPauseState_${currentEmployee._id || currentEmployee.id}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const stored = JSON.parse(raw);
      if (!stored || !stored.paused) return;

      // Apply stored paused status and frozen progress
      setWorkSession(prev => prev ? { ...prev, status: 'paused' } : prev);
      if (stored.frozenProgress) {
        setFrozenProgress(stored.frozenProgress);
      }
    } catch (e) {
      console.warn('Failed to restore work hours pause state', e);
    }
  }, [currentEmployee, workSession]);

  const fetchWorkSession = async () => {
    try {
      // First check the monitoring system
      const monitoringResponse = await api.get(
        `/monitoring/work-session/${currentEmployee._id || currentEmployee.id}`
      );
      
      if (monitoringResponse) {
        setWorkSession(monitoringResponse);
        return;
      }
    } catch {
      console.log('No monitoring session found, checking attendance system...');
    }

    try {
      // If no monitoring session, check attendance system
      const attendanceResponse = await api.get(
        `/attendance/verify/${currentEmployee._id || currentEmployee.id}`
      );
      
      if (attendanceResponse.success && attendanceResponse.data) {
        const attendance = attendanceResponse.data;
        
        // If day is started in attendance but no monitoring session, create a mock session
        if (attendance.startDayTime && !attendance.endDayTime) {
          const mockSession = {
            status: 'active',
            startTime: attendance.startDayTime,
            targetHours: 8,
            workLocation: attendance.workPattern === 'Remote' ? 'Home' : 'Office'
          };
          setWorkSession(mockSession);
        } else if (attendance.endDayTime) {
          const mockSession = {
            status: 'completed',
            startTime: attendance.startDayTime,
            endTime: attendance.endDayTime,
            targetHours: 8,
            workLocation: attendance.workPattern === 'Remote' ? 'Home' : 'Office'
          };
          setWorkSession(mockSession);
        } else {
          setWorkSession(null);
        }
      } else {
        setWorkSession(null);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setWorkSession(null);
    }
  };

  const handleStartWorkDayClick = () => {
    // Show the location popup dialog instead of directly starting
    setShowStartDayDialog(true);
  };

  const onStartDaySuccess = async (data) => {
    // After successful location validation, try to start the monitoring work session
    setLoading(true);
    try {
      // Try to start monitoring session
      const response = await api.post(
        `/monitoring/work-session/start`,
        {
          employeeId: currentEmployee._id || currentEmployee.id,
          startTime: new Date(),
          targetHours: 8, // Default 8-hour work day
          workLocation: data.workLocationType || 'Office'
        }
      );
      
      setWorkSession(response);
    } catch (error) {
      console.log('Monitoring session start failed, using attendance data:', error);
      // If monitoring session fails, create a mock session from attendance data
      const mockSession = {
        status: 'active',
        startTime: new Date(),
        targetHours: 8,
        workLocation: data.workLocationType || 'Office'
      };
      setWorkSession(mockSession);
    }

    toast({
      title: "Work Day Started",
      description: `Your work day has begun${data.workLocationType === 'Home' ? ' from home' : ' from office'}!`,
    });
    
    setShowStartDayDialog(false);
    
    // Refresh the work session to get the latest data
    setTimeout(() => {
      fetchWorkSession();
    }, 1000);
    
    setLoading(false);
  };

  const pauseWorkDay = async () => {
    setLoading(true);
    try {
      console.log('Attempting to pause work day for employee:', currentEmployee._id || currentEmployee.id);
      // Freeze current progress for UI so time appears stopped immediately
      const currentProgress = getWorkProgress();
      setFrozenProgress(currentProgress);

      // Persist pause state so it survives refresh
      try {
        const pauseKey = `workHoursPauseState_${currentEmployee._id || currentEmployee.id}`;
        localStorage.setItem(
          pauseKey,
          JSON.stringify({
            paused: true,
            frozenProgress: currentProgress,
            pausedAt: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn('Failed to persist work hours pause state', e);
      }
      
      await api.post(
        `/monitoring/work-session/pause`,
        { employeeId: currentEmployee._id || currentEmployee.id }
      );
      
      console.log('Pause successful, updating local session state...');

      // Optimistically update local session so UI changes immediately
      setWorkSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'paused',
          pausedAt: new Date().toISOString(),
        };
      });

      toast({
        title: "⏸️ Work Day Paused",
        description: "Your work session has been paused.",
      });
    } catch (error) {
      console.error('Error pausing work day:', error);
      const errorData = error.response?.data || error;
      toast({
        title: "❌ Error",
        description: errorData?.error || errorData?.message || "Failed to pause work day.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resumeWorkDay = async () => {
    setLoading(true);
    try {
      console.log('Attempting to resume work day for employee:', currentEmployee._id || currentEmployee.id);
      
      await api.post(
        `/monitoring/work-session/resume`,
        { employeeId: currentEmployee._id || currentEmployee.id }
      );
      
      console.log('Resume successful, updating local session state...');

      // Un-freeze progress so it starts updating again
      setFrozenProgress(null);

      // Clear persisted pause state
      try {
        const employeeId = currentEmployee._id || currentEmployee.id;
        const pauseKey = `workHoursPauseState_${employeeId}`;
        const dateKey = new Date().toISOString().slice(0, 10);
        const breakKey = `workHoursClientBreak_${employeeId}_${dateKey}`;

        // Before clearing, read pausedAt to calculate extra break minutes
        const rawPause = localStorage.getItem(pauseKey);
        if (rawPause) {
          const parsed = JSON.parse(rawPause);
          if (parsed?.paused && parsed.pausedAt) {
            const pausedAt = new Date(parsed.pausedAt);
            const now = new Date();
            const extra = Math.max(differenceInMinutes(now, pausedAt), 0);
            if (extra > 0) {
              setClientBreakMinutes(prev => {
                const updated = prev + extra;
                try {
                  localStorage.setItem(breakKey, String(updated));
                } catch (e) {
                  console.warn('Failed to persist client break minutes', e);
                }
                return updated;
              });
            }
          }
        }

        // Now clear pause marker
        localStorage.removeItem(pauseKey);
      } catch (e) {
        console.warn('Failed to clear work hours pause state', e);
      }

      // Optimistically update local session so UI changes immediately.
      setWorkSession(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          status: 'active',
          pausedAt: null,
          resumedAt: new Date().toISOString(),
        };
      });

      toast({
        title: "▶️ Work Day Resumed",
        description: "Your work session has been resumed.",
      });
    } catch (error) {
      console.error('Error resuming work day:', error);
      const errorData = error.response?.data || error;
      toast({
        title: "❌ Error",
        description: errorData?.error || errorData?.message || "Failed to resume work day.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const endWorkDay = async () => {
    setLoading(true);
    try {
      console.log('Attempting to end work day for employee:', currentEmployee._id || currentEmployee.id);
      
      // First try to end monitoring work session
      const response = await api.post(
        `/monitoring/work-session/end`,
        { employeeId: currentEmployee._id || currentEmployee.id }
      );
      
      console.log('Monitoring end day response:', response);
      
      if (response && (response.success || response.data?.success)) {
        setWorkSession(null);
        toast({
          title: "✅ Work Day Ended",
          description: response.message || response.data?.message || "Your work session has been completed.",
        });
        
        // Force refresh
        setTimeout(() => {
          fetchWorkSession();
        }, 500);
        
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('Monitoring session end failed, trying attendance system...', error);
      
      const errorData = error.response?.data || error;
      const errorMessage = errorData?.error || errorData?.message || error.message || '';
      
      // If no monitoring session found (check for various error messages), try to end via attendance system
      const noSessionErrors = [
        'SESSION_NOT_FOUND',
        'NO_ACTIVE_SESSION', 
        'No active work session found',
        'No monitoring session found'
      ];
      
      const shouldTryAttendance = 
        noSessionErrors.some(msg => 
          errorData?.code === msg || 
          errorMessage.includes(msg) || 
          errorMessage.includes('No active')
        ) || !workSession?.startTime;
      
      if (shouldTryAttendance) {
        try {
          console.log('Trying attendance end day...');
          
          const attendanceResponse = await api.post(
            `/attendance/end-day/${currentEmployee._id || currentEmployee.id}`,
            {} // Empty body, location will be handled by the backend if needed
          );
          
          console.log('Attendance end day response:', attendanceResponse);
          
          if (attendanceResponse && (attendanceResponse.success || attendanceResponse.data?.success)) {
            setWorkSession(null);
            toast({
              title: "✅ Work Day Ended",
              description: attendanceResponse.message || attendanceResponse.data?.message || "Your work day has been completed.",
            });
            
            // Force refresh
            setTimeout(() => {
              fetchWorkSession();
            }, 500);
            
            setLoading(false);
            return;
          }
        } catch (attendanceError) {
          console.error('Attendance end day error:', attendanceError);
          
          const attendanceErrorData = attendanceError.response?.data || attendanceError;
          const attendanceErrorMessage = attendanceErrorData?.error || attendanceErrorData?.message || attendanceError.message || '';
          
          setLoading(false);
          
          // Check for progress not set error (by code OR message content)
          if (attendanceErrorData?.code === 'PROGRESS_NOT_SET' || 
              attendanceErrorMessage.includes('set your daily progress') ||
              attendanceErrorMessage.includes('PROGRESS_NOT_SET')) {
            toast({
              title: "❌ Progress Required",
              description: "Please set your daily progress before ending your work day.",
              variant: "destructive"
            });
          } else if (attendanceErrorData?.code === 'AIM_NOT_COMPLETED') {
            console.log('Aim details from backend:', attendanceErrorData.aim);
            toast({
              title: "❌ Aim Not Completed",
              description: `Please complete your daily aim before ending your work day. Current status: ${attendanceErrorData.aim?.completionStatus || 'Unknown'}`,
              variant: "destructive"
            });
          } else if (attendanceErrorData?.code === 'AIM_COMMENT_MISSING') {
            toast({
              title: "❌ Completion Comment Required",
              description: "Please add a completion comment for your aim.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "❌ Error",
              description: attendanceErrorData?.error || attendanceErrorData?.message || "Failed to end work day.",
              variant: "destructive"
            });
          }
          return;
        }
      }
      
      setLoading(false);
      
      // Handle other monitoring system errors
      if (errorData?.code === 'PROGRESS_NOT_SET') {
        toast({
          title: "❌ Progress Required",
          description: "Please set your daily progress before ending your work session.",
          variant: "destructive"
        });
      } else if (errorData?.code === 'NO_ACTIVE_SESSION') {
        // Already ended
        setWorkSession(null);
        toast({
          title: "ℹ️ No Active Session",
          description: "Your work day has already ended or was not started.",
        });
        setTimeout(() => {
          fetchWorkSession();
        }, 500);
      } else {
        toast({
          title: "❌ Error",
          description: errorData?.error || errorData?.message || "Failed to end work day. Check console for details.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate work progress
  const getWorkProgress = () => {
    // If currently paused and we have a frozen snapshot, return it so UI time doesn't move
    if (workSession && workSession.status === 'paused' && frozenProgress) {
      return frozenProgress;
    }

    if (!workSession || !workSession.startTime) {
      return { hours: 0, minutes: 0, percentage: 0 };
    }

    const startTime = new Date(workSession.startTime);
    // For completed sessions, stop at endTime; otherwise use current time
    const referenceTime =
      workSession.status === 'completed' && workSession.endTime
        ? new Date(workSession.endTime)
        : currentTime;

    // Total minutes from start until now / end
    let totalMinutes = Math.max(differenceInMinutes(referenceTime, startTime), 0);

    // Break minutes: backend-tracked + client-tracked (for attendance-only days)
    let breakMinutes = (workSession.totalBreakTime || 0) + (clientBreakMinutes || 0);

    // If currently paused and we have a backend pausedAt, also subtract the ongoing paused duration
    if (workSession.status === 'paused' && workSession.pausedAt) {
      const pausedAt = new Date(workSession.pausedAt);
      const currentPause = Math.max(differenceInMinutes(currentTime, pausedAt), 0);
      breakMinutes += currentPause;
    }

    const activeMinutes = Math.max(totalMinutes - breakMinutes, 0);
    const totalHours = activeMinutes / 60;
    const targetHours = workSession.targetHours || 8;
    const percentage = Math.min((totalHours / targetHours) * 100, 100);

    return {
      hours: Math.floor(activeMinutes / 60),
      minutes: activeMinutes % 60,
      percentage,
      remaining: Math.max(targetHours - totalHours, 0),
    };
  };

  const progress = getWorkProgress();
  // Be defensive: some sessions may not have a status field yet, treat them as active
  const effectiveStatus = workSession?.status || 'active';
  const isWorkDayActive = !!workSession && effectiveStatus === 'active';
  const isWorkDayPaused = !!workSession && effectiveStatus === 'paused';
  const isWorkDayCompleted = !!workSession && effectiveStatus === 'completed';

  // Unified handler so the same button can pause or resume based on current status
  const togglePauseResume = async () => {
    if (!workSession || loading) return;

    if (isWorkDayPaused) {
      await resumeWorkDay();
    } else if (isWorkDayActive) {
      await pauseWorkDay();
    }
  };

  return (
    <Card className="neo-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Work Hours Manager
          {isWorkDayActive && (
            <Badge variant="default" className="ml-auto animate-pulse">
              Active
            </Badge>
          )}
          {isWorkDayPaused && (
            <Badge variant="secondary" className="ml-auto">
              Paused
            </Badge>
          )}
          {isWorkDayCompleted && (
            <Badge variant="outline" className="ml-auto">
              Completed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Time */}
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-foreground">
            {format(currentTime, 'HH:mm:ss')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(currentTime, 'EEEE, MMMM do, yyyy')}
          </p>
        </div>

        {/* Work Progress */}
        {workSession && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Work Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.hours}h {progress.minutes}m / {workSession.targetHours || 8}h
              </span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.percentage.toFixed(1)}% complete</span>
              <span>{progress.remaining.toFixed(1)}h remaining</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!workSession && (
            <Button 
              onClick={handleStartWorkDayClick} 
              disabled={loading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Work Day
            </Button>
          )}
          
          {/* Show Pause/Resume + End while there is an ongoing session (active or paused) */}
          {workSession && !isWorkDayCompleted && (
            <>
              <Button 
                onClick={togglePauseResume} 
                disabled={loading}
                variant={isWorkDayPaused ? "default" : "outline"}
                className="flex-1"
              >
                {isWorkDayPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
            </>
          )}
              </Button>
              <Button 
                onClick={endWorkDay} 
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                End Day
              </Button>
            </>
          )}
          
          {isWorkDayCompleted && (
            <Button 
              onClick={handleStartWorkDayClick} 
              disabled={loading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Day
            </Button>
          )}
        </div>

        {/* Work Session Info */}
        {workSession && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Started: {format(new Date(workSession.startTime), 'HH:mm')}</p>
            {workSession.endTime && (
              <p>Ended: {format(new Date(workSession.endTime), 'HH:mm')}</p>
            )}
          </div>
        )}
      </CardContent>

      {/* Enhanced Start Day Dialog with Location Popup */}
      <EnhancedStartDayDialog
        isOpen={showStartDayDialog}
        onClose={() => setShowStartDayDialog(false)}
        onStartDay={onStartDaySuccess}
        user={currentEmployee}
      />
    </Card>
  );
}
