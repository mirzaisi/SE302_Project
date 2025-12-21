import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  BookOpen,
  Users,
  CalendarDays,
  Upload,
  Settings,
  Sparkles,
  Eye,
  HelpCircle,
  CheckCircle2
} from 'lucide-react'

// shut up tslint
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    classrooms: 0,
    courses: 0,
    students: 0,
    schedules: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async (): Promise<void> => {
    try {
      const classrooms = await window.api.db.query('SELECT COUNT(*) as count FROM classrooms', [])
      const courses = await window.api.db.query('SELECT COUNT(*) as count FROM courses', [])
      const students = await window.api.db.query('SELECT COUNT(*) as count FROM students', [])
      const schedules = await window.api.db.query('SELECT COUNT(*) as count FROM schedules', [])

      const classroomCount = classrooms[0] as { count: unknown } | undefined
      const courseCount = courses[0] as { count: unknown } | undefined
      const studentCount = students[0] as { count: unknown } | undefined
      const scheduleCount = schedules[0] as { count: unknown } | undefined

      setStats({
        classrooms: (typeof classroomCount?.count === 'number' ? classroomCount.count : 0) || 0,
        courses: (typeof courseCount?.count === 'number' ? courseCount.count : 0) || 0,
        students: (typeof studentCount?.count === 'number' ? studentCount.count : 0) || 0,
        schedules: (typeof scheduleCount?.count === 'number' ? scheduleCount.count : 0) || 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome to ExamFlow — Your intelligent exam scheduling assistant
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                Classrooms
              </div>
              <div className="text-4xl font-bold text-blue-600 mt-2">{stats.classrooms}</div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                Courses
              </div>
              <div className="text-4xl font-bold text-green-600 mt-2">{stats.courses}</div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                Students
              </div>
              <div className="text-4xl font-bold text-purple-600 mt-2">{stats.students}</div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                Schedules
              </div>
              <div className="text-4xl font-bold text-orange-600 mt-2">{stats.schedules}</div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/data')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-20 text-lg shadow-lg shadow-blue-500/25 flex items-center gap-3"
          >
            <Upload className="h-6 w-6" />
            Import/Export Data
          </Button>
          <Button
            onClick={() => navigate('/config')}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 h-20 text-lg shadow-lg shadow-indigo-500/25 flex items-center gap-3"
          >
            <Settings className="h-6 w-6" />
            Configure Exam Period
          </Button>
          <Button
            onClick={() => navigate('/generate')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-20 text-lg shadow-lg shadow-green-500/25 flex items-center gap-3"
          >
            <Sparkles className="h-6 w-6" />
            Generate Schedule
          </Button>
          <Button
            onClick={() => navigate('/view')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-20 text-lg shadow-lg shadow-purple-500/25 flex items-center gap-3"
          >
            <Eye className="h-6 w-6" />
            View Schedules
          </Button>
          <Button
            onClick={() => navigate('/help')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 h-20 text-lg shadow-lg shadow-gray-500/25 flex items-center gap-3"
          >
            <HelpCircle className="h-6 w-6" />
            Help & Documentation
          </Button>
        </div>
      </Card>

      {/* Getting Started */}
      <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Getting Started</h2>
        <div className="space-y-4">
          {[
            'Import your data (classrooms, courses, students, enrollments)',
            'Configure the exam period (number of days and time slots)',
            'Set optimization goals and constraint relaxations',
            'Generate exam schedules',
            'View and analyze the generated schedules',
            'Export schedules for distribution'
          ].map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {index + 1}
              </div>
              <span className="text-gray-700 font-medium">{step}</span>
              <CheckCircle2 className="h-5 w-5 text-gray-300 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
