"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
  Loader2, 
  FileText, 
  Users, 
  Target, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  TrendingUp,
  UserCheck,
  UserX
} from "lucide-react"
import { api } from "../../lib/api"
import { useToast } from "../../hooks/use-toast"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { CreateTaskDialog } from "../tasks/create-task-dialog"

export function AdminReportDialog({ open, onOpenChange }) {
  const { toast } = useToast()
  const [dateFilter, setDateFilter] = useState("today")
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const getDateRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    switch (dateFilter) {
      case "today":
        return format(today, "yyyy-MM-dd")
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return format(yesterday, "yyyy-MM-dd")
      case "weekly":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return format(weekStart, "yyyy-MM-dd")
      case "lifetime":
        return null // No date filter for lifetime
      default:
        return format(today, "yyyy-MM-dd")
    }
  }

  const fetchReport = async () => {
    try {
      setIsLoading(true)
      const dateStr = getDateRange()
      console.log("Fetching report with:", { dateStr, dateFilter })
      const data = await api.dashboard.getAdminReport(dateStr, dateFilter)
      console.log("Report data received:", data)
      if (!data) {
        throw new Error("No data received from server")
      }
      setReportData(data)
    } catch (error) {
      console.error("Error fetching report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load report data",
        variant: "destructive",
      })
      setReportData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateFilter])

  // Update current time every second for real-time hours calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (dateString) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "h:mm a")
  }

  const formatHours = (hours) => {
    if (!hours) return "0h"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  // Calculate real-time hours from start time
  const calculateRealTimeHours = (startTime) => {
    if (!startTime) return 0
    const start = new Date(startTime)
    const end = currentTime
    const hours = Math.max(0, (end - start) / (1000 * 60 * 60))
    return hours
  }

  // Get total hours - real-time for today if day is active, otherwise overall
  const getTotalHours = (user) => {
    // Only show real-time for "today" filter and if day hasn't ended
    if (dateFilter === "today" && !user.endDayTime) {
      return calculateRealTimeHours(user.startDayTime)
    }
    // Otherwise show the stored total hours
    return user.totalHoursWorked || 0
  }

  const getFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return format(new Date(), "MMMM d, yyyy")
      case "yesterday":
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return format(yesterday, "MMMM d, yyyy")
      case "weekly":
        return "This Week"
      case "lifetime":
        return "All Time"
      default:
        return format(new Date(), "MMMM d, yyyy")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-hidden border-none rounded-2xl shadow-2xl p-0"
        style={{
          background: 'rgba(30, 30, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <div className="flex flex-col h-[95vh]">
          <DialogHeader 
            className="sticky top-0 z-10 border-b border-white/10 px-6 pt-6 pb-4"
            style={{
              background: 'rgba(30, 30, 30, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Admin Dashboard Report
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-gray-400">
                    Comprehensive report for <span className="font-semibold text-blue-400">{getFilterLabel()}</span>
                  </DialogDescription>
                </div>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={dateFilter === "today" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("today")}
                    className={dateFilter === "today" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 border-none font-medium px-4 py-2 transition-all duration-200" 
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30 font-medium px-4 py-2 transition-all duration-200"
                    }
                  >
                    Today
                  </Button>
                  <Button
                    variant={dateFilter === "yesterday" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("yesterday")}
                    className={dateFilter === "yesterday" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 border-none font-medium px-4 py-2 transition-all duration-200" 
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30 font-medium px-4 py-2 transition-all duration-200"
                    }
                  >
                    Yesterday
                  </Button>
                  <Button
                    variant={dateFilter === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("weekly")}
                    className={dateFilter === "weekly" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 border-none font-medium px-4 py-2 transition-all duration-200" 
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30 font-medium px-4 py-2 transition-all duration-200"
                    }
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={dateFilter === "lifetime" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter("lifetime")}
                    className={dateFilter === "lifetime" 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 border-none font-medium px-4 py-2 transition-all duration-200" 
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30 font-medium px-4 py-2 transition-all duration-200"
                    }
                  >
                    Lifetime
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchReport}
                  disabled={isLoading}
                  className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30 font-medium px-4 py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div 
            className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            style={{
              background: 'rgba(20, 20, 20, 0.6)'
            }}
          >

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-gray-400">Loading report data...</p>
                </div>
              </div>
            ) : reportData ? (
              <div className="space-y-6 pt-6">
                {/* Main Dashboard Stats */}
                <Card 
                  className="border border-white/10 shadow-lg rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(50, 50, 50, 0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <CardHeader 
                    className="border-b border-white/10"
                    style={{
                      background: 'rgba(40, 40, 40, 0.6)'
                    }}
                  >
                    <CardTitle className="flex items-center gap-2 text-white">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      Main Dashboard Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div 
                        className="text-center p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-3xl font-bold text-blue-400 mb-1">{reportData.dashboardStats.totalTasks}</div>
                        <div className="text-sm font-medium text-gray-300">Total Tasks</div>
                      </div>
                      <div 
                        className="text-center p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-3xl font-bold text-green-400 mb-1">{reportData.dashboardStats.completedTasks}</div>
                        <div className="text-sm font-medium text-gray-300">Completed</div>
                      </div>
                      <div 
                        className="text-center p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
                        style={{
                          background: 'rgba(249, 115, 22, 0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-3xl font-bold text-orange-400 mb-1">{reportData.dashboardStats.inProgressTasks}</div>
                        <div className="text-sm font-medium text-gray-300">In Progress</div>
                      </div>
                      <div 
                        className="text-center p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-3xl font-bold text-red-400 mb-1">{reportData.dashboardStats.pendingTasks}</div>
                        <div className="text-sm font-medium text-gray-300">Pending</div>
                      </div>
                      <div 
                        className="text-center p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
                        style={{
                          background: 'rgba(168, 85, 247, 0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-3xl font-bold text-purple-400 mb-1">{reportData.dashboardStats.totalUsers}</div>
                        <div className="text-sm font-medium text-gray-300">Total Users</div>
                      </div>
                      <div 
                        className="text-center p-5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-3xl font-bold text-indigo-400 mb-1">{reportData.dashboardStats.totalDepartments}</div>
                        <div className="text-sm font-medium text-gray-300">Departments</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="departments" className="w-full">
                  <TabsList 
                    className="grid w-full grid-cols-5 border border-white/10 rounded-lg p-1"
                    style={{
                      background: 'rgba(40, 40, 40, 0.6)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <TabsTrigger 
                      value="departments"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Departments
                    </TabsTrigger>
                    <TabsTrigger 
                      value="users-aims"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Users & Aims
                    </TabsTrigger>
                    <TabsTrigger 
                      value="zero-tasks"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Zero Tasks
                    </TabsTrigger>
                    <TabsTrigger 
                      value="progress"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Progress
                    </TabsTrigger>
                    <TabsTrigger 
                      value="work-hours"
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Work Hours
                    </TabsTrigger>
                  </TabsList>

                  {/* Department-wise Task Count */}
                  <TabsContent value="departments" className="space-y-4 mt-4">
                    <Card 
                      className="border border-white/10 shadow-lg rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(50, 50, 50, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <CardHeader 
                        className="border-b border-white/10"
                        style={{
                          background: 'rgba(40, 40, 40, 0.6)'
                        }}
                      >
                        <CardTitle className="flex items-center gap-2 text-white">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          Department-wise Task Count
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow 
                                className="border-b border-white/10"
                                style={{
                                  background: 'rgba(40, 40, 40, 0.6)'
                                }}
                              >
                                <TableHead className="text-white font-semibold">Department</TableHead>
                                <TableHead className="text-white font-semibold">Total Tasks</TableHead>
                                <TableHead className="text-white font-semibold">Completed</TableHead>
                                <TableHead className="text-white font-semibold">In Progress</TableHead>
                                <TableHead className="text-white font-semibold">Pending</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reportData.departmentTaskCounts.map((dept) => (
                                <TableRow 
                                  key={dept.id} 
                                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                  style={{
                                    background: 'rgba(50, 50, 50, 0.4)'
                                  }}
                                >
                                  <TableCell className="font-medium text-gray-100">{dept.name}</TableCell>
                                  <TableCell className="text-gray-300">{dept.totalTasks}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className="text-green-400 border-green-500/30"
                                      style={{
                                        background: 'rgba(34, 197, 94, 0.15)'
                                      }}
                                    >
                                      {dept.completedTasks}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className="text-orange-400 border-orange-500/30"
                                      style={{
                                        background: 'rgba(249, 115, 22, 0.15)'
                                      }}
                                    >
                                      {dept.inProgressTasks}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className="text-red-400 border-red-500/30"
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.15)'
                                      }}
                                    >
                                      {dept.pendingTasks}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Users with Aims */}
                  <TabsContent value="users-aims" className="space-y-4 mt-4">
                    <Card 
                      className="border border-white/10 shadow-lg rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(50, 50, 50, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <CardHeader 
                        className="border-b border-white/10"
                        style={{
                          background: 'rgba(40, 40, 40, 0.6)'
                        }}
                      >
                        <CardTitle className="flex items-center gap-2 text-white">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          All Users with Aims ({reportData.userCount} users)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow 
                                className="border-b border-white/10"
                                style={{
                                  background: 'rgba(40, 40, 40, 0.6)'
                                }}
                              >
                                <TableHead className="text-white font-semibold">Name</TableHead>
                                <TableHead className="text-white font-semibold">Email</TableHead>
                                <TableHead className="text-white font-semibold">Role</TableHead>
                                <TableHead className="text-white font-semibold">Department</TableHead>
                                <TableHead className="text-white font-semibold">Aims</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Progress</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reportData.usersWithAims.map((user) => (
                                <TableRow 
                                  key={user.userId} 
                                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                  style={{
                                    background: 'rgba(50, 50, 50, 0.4)'
                                  }}
                                >
                                  <TableCell className="font-medium text-gray-100">{user.name}</TableCell>
                                  <TableCell className="text-gray-300">{user.email}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline" 
                                      className="text-gray-300 border-white/10"
                                      style={{
                                        background: 'rgba(40, 40, 40, 0.6)'
                                      }}
                                    >
                                      {user.role}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300">{user.department}</TableCell>
                                  <TableCell>
                                    {user.aim ? (
                                      <div className="max-w-xs">
                                        <p className="text-sm text-gray-300">{user.aim.aims || "No aims set"}</p>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">No aim set</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {user.aim ? (
                                      <Badge
                                        className={
                                          user.aim.completionStatus === "Completed"
                                            ? "text-green-400 border-green-500/30"
                                            : "text-yellow-400 border-yellow-500/30"
                                        }
                                        style={{
                                          background: user.aim.completionStatus === "Completed"
                                            ? 'rgba(34, 197, 94, 0.15)'
                                            : 'rgba(234, 179, 8, 0.15)'
                                        }}
                                      >
                                        {user.aim.completionStatus || "In Progress"}
                                      </Badge>
                                    ) : (
                                      <Badge 
                                        variant="outline" 
                                        className="text-gray-500 border-white/10"
                                        style={{
                                          background: 'rgba(40, 40, 40, 0.6)'
                                        }}
                                      >
                                        Not Set
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {user.aim ? (
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-16 rounded-full h-2"
                                          style={{
                                            background: 'rgba(40, 40, 40, 0.6)'
                                          }}
                                        >
                                          <div
                                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                                            style={{ width: `${user.aim.progressPercentage || 0}%` }}
                                          />
                                        </div>
                                        <span className="text-sm text-gray-300">{user.aim.progressPercentage || 0}%</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Zero Task Employees */}
                  <TabsContent value="zero-tasks" className="space-y-4 mt-4">
                    <Card 
                      className="border border-white/10 shadow-lg rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(50, 50, 50, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <CardHeader 
                        className="border-b border-white/10"
                        style={{
                          background: 'rgba(40, 40, 40, 0.6)'
                        }}
                      >
                        <CardTitle className="flex items-center gap-2 text-white">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                            <AlertCircle className="h-5 w-5 text-white" />
                          </div>
                          Employees with 0 Tasks ({reportData.zeroTaskEmployees.length} employees)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {reportData.zeroTaskEmployees.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow 
                                  className="border-b border-white/10"
                                  style={{
                                    background: 'rgba(40, 40, 40, 0.6)'
                                  }}
                                >
                                  <TableHead className="text-white font-semibold">Name</TableHead>
                                  <TableHead className="text-white font-semibold">Email</TableHead>
                                  <TableHead className="text-white font-semibold">Role</TableHead>
                                  <TableHead className="text-white font-semibold">Department</TableHead>
                                  <TableHead className="text-white font-semibold">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {reportData.zeroTaskEmployees.map((emp) => (
                                  <TableRow 
                                    key={emp.userId} 
                                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                    style={{
                                      background: 'rgba(50, 50, 50, 0.4)'
                                    }}
                                  >
                                    <TableCell className="font-medium text-gray-100">{emp.name}</TableCell>
                                    <TableCell className="text-gray-300">{emp.email}</TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant="outline" 
                                        className="text-gray-300 border-white/10"
                                        style={{
                                          background: 'rgba(40, 40, 40, 0.6)'
                                        }}
                                      >
                                        {emp.role}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{emp.department}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedEmployeeId(emp.userId)
                                          setIsCreateTaskOpen(true)
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-lg"
                                      >
                                        Assign Task
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                            <p className="text-gray-400">All employees have tasks assigned!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* User Progress Updates */}
                  <TabsContent value="progress" className="space-y-4 mt-4">
                    <Card 
                      className="border border-white/10 shadow-lg rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(50, 50, 50, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <CardHeader 
                        className="border-b border-white/10"
                        style={{
                          background: 'rgba(40, 40, 40, 0.6)'
                        }}
                      >
                        <CardTitle className="flex items-center gap-2 text-white">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          User Progress Updates ({reportData.userProgressUpdates.length} updates)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {reportData.userProgressUpdates.length > 0 ? (
                          <div className="space-y-4">
                            {reportData.userProgressUpdates.map((progress) => (
                              <Card 
                                key={progress.id} 
                                className="border-l-4 border-l-primary border-white/10"
                                style={{
                                  background: 'rgba(50, 50, 50, 0.6)',
                                  backdropFilter: 'blur(10px)'
                                }}
                              >
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-white">{progress.userName}</span>
                                        <Badge 
                                          variant="outline" 
                                          className="text-gray-300 border-white/10"
                                          style={{
                                            background: 'rgba(40, 40, 40, 0.6)'
                                          }}
                                        >
                                          {progress.userEmail}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-300 mb-2">
                                        Task: <span className="font-medium text-white">{progress.taskTitle}</span>
                                      </p>
                                      <div className="flex items-center gap-4 mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-300">Progress:</span>
                                          <div 
                                            className="w-32 rounded-full h-2"
                                            style={{
                                              background: 'rgba(40, 40, 40, 0.6)'
                                            }}
                                          >
                                            <div
                                              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                                              style={{ width: `${progress.progressPercentage}%` }}
                                            />
                                          </div>
                                          <span className="text-sm text-gray-300">{progress.progressPercentage}%</span>
                                        </div>
                                      </div>
                                      {progress.notes && (
                                        <p className="text-sm mt-2 text-gray-300">
                                          <strong className="text-white">Notes:</strong> {progress.notes}
                                        </p>
                                      )}
                                      {Array.isArray(progress.achievements) && progress.achievements.length > 0 && (
                                        <div className="mt-2">
                                          <strong className="text-sm text-white">Achievements:</strong>
                                          <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                                            {progress.achievements.map((ach, idx) => (
                                              <li key={idx}>{ach}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {format(new Date(progress.createdAt), "h:mm a")}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                            <p className="text-gray-400">No progress updates for this date</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Users with Start Day and Work Hours */}
                  <TabsContent value="work-hours" className="space-y-4 mt-4">
                    <Card 
                      className="border border-white/10 shadow-lg rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(50, 50, 50, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <CardHeader 
                        className="border-b border-white/10"
                        style={{
                          background: 'rgba(40, 40, 40, 0.6)'
                        }}
                      >
                        <CardTitle className="flex items-center gap-2 text-white">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          Users Who Started Day with Work Hours ({reportData.usersWithStartDayCount} users)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {reportData.usersWithStartDay.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow 
                                  className="border-b border-white/10"
                                  style={{
                                    background: 'rgba(40, 40, 40, 0.6)'
                                  }}
                                >
                                  <TableHead className="text-white font-semibold">Name</TableHead>
                                  <TableHead className="text-white font-semibold">Email</TableHead>
                                  <TableHead className="text-white font-semibold">Role</TableHead>
                                  <TableHead className="text-white font-semibold">Department</TableHead>
                                  {dateFilter === "today" && (
                                    <>
                                      <TableHead className="text-white font-semibold">Start Day</TableHead>
                                      <TableHead className="text-white font-semibold">Hours</TableHead>
                                      <TableHead className="text-white font-semibold">WFH/Office</TableHead>
                                    </>
                                  )}
                                  {dateFilter === "yesterday" && (
                                    <>
                                      <TableHead className="text-white font-semibold">Start Day</TableHead>
                                      <TableHead className="text-white font-semibold">End Day</TableHead>
                                      <TableHead className="text-white font-semibold">Total Hours</TableHead>
                                      <TableHead className="text-white font-semibold">WFH/Office</TableHead>
                                    </>
                                  )}
                                  {(dateFilter === "weekly" || dateFilter === "lifetime") && (
                                    <TableHead className="text-white font-semibold">Total Hours</TableHead>
                                  )}
                                  <TableHead className="text-white font-semibold">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {reportData.usersWithStartDay.map((user) => (
                                  <TableRow 
                                    key={user.userId} 
                                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                    style={{
                                      background: 'rgba(50, 50, 50, 0.4)'
                                    }}
                                  >
                                    <TableCell className="font-medium text-gray-100">{user.userName}</TableCell>
                                    <TableCell className="text-gray-300">{user.userEmail}</TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant="outline" 
                                        className="text-gray-300 border-white/10"
                                        style={{
                                          background: 'rgba(40, 40, 40, 0.6)'
                                        }}
                                      >
                                        {user.userRole}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{user.department}</TableCell>
                                    {dateFilter === "today" && (
                                      <>
                                        <TableCell>
                                          <div className="flex items-center gap-1 text-gray-300">
                                            <Clock className="h-3 w-3" />
                                            {user.startDayTime ? formatTime(user.startDayTime) : "N/A"}
                                          </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-white">
                                          {formatHours(getTotalHours(user))}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            className={
                                              user.workLocationType === "Home" || user.workLocationType === "Remote"
                                                ? "text-blue-400 border-blue-500/30"
                                                : "text-purple-400 border-purple-500/30"
                                            }
                                            style={{
                                              background: user.workLocationType === "Home" || user.workLocationType === "Remote"
                                                ? 'rgba(59, 130, 246, 0.15)'
                                                : 'rgba(168, 85, 247, 0.15)'
                                            }}
                                          >
                                            {user.workLocationType === "Home" || user.workLocationType === "Remote" ? "WFH" : "Office"}
                                          </Badge>
                                        </TableCell>
                                      </>
                                    )}
                                    {dateFilter === "yesterday" && (
                                      <>
                                        <TableCell>
                                          <div className="flex items-center gap-1 text-gray-300">
                                            <Clock className="h-3 w-3" />
                                            {user.startDayTime ? formatTime(user.startDayTime) : "N/A"}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1 text-gray-300">
                                            <Clock className="h-3 w-3" />
                                            {user.endDayTime ? formatTime(user.endDayTime) : "N/A"}
                                          </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-white">
                                          {formatHours(user.totalHoursWorked || 0)}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            className={
                                              user.workLocationType === "Home" || user.workLocationType === "Remote"
                                                ? "text-blue-400 border-blue-500/30"
                                                : "text-purple-400 border-purple-500/30"
                                            }
                                            style={{
                                              background: user.workLocationType === "Home" || user.workLocationType === "Remote"
                                                ? 'rgba(59, 130, 246, 0.15)'
                                                : 'rgba(168, 85, 247, 0.15)'
                                            }}
                                          >
                                            {user.workLocationType === "Home" || user.workLocationType === "Remote" ? "WFH" : "Office"}
                                          </Badge>
                                        </TableCell>
                                      </>
                                    )}
                                    {(dateFilter === "weekly" || dateFilter === "lifetime") && (
                                      <TableCell className="font-semibold text-white">
                                        {formatHours(user.totalHoursWorked || 0)}
                                      </TableCell>
                                    )}
                                    <TableCell>
                                      <Badge
                                        className={
                                          user.status === "Present"
                                            ? "text-green-400 border-green-500/30"
                                            : "text-gray-300 border-white/10"
                                        }
                                        style={{
                                          background: user.status === "Present"
                                            ? 'rgba(34, 197, 94, 0.15)'
                                            : 'rgba(40, 40, 40, 0.6)'
                                        }}
                                      >
                                        {user.status || "Unknown"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <UserX className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                            <p className="text-gray-400">No users started their day on this date</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
          </div>
          
          <DialogFooter 
            className="sticky bottom-0 z-10 border-t border-white/10 px-6 py-4 mt-auto"
            style={{
              background: 'rgba(30, 30, 30, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Close
            </Button>
            <Button 
              onClick={fetchReport} 
              disabled={isLoading}
              className="bg-gradient-to-br from-primary to-accent hover:opacity-90 text-white border-none shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh Data"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
      
      {/* Create Task Dialog */}
      <CreateTaskDialog 
        open={isCreateTaskOpen} 
        onOpenChange={(open) => {
          setIsCreateTaskOpen(open)
          if (!open) {
            setSelectedEmployeeId(null)
          }
        }}
        defaultAssignee={selectedEmployeeId}
      />
    </Dialog>
  )
}

