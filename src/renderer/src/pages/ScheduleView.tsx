import { useState, useEffect } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Eye,
  Calendar,
  BookOpen,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  BarChart3,
  Clock,
  Info,
  HelpCircle
} from 'lucide-react'

interface Schedule {
  id: number
  name: string
  is_feasible: number
  total_violations: number
  violations_json?: string
  created_at: string
}

// Parsed violation detail from stored JSON
interface ViolationDetail {
  type: string
  description: string
  count: number
}

interface ScheduleAssignment {
  id: number
  schedule_id: number
  course_id: number
  classroom_id: number
  day_number: number
  slot_number: number
  violation_type: string | null
  course_code: string
  course_name: string
  classroom_name: string
  capacity?: number
  student_count?: number
  slot_name?: string
  start_time?: string
  end_time?: string
}

interface ViolationSummary {
  consecutive_slots: number
  three_per_day: number
  capacity_overflow: number
  other: number
}

// View mode descriptions
const VIEW_MODE_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  day: {
    title: 'Day View',
    description:
      'See exams organized by day, useful for understanding daily exam load and distribution.'
  },
  course: {
    title: 'Course View',
    description:
      'View exams sorted alphabetically by course code, ideal for finding when a specific course is scheduled.'
  },
  student: {
    title: 'Student View',
    description:
      'Analyze the schedule from a student perspective, helping identify potential conflicts.'
  },
  classroom: {
    title: 'Classroom View',
    description: 'See how classrooms are utilized across the exam period, grouped by room.'
  }
}

