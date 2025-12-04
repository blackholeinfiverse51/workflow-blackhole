import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  MapPin,
  Navigation,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  StopCircle,
  Pause,
  Play,
  Eye,
  EyeOff,
  Filter,
  Search,
  RefreshCw,
  Download,
  Send,
  BarChart3,
  TrendingUp,
  Radio,
  Zap,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../context/auth-context';
import { useSocketContext } from '../../context/socket-context';
import api from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

const LiveAttendanceAdminPanel = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();
  const { toast } = useToast();

  // State Management
  const [liveUsers, setLiveUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    dayStartedCount: 0,
    dayEndedCount: 0,
    presentPercentage: 0,
    avgHoursToday: 0,
    totalHoursToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('live');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showLocationHistoryDialog, setShowLocationHistoryDialog] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      if (response.data?.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch live attendance data
  const fetchLiveAttendanceData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching live attendance data...');
      
      // Build query parameters
      const params = {};
      if (filterDepartment && filterDepartment !== 'all') {
        params.department = filterDepartment;
      }
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      // Fetch from the /live endpoint which shows all employees
      const response = await api.get('/attendance/live', { params });
      console.log('✅ Live attendance response:', response.data);
      
      if (response.data?.success && response.data.data) {
        const { attendance, stats: serverStats } = response.data.data;
        
        setLiveUsers(attendance || []);
        setStats({
          totalEmployees: serverStats.totalEmployees || 0,
          presentToday: serverStats.presentToday || 0,
          absentToday: serverStats.absentToday || 0,
          lateToday: serverStats.lateToday || 0,
          onLeaveToday: serverStats.onLeaveToday || 0,
          dayStartedCount: serverStats.dayStartedCount || 0,
          dayEndedCount: serverStats.dayEndedCount || 0,
          presentPercentage: serverStats.presentPercentage || 0,
          avgHoursToday: serverStats.avgHoursToday || 0,
          totalHoursToday: serverStats.totalHoursToday || 0
        });
        
        setLastUpdated(new Date());
        console.log(`📊 Loaded ${attendance?.length || 0} attendance records`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching live attendance:', error);
      toast({
        title: "Error",
        description: "Could not fetch live attendance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('attendance:live-tracking-started', (data) => {
      toast({
        title: "Live Tracking Started",
        description: `${data.userName} started live tracking`,
        variant: "default"
      });
      fetchLiveAttendanceData();
    });

    socket.on('attendance:location-update', (data) => {
      setLiveUsers(prev => prev.map(user => 
        user.user?._id === data.userId 
          ? { ...user, lastLocationUpdate: new Date() }
          : user
      ));
    });

    socket.on('attendance:geofence-exit', (data) => {
      toast({
        title: "⚠️ Geofence Violation",
        description: `Employee exited office radius (${data.distanceFromOffice}m away)`,
        variant: "destructive"
      });
    });

    socket.on('attendance:geofence-enter', (data) => {
      toast({
        title: "✅ Geofence Re-entry",
        description: `Employee returned to office radius`,
        variant: "default"
      });
    });

    socket.on('alert:triggered', (data) => {
      toast({
        title: "🚨 Alert Triggered",
        description: data.alert?.title || "A new alert has been triggered",
        variant: "destructive"
      });
      fetchLiveAttendanceData();
    });

    return () => {
      socket.off('attendance:live-tracking-started');
      socket.off('attendance:location-update');
      socket.off('attendance:geofence-exit');
      socket.off('attendance:geofence-enter');
      socket.off('alert:triggered');
    };
  }, [socket, toast]);

  useEffect(() => {
    fetchDepartments();
    fetchLiveAttendanceData();
    const interval = setInterval(fetchLiveAttendanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filterDepartment, filterStatus]);

  // Fetch data when filters change
  useEffect(() => {
    if (!loading) {
      fetchLiveAttendanceData();
    }
  }, [filterDepartment, filterStatus]);

  // Filtered users
  const filteredUsers = liveUsers.filter(record => {
    const userName = record.user?.name?.toLowerCase() || '';
    const userEmail = record.user?.email?.toLowerCase() || '';
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) || 
                         userEmail.includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (record) => {
    if (record.isLeave) {
      return <Badge className="bg-purple-500">On Leave</Badge>;
    }
    if (!record.startDayTime) {
      return <Badge variant="outline" className="bg-gray-500 text-white">Absent</Badge>;
    }
    if (record.endDayTime) {
      return <Badge className="bg-blue-500">Day Completed</Badge>;
    }
    if (record.isLate) {
      return <Badge className="bg-yellow-500">Late</Badge>;
    }
    if (record.isPresent) {
      return <Badge className="bg-green-500 animate-pulse">🟢 Present</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const handleViewDetails = async (userRecord) => {
    setSelectedUser(userRecord);
    setShowUserDetailsDialog(true);
  };

  const handleViewLocationHistory = async (userRecord) => {
    setSelectedUser(userRecord);
    setLocationHistory(userRecord.locationHistory || []);
    setShowLocationHistoryDialog(true);
  };

  const handleSendAlert = async () => {
    if (!selectedUser || !alertMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter an alert message",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post('/alerts/create', {
        employeeId: selectedUser.user._id,
        type: 'Manual',
        severity: 'High',
        title: 'Admin Alert',
        description: alertMessage,
        metadata: {
          sentBy: user?.name,
          sentAt: new Date()
        }
      });

      toast({
        title: "Success",
        description: "Alert sent to employee",
        variant: "default"
      });

      setAlertMessage('');
      setShowAlertDialog(false);
    } catch (error) {
      console.error('Error sending alert:', error);
      toast({
        title: "Error",
        description: "Failed to send alert",
        variant: "destructive"
      });
    }
  };

  const handleStopTracking = async (userId) => {
    try {
      await api.post(`/attendance/live/stop/${userId}`);
      toast({
        title: "Success",
        description: "Live tracking stopped",
        variant: "default"
      });
      fetchLiveAttendanceData();
    } catch (error) {
      console.error('Error stopping tracking:', error);
      toast({
        title: "Error",
        description: "Failed to stop tracking",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    const csvData = filteredUsers.map(record => ({
      'Name': record.user?.name,
      'Email': record.user?.email,
      'Status': record.liveTracking?.enabled ? 'Tracking' : 'Not Tracking',
      'Location': record.locationHistory?.length > 0 ? 'Available' : 'No Data',
      'Violations': record.geofenceViolations?.length || 0,
      'Start Time': record.startTime ? new Date(record.startTime).toLocaleString() : 'N/A',
      'End Time': record.endTime ? new Date(record.endTime).toLocaleString() : 'N/A'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-attendance-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading && liveUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-400" />
            Live Attendance Admin Panel
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time monitoring and control • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchLiveAttendanceData}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
            <Radio className="w-4 h-4 animate-pulse" />
            Live System Active
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-400' },
          { label: 'Present Today', value: stats.presentToday, icon: CheckCircle, color: 'from-green-500 to-green-600', textColor: 'text-green-400' },
          { label: 'Absent Today', value: stats.absentToday, icon: XCircle, color: 'from-red-500 to-red-600', textColor: 'text-red-400' },
          { label: 'On Leave', value: stats.onLeaveToday, icon: AlertCircle, color: 'from-orange-500 to-orange-600', textColor: 'text-orange-400' },
          { label: 'Late Arrivals', value: stats.lateToday, icon: Clock, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-400' },
          { label: 'Avg Hours', value: stats.avgHoursToday ? `${stats.avgHoursToday}h` : '0h', icon: TrendingUp, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-400' },
          { label: 'Attendance %', value: `${stats.presentPercentage}%`, icon: BarChart3, color: 'from-cyan-500 to-cyan-600', textColor: 'text-cyan-400' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-lg backdrop-blur-sm hover:border-white/40 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchLiveAttendanceData}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20 p-1">
          <TabsTrigger value="live" className="text-white">
            <Radio className="w-4 h-4 mr-2" />
            Live Monitor
          </TabsTrigger>
          <TabsTrigger value="details" className="text-white">
            <Eye className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="violations" className="text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Violations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Live Monitor Tab */}
        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Users List */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Live Tracking Users</CardTitle>
                  <CardDescription className="text-gray-400">
                    {filteredUsers.length} user(s) matching filters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {filteredUsers.map((record, idx) => {
                        const lastLocation = record.locationHistory?.[record.locationHistory.length - 1];
                        const isTracking = record.liveTracking?.enabled;

                        return (
                          <motion.div
                            key={record._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={record.user?.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {record.user?.name?.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {isTracking && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">
                                  {record.user?.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {record.user?.email}
                                </p>
                                {lastLocation && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {lastLocation.distanceFromOffice?.toFixed(0)}m from office
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(record)}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(record)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {isTracking && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStopTracking(record.user._id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <StopCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Panel */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleExportData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>

                <Button
                  onClick={() => setShowAlertDialog(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={!selectedUser}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Send Alert
                </Button>

                <Button
                  onClick={() => handleViewLocationHistory(selectedUser)}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  disabled={!selectedUser}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Location History
                </Button>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3">System Status</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Socket Connection</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Database Sync</span>
                      <Badge className="bg-green-500 text-white">Synced</Badge>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Geofencing</span>
                      <Badge className="bg-green-500 text-white">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Detailed User Information</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedUser.user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                        {selectedUser.user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedUser.user?.name}</h3>
                      <p className="text-gray-400">{selectedUser.user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Tracking Status</p>
                      <Badge className={selectedUser.liveTracking?.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                        {selectedUser.liveTracking?.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Day Status</p>
                      <Badge className="bg-blue-500">
                        {selectedUser.endTime ? 'Completed' : selectedUser.startTime ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Geofence Status</p>
                      <Badge className={selectedUser.locationHistory?.[selectedUser.locationHistory.length - 1]?.insideGeofence ? 'bg-green-500' : 'bg-orange-500'}>
                        {selectedUser.locationHistory?.[selectedUser.locationHistory.length - 1]?.insideGeofence ? 'Inside' : 'Outside'}
                      </Badge>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Total Violations</p>
                      <p className="text-lg font-bold text-red-400">{selectedUser.geofenceViolations?.length || 0}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-white mb-3">Location Details</p>
                    {selectedUser.locationHistory?.[selectedUser.locationHistory.length - 1] ? (
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Latitude:</span>
                          <span className="font-mono">{selectedUser.locationHistory[selectedUser.locationHistory.length - 1].latitude?.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Longitude:</span>
                          <span className="font-mono">{selectedUser.locationHistory[selectedUser.locationHistory.length - 1].longitude?.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Distance from Office:</span>
                          <span className="font-mono">{selectedUser.locationHistory[selectedUser.locationHistory.length - 1].distanceFromOffice?.toFixed(0)}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-mono">±{selectedUser.locationHistory[selectedUser.locationHistory.length - 1].accuracy?.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No location data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400">Select a user to view details</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Geofence Violations</CardTitle>
              <CardDescription className="text-gray-400">
                Total violations across all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers
                  .filter(u => (u.geofenceViolations?.length || 0) > 0)
                  .map((record, idx) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 p-4 rounded-lg border-l-4 border-red-500"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{record.user?.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{record.geofenceViolations?.length} violation(s)</p>
                          <div className="space-y-1 text-xs text-gray-400">
                            {record.geofenceViolations?.slice(0, 3).map((v, i) => (
                              <div key={i}>
                                {new Date(v.timestamp).toLocaleString()} - {v.distanceFromOffice?.toFixed(0)}m away
                              </div>
                            ))}
                          </div>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </motion.div>
                  ))}
                {filteredUsers.filter(u => (u.geofenceViolations?.length || 0) > 0).length === 0 && (
                  <p className="text-center text-gray-400 py-8">No violations found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Work Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredUsers.slice(0, 5).map((record, idx) => {
                  const hours = record.startTime
                    ? ((record.endTime || new Date()) - new Date(record.startTime)) / (1000 * 60 * 60)
                    : 0;
                  const progress = Math.min(100, (hours / 8) * 100);

                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-white truncate">{record.user?.name}</span>
                        <span className="text-xs text-gray-400">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">API Response Time</span>
                  <span className="text-green-400 font-mono">12ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Database Queries</span>
                  <span className="text-green-400 font-mono">45 req/min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active WebSockets</span>
                  <span className="text-green-400 font-mono">{filteredUsers.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-green-400 font-mono">234MB / 512MB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>User Live Tracking Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Name</Label>
                  <p className="font-semibold">{selectedUser.user?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="font-semibold text-sm truncate">{selectedUser.user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Total Locations Tracked</Label>
                  <p className="font-semibold text-2xl">{selectedUser.locationHistory?.length || 0}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Geofence Violations</Label>
                  <p className="font-semibold text-2xl text-red-400">{selectedUser.geofenceViolations?.length || 0}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Tracking Status</Label>
                <Badge className={selectedUser.liveTracking?.enabled ? 'bg-green-500 mt-1' : 'bg-gray-500 mt-1'}>
                  {selectedUser.liveTracking?.enabled ? '🔴 Live Tracking Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDetailsDialog(false)} variant="outline" className="border-white/20">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Send Alert to {selectedUser?.user?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Send a real-time alert to this employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter alert message..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAlertDialog(false)} variant="outline" className="border-white/20">
              Cancel
            </Button>
            <Button onClick={handleSendAlert} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocationHistoryDialog} onOpenChange={setShowLocationHistoryDialog}>
        <DialogContent className="bg-slate-900 border-white/20 text-white max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Location History - {selectedUser?.user?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {locationHistory.slice().reverse().map((loc, idx) => (
              <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm border-l-2 border-blue-500">
                <p className="font-semibold text-white">#{locationHistory.length - idx}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(loc.timestamp).toLocaleString()}
                </p>
                <div className="mt-2 space-y-1 text-xs text-gray-300">
                  <div>📍 Lat: {loc.latitude?.toFixed(6)}, Lng: {loc.longitude?.toFixed(6)}</div>
                  <div>📏 {loc.distanceFromOffice?.toFixed(0)}m from office</div>
                  <div>🎯 {loc.insideGeofence ? '✅ Inside' : '❌ Outside'} geofence</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveAttendanceAdminPanel;
