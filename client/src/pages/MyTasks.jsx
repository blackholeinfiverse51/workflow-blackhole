"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Progress } from "../components/ui/progress"
import { Input } from "../components/ui/input"
import {
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  Github,
  ExternalLink,
  FileText,
  Search,
  RefreshCw,
  Eye,
  ListTodo,
  CheckSquare,
  Timer,
} from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../context/auth-context"
import { API_URL } from "@/lib/api"
import axios from "axios"
import { TaskSubmissionDialog } from "../components/tasks/task-submission-dialog"

function MyTasks() {
  const navigate = useNavigate()
  const { toast } = useToast()
  useAuth()
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState(null)
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)

  useEffect(() => {
    fetchMyTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMyTasks = async () => {
    const storedUser = JSON.parse(localStorage.getItem("WorkflowUser"))
    if (!storedUser?.id) {
      console.error("User ID is undefined")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem("WorkflowToken")

      // Fetch user's tasks
      const tasksResponse = await axios.get(`${API_URL}/users/${storedUser.id}/tasks`, {
        headers: { "x-auth-token": token },
      })

      const userTasks = tasksResponse.data || []
      setTasks(userTasks)

      // Fetch submissions for each task
      const submissionsMap = {}
      for (const task of userTasks) {
        try {
          const submissionResponse = await axios.get(`${API_URL}/submissions/task/${task._id}`, {
            headers: { "x-auth-token": token },
          })
          if (submissionResponse.data) {
            submissionsMap[task._id] = submissionResponse.data
          }
        } catch {
          // No submission for this task
        }
      }
      setSubmissions(submissionsMap)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load your tasks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "In Progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "Medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSubmitTask = async (submissionData) => {
    try {
      const token = localStorage.getItem("WorkflowToken")
      const config = {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      }

      submissionData.append("task", selectedTask._id)

      const existingSubmission = submissions[selectedTask._id]
      
      if (existingSubmission) {
        await axios.put(`${API_URL}/submissions/${existingSubmission._id}`, submissionData, config)
        toast({
          title: "Success",
          description: "Your submission has been updated",
        })
      } else {
        await axios.post(`${API_URL}/submissions`, submissionData, config)
        toast({
          title: "Success",
          description: "Your task has been submitted successfully",
        })
      }

      setIsSubmissionDialogOpen(false)
      fetchMyTasks()
    } catch (error) {
      console.error("Error submitting task:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to submit task",
        variant: "destructive",
      })
    }
  }

  const openSubmissionDialog = (task) => {
    setSelectedTask(task)
    setIsSubmissionDialogOpen(true)
  }

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    const hasSubmission = !!submissions[task._id]
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    switch (activeTab) {
      case "submitted":
        return hasSubmission
      case "pending":
        return task.status === "Pending" && !hasSubmission
      case "inprogress":
        return task.status === "In Progress"
      case "completed":
        return task.status === "Completed"
      default:
        return true
    }
  })

  // Stats
  const stats = {
    total: tasks.length,
    submitted: tasks.filter(t => submissions[t._id]).length,
    pending: tasks.filter(t => t.status === "Pending" && !submissions[t._id]).length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">Manage and track all your assigned tasks</p>
        </div>
        <Button onClick={fetchMyTasks} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("all")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("inprogress")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Timer className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("submitted")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.submitted}</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("completed")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({stats.submitted})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => {
                const submission = submissions[task._id]
                const daysRemaining = getDaysRemaining(task.dueDate)

                return (
                  <Card key={task._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Task Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {task.description}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{task.progress || 0}%</span>
                            </div>
                            <Progress value={task.progress || 0} className="h-2" />
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              {daysRemaining <= 2 && daysRemaining >= 0 && (
                                <Badge variant="destructive" className="ml-1 text-xs">
                                  {daysRemaining === 0 ? "Due Today" : `${daysRemaining}d left`}
                                </Badge>
                              )}
                              {daysRemaining < 0 && (
                                <Badge variant="destructive" className="ml-1 text-xs">Overdue</Badge>
                              )}
                            </div>
                            {task.department && (
                              <div className="flex items-center gap-1">
                                <span>Dept: {task.department.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Submission Info */}
                          {submission && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckSquare className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Submitted</span>
                                {submission.status && (
                                  <Badge className={submission.status === "Approved" ? "bg-green-500/10 text-green-500" : submission.status === "Rejected" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}>
                                    {submission.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm">
                                {submission.githubLink && (
                                  <a
                                    href={submission.githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-500 hover:underline"
                                  >
                                    <Github className="h-3 w-3" />
                                    Repository
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                {submission.documentLink && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    Document attached
                                  </span>
                                )}
                              </div>
                              {submission.feedback && (
                                <div className="mt-2 p-2 bg-background rounded text-sm">
                                  <span className="font-medium">Feedback: </span>
                                  <span className="text-muted-foreground">{submission.feedback}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-2 lg:w-32">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/tasks/${task._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => openSubmissionDialog(task)}
                          >
                            {submission ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Update
                              </>
                            ) : (
                              <>
                                <CheckSquare className="h-4 w-4 mr-1" />
                                Submit
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submission Dialog */}
      {selectedTask && (
        <TaskSubmissionDialog
          open={isSubmissionDialogOpen}
          onOpenChange={setIsSubmissionDialogOpen}
          onSubmit={handleSubmitTask}
          existingSubmission={submissions[selectedTask._id]}
        />
      )}
    </div>
  )
}

export default MyTasks
