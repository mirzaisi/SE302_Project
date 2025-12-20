import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to ExamFlow - Exam Scheduling System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Classrooms</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.classrooms}</div>
        </Card>
        <Card className="p-6 bg-white">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Courses</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.courses}</div>
        </Card>
        <Card className="p-6 bg-white">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Students</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{stats.students}</div>
        </Card>
        <Card className="p-6 bg-white">
          <div className="text-sm text-gray-500 uppercase tracking-wide">Schedules</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{stats.schedules}</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/data')}
            className="bg-blue-500 hover:bg-blue-600 h-24 text-lg"
          >
            Import/Export Data
          </Button>
          <Button
            onClick={() => navigate('/config')}
            className="bg-indigo-500 hover:bg-indigo-600 h-24 text-lg"
          >
            Configure Exam Period
          </Button>
          <Button
            onClick={() => navigate('/generate')}
            className="bg-green-500 hover:bg-green-600 h-24 text-lg"
          >
            Generate Schedule
          </Button>
          <Button
            onClick={() => navigate('/view')}
            className="bg-purple-500 hover:bg-purple-600 h-24 text-lg"
          >
            View Schedules
          </Button>
          <Button
            onClick={() => navigate('/help')}
            className="bg-gray-500 hover:bg-gray-600 h-24 text-lg"
          >
            Help & Documentation
          </Button>
        </div>
      </Card>

      {/* Getting Started */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Import your data (classrooms, courses, students, enrollments)</li>
          <li>Configure the exam period (number of days and time slots)</li>
          <li>Set optimization goals and constraint relaxations</li>
          <li>Generate exam schedules</li>
          <li>View and analyze the generated schedules</li>
          <li>Export schedules for distribution</li>
        </ol>
      </Card>
    </div>
  )
}