export function ScheduleView(): React.ReactNode {
  const [viewMode, setViewMode] = useState<'day' | 'course' | 'student' | 'classroom'>('day')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [scheduleData, setScheduleData] = useState<ScheduleAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<number | null>(null)
  const [showOnlyViolations, setShowOnlyViolations] = useState(false)

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const result = await window.api.db.query(
          'SELECT * FROM schedules ORDER BY created_at DESC',
          []
        )
        const schedules = result as unknown as Schedule[]
        setSchedules(schedules)
        if (schedules.length > 0 && !selectedScheduleId) {
          setSelectedScheduleId(schedules[0].id)
        }
      } catch (error) {
        console.error('Failed to load schedules:', error)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!selectedScheduleId) return

      try {
        let query = ''
        switch (viewMode) {
          case 'day':
            query = `
            SELECT sa.*, c.code as course_code, c.name as course_name,
                   cl.name as classroom_name, cl.capacity,
                   ts.display_name as slot_name, ts.start_time, ts.end_time,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
            FROM schedule_assignments sa
            JOIN courses c ON sa.course_id = c.id
            JOIN classrooms cl ON sa.classroom_id = cl.id
            LEFT JOIN time_slots ts ON sa.day_number = ts.day_number AND sa.slot_number = ts.slot_number
            WHERE sa.schedule_id = ?
            ORDER BY sa.day_number, sa.slot_number
          `
            break
          case 'course':
            query = `
            SELECT sa.*, c.code as course_code, c.name as course_name,
                   cl.name as classroom_name, cl.capacity,
                   ts.display_name as slot_name, ts.start_time, ts.end_time,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
            FROM schedule_assignments sa
            JOIN courses c ON sa.course_id = c.id
            JOIN classrooms cl ON sa.classroom_id = cl.id
            LEFT JOIN time_slots ts ON sa.day_number = ts.day_number AND sa.slot_number = ts.slot_number
            WHERE sa.schedule_id = ?
            ORDER BY c.code
          `
            break
          case 'classroom':
            query = `
            SELECT sa.*, c.code as course_code, c.name as course_name,
                   cl.name as classroom_name, cl.capacity,
                   ts.display_name as slot_name, ts.start_time, ts.end_time,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
            FROM schedule_assignments sa
            JOIN courses c ON sa.course_id = c.id
            JOIN classrooms cl ON sa.classroom_id = cl.id
            LEFT JOIN time_slots ts ON sa.day_number = ts.day_number AND sa.slot_number = ts.slot_number
            WHERE sa.schedule_id = ?
            ORDER BY cl.name, sa.day_number, sa.slot_number
          `
            break
          default:
            query = `
            SELECT sa.*, c.code as course_code, c.name as course_name,
                   cl.name as classroom_name, cl.capacity,
                   ts.display_name as slot_name, ts.start_time, ts.end_time,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
            FROM schedule_assignments sa
            JOIN courses c ON sa.course_id = c.id
            JOIN classrooms cl ON sa.classroom_id = cl.id
            LEFT JOIN time_slots ts ON sa.day_number = ts.day_number AND sa.slot_number = ts.slot_number
            WHERE sa.schedule_id = ?
          `
        }

        const result = await window.api.db.query(query, [selectedScheduleId])
        const data = result as unknown as ScheduleAssignment[]
        setScheduleData(data)
      } catch (error) {
        console.error('Failed to load schedule data:', error)
      }
    }

    load()
  }, [selectedScheduleId, viewMode])

  // Helper: Check if an assignment has any violation (including derived capacity violations)
  const hasViolation = (item: ScheduleAssignment): boolean => {
    // Check for explicit violation_type (non-null and non-empty)
    if (item.violation_type && item.violation_type.trim() !== '') return true
    // Check for capacity overflow (student_count > capacity)
    if (item.student_count && item.capacity && item.student_count > item.capacity) return true
    return false
  }

  // Helper: Get violation type display for an item
  const getViolationDisplay = (item: ScheduleAssignment): string | null => {
    // Check for explicit violation_type (non-null and non-empty)
    if (item.violation_type && item.violation_type.trim() !== '') return item.violation_type
    // Check for capacity overflow
    if (item.student_count && item.capacity && item.student_count > item.capacity) {
      return 'capacity_overflow'
    }
    return null
  }

  // Count how many assignments have detectable violations
  const getAssignmentViolationCount = (): number => {
    return scheduleData.filter((item) => hasViolation(item)).length
  }

  const getFilteredData = (): ScheduleAssignment[] => {
    let filtered = scheduleData

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.classroom_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterDay !== null) {
      filtered = filtered.filter((item) => item.day_number === filterDay)
    }

    if (showOnlyViolations) {
      filtered = filtered.filter((item) => hasViolation(item))
    }

    return filtered
  }

  const getViolationSummary = (): ViolationSummary => {
    const summary: ViolationSummary = {
      consecutive_slots: 0,
      three_per_day: 0,
      capacity_overflow: 0,
      other: 0
    }

    scheduleData.forEach((item) => {
      const violationType = getViolationDisplay(item)
      if (violationType) {
        if (violationType.includes('consecutive')) {
          summary.consecutive_slots++
        } else if (violationType.includes('three') || violationType.includes('3')) {
          summary.three_per_day++
        } else if (violationType.includes('capacity') || violationType.includes('overflow')) {
          summary.capacity_overflow++
        } else {
          summary.other++
        }
      }
    })

    return summary
  }

  const getUniqueDays = (): number[] => {
    const days = [...new Set(scheduleData.map((item) => item.day_number))]
    return days.sort((a, b) => a - b)
  }

  const getUniqueClassrooms = (): string[] => {
    return [...new Set(scheduleData.map((item) => item.classroom_name))].sort()
  }

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const filteredData = getFilteredData()
  const violationSummary = getViolationSummary()
  const uniqueDays = getUniqueDays()
  const uniqueClassrooms = getUniqueClassrooms()

  // Parse stored violations from JSON
  const getStoredViolations = (): ViolationDetail[] => {
    if (!selectedSchedule?.violations_json) return []
    try {
      return JSON.parse(selectedSchedule.violations_json) as ViolationDetail[]
    } catch {
      return []
    }
  }

  const storedViolations = getStoredViolations()

  // Get icon and color for violation type
  const getViolationStyle = (
    type: string
  ): { icon: typeof Clock; bgColor: string; textColor: string; borderColor: string } => {
    if (type.includes('consecutive')) {
      return {
        icon: Clock,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-200'
      }
    }
    if (type.includes('three') || type.includes('day')) {
      return {
        icon: Calendar,
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      }
    }
    if (type.includes('capacity') || type.includes('overflow')) {
      return {
        icon: Users,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200'
      }
    }
    if (type.includes('unassigned')) {
      return {
        icon: XCircle,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200'
      }
    }
    return {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    }
  }

  const viewModeConfig = [
    { mode: 'day' as const, label: 'Day', icon: Calendar },
    { mode: 'course' as const, label: 'Course', icon: BookOpen },
    { mode: 'student' as const, label: 'Student', icon: Users },
    { mode: 'classroom' as const, label: 'Classroom', icon: Building2 }
  ]

  return (
    <div className="space-y-10 max-w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Eye className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">View Schedules</h1>
          <p className="text-sm text-gray-500">Analyze generated exam schedules</p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card className="p-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Schedules Generated</h2>
          <p className="text-gray-500">Generate a schedule first to view and analyze it here.</p>
        </Card>
      ) : (
        <>
          {/* Schedule Selector and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-gray-800">Select Schedule</h2>
              </div>
              <select
                value={selectedScheduleId || ''}
                onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} — {new Date(schedule.created_at).toLocaleString()}
                    {schedule.is_feasible
                      ? ' ✓ Feasible'
                      : ` ⚠ ${schedule.total_violations} violations`}
                  </option>
                ))}
              </select>
            </Card>

            {/* Quick Status */}
            {selectedSchedule && (
              <Card
                className={`p-5 border-0 shadow-lg ${selectedSchedule.is_feasible ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-yellow-50 to-orange-100'}`}
              >
                <div className="flex items-center justify-between h-full">
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Status</div>
                    <div
                      className={`text-lg font-bold ${selectedSchedule.is_feasible ? 'text-green-700' : 'text-yellow-700'}`}
                    >
                      {selectedSchedule.is_feasible ? 'Feasible' : 'Has Violations'}
                    </div>
                  </div>
                  {selectedSchedule.is_feasible ? (
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-10 w-10 text-yellow-500" />
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{scheduleData.length}</div>
                  <div className="text-xs text-gray-500">Total Exams</div>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{uniqueDays.length}</div>
                  <div className="text-xs text-gray-500">Days Used</div>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{uniqueClassrooms.length}</div>
                  <div className="text-xs text-gray-500">Rooms Used</div>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-lg ${selectedSchedule?.total_violations ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center`}
                >
                  {selectedSchedule?.total_violations ? (
                    <XCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${selectedSchedule?.total_violations ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {selectedSchedule?.total_violations || 0}
                  </div>
                  <div className="text-xs text-gray-500">Violations</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Violation Details (if any) */}
          {selectedSchedule && selectedSchedule.total_violations > 0 && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold text-gray-800 text-lg">
                  Violation Details ({selectedSchedule.total_violations} total)
                </h2>
              </div>

              {storedViolations.length > 0 ? (
                <div className="space-y-5">
                  {storedViolations.map((violation, index) => {
                    const style = getViolationStyle(violation.type)
                    const IconComponent = style.icon
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${style.bgColor} border ${style.borderColor}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-10 w-10 rounded-lg ${style.bgColor} border ${style.borderColor} flex items-center justify-center`}
                            >
                              <IconComponent className={`h-5 w-5 ${style.textColor}`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${style.textColor} capitalize`}>
                                {violation.type.replace(/_/g, ' ')}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${style.textColor}`}>
                              {violation.count}
                            </div>
                            <div className="text-xs text-gray-500">affected</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Fallback: Show computed violations from assignment data */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Consecutive</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {violationSummary.consecutive_slots}
                    </div>
                    <div className="text-xs text-orange-600/70">Back-to-back exams</div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">3+ Per Day</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {violationSummary.three_per_day}
                    </div>
                    <div className="text-xs text-red-600/70">Too many in one day</div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Capacity</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {violationSummary.capacity_overflow}
                    </div>
                    <div className="text-xs text-purple-600/70">Room overflow</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Other</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">{violationSummary.other}</div>
                    <div className="text-xs text-gray-600/70">Other issues</div>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">Understanding These Violations</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      These counts represent <strong>student-level conflicts</strong>. For example,
                      if 80 students have consecutive exams, the count shows 80. The scheduler
                      allowed these violations based on your relaxation settings. In the exam table
                      below, only {getAssignmentViolationCount()} individual exam slots are marked
                      as directly causing issues.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* View Mode Description */}
          <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
            <div className="flex items-start gap-4">
              <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  {VIEW_MODE_DESCRIPTIONS[viewMode].title}
                </h3>
                <p className="text-sm text-blue-600/80">
                  {VIEW_MODE_DESCRIPTIONS[viewMode].description}
                </p>
              </div>
            </div>
          </Card>

          {/* Search, Filter, and View Mode */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex flex-wrap items-center gap-5">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses or rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Day Filter */}
              <select
                value={filterDay !== null ? filterDay : ''}
                onChange={(e) => setFilterDay(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm"
              >
                <option value="">All Days</option>
                {uniqueDays.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>

              {/* Show Only Violations */}
              <Button
                size="sm"
                onClick={() => setShowOnlyViolations(!showOnlyViolations)}
                className={
                  showOnlyViolations
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Violations Only
              </Button>

              {/* Clear */}
              <Button
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilterDay(null)
                  setShowOnlyViolations(false)
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Clear
              </Button>

              {/* Separator */}
              <div className="h-8 w-px bg-gray-200 mx-2" />

              {/* View Mode */}
              {viewModeConfig.map((config) => {
                const Icon = config.icon
                return (
                  <Button
                    key={config.mode}
                    size="sm"
                    onClick={() => setViewMode(config.mode)}
                    className={
                      viewMode === config.mode
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {config.label}
                  </Button>
                )
              })}
            </div>
          </Card>

          {/* Schedule Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <h2 className="font-semibold text-gray-800">
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
                </h2>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredData.length} of {scheduleData.length} exams
              </span>
            </div>
            <div className="overflow-auto max-h-[400px]">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Slot
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((row, index) => {
                    const violationType = getViolationDisplay(row)
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-blue-50/50 transition-colors ${violationType ? 'bg-yellow-50/50' : ''}`}
                      >
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-medium text-xs">
                            Day {row.day_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {row.slot_name || `Slot ${row.slot_number}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {row.start_time && row.end_time ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {row.start_time}–{row.end_time}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-800">{row.course_code}</div>
                          <div className="text-xs text-gray-500">{row.course_name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-gray-700">{row.classroom_name}</span>
                          {row.student_count && row.capacity && (
                            <div
                              className={`text-xs ${row.student_count > row.capacity ? 'text-red-500 font-medium' : 'text-gray-400'}`}
                            >
                              {row.student_count}/{row.capacity} students
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {violationType ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              {violationType.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <Filter className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  {showOnlyViolations ? (
                    <>
                      <p className="font-medium">No exam-level violations found</p>
                      <p className="text-sm mt-1">
                        Violations may be at the student level (e.g., back-to-back exams).
                        <br />
                        Check the violation summary above for details.
                      </p>
                    </>
                  ) : (
                    <p>No results match your filters</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Understanding Violations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <span className="font-medium text-orange-800">Consecutive Slots</span>
                  <p className="text-xs text-orange-600">
                    Student has back-to-back exams with no break
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                <Calendar className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium text-red-800">3+ Per Day</span>
                  <p className="text-xs text-red-600">Student has three or more exams in one day</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
                <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <span className="font-medium text-purple-800">Capacity Overflow</span>
                  <p className="text-xs text-purple-600">
                    Room capacity exceeded by enrolled students
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
