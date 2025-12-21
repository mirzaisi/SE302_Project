import { useState, useEffect } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { generateSchedule } from '../services/scheduler'
import { useNavigate } from 'react-router-dom'

export function ScheduleGeneration(): React.ReactNode {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [scheduleName, setScheduleName] = useState(`Schedule ${new Date().toLocaleDateString()}`)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({
    classrooms: 0,
    courses: 0,
    students: 0,
    enrollments: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async (): Promise<void> => {
    try {
      const classrooms = await window.api.db.query('SELECT COUNT(*) as count FROM classrooms', [])
      const courses = await window.api.db.query('SELECT COUNT(*) as count FROM courses', [])
      const students = await window.api.db.query('SELECT COUNT(*) as count FROM students', [])
      const enrollments = await window.api.db.query('SELECT COUNT(*) as count FROM enrollments', [])

      const classroomCount = classrooms[0] as { count: unknown } | undefined
      const courseCount = courses[0] as { count: unknown } | undefined
      const studentCount = students[0] as { count: unknown } | undefined
      const enrollmentCount = enrollments[0] as { count: unknown } | undefined

      setStats({
        classrooms: (typeof classroomCount?.count === 'number' ? classroomCount.count : 0) || 0,
        courses: (typeof courseCount?.count === 'number' ? courseCount.count : 0) || 0,
        students: (typeof studentCount?.count === 'number' ? studentCount.count : 0) || 0,
        enrollments: (typeof enrollmentCount?.count === 'number' ? enrollmentCount.count : 0) || 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleGenerate = async (): Promise<void> => {
    setGenerating(true)
    setMessage('')

    try {
      // Load all data
      const coursesResult = await window.api.db.query('SELECT * FROM courses', [])
      const studentsResult = await window.api.db.query('SELECT * FROM students', [])
      const enrollmentsResult = await window.api.db.query('SELECT * FROM enrollments', [])
      const classroomsResult = await window.api.db.query('SELECT * FROM classrooms', [])
      const configResult = await window.api.db.get(
        'SELECT * FROM exam_period_config WHERE id = 1',
        []
      )
      const optimizationResult = await window.api.db.get(
        'SELECT * FROM optimization_settings WHERE id = 1',
        []
      )
      const relaxationsResult = await window.api.db.get(
        'SELECT * FROM constraint_relaxations WHERE id = 1',
        []
      )

      if (coursesResult.length === 0 || classroomsResult.length === 0) {
        setMessage('Error: Please import courses and classrooms first!')
        setGenerating(false)
        return
      }

      const config = configResult as
        | {
            id: number
            num_days: number
            slots_per_day: number
          }
        | undefined

      const optimization = optimizationResult as
        | {
            id: number
            balance_across_days: number
            minimize_days_used: number
            minimize_rooms_used: number
            place_difficult_early: number
            place_difficult_late: number
          }
        | undefined

      const relaxations = relaxationsResult as
        | {
            id: number
            allow_consecutive_slots: number
            max_consecutive_violations: number
            allow_three_per_day: number
            max_three_per_day_violations: number
            allow_capacity_overflow: number
            max_capacity_overflow_percent: number
          }
        | undefined

      if (!config || !optimization || !relaxations) {
        setMessage('Error: Configuration not found!')
        setGenerating(false)
        return
      }

      // Cast and convert database results to proper types
      const courses = coursesResult as Array<{ id: number; code: string; name: string }>
      const students = studentsResult as Array<{ id: number; student_id: string; name: string }>
      const enrollments = enrollmentsResult as Array<{ student_id: number; course_id: number }>
      const classrooms = classroomsResult as Array<{ id: number; name: string; capacity: number }>

      // Run scheduler
      const result = await generateSchedule(courses, students, enrollments, classrooms, {
        numDays: config.num_days,
        slotsPerDay: config.slots_per_day,
        optimization: {
          balance_across_days: !!optimization.balance_across_days,
          minimize_days_used: !!optimization.minimize_days_used,
          minimize_rooms_used: !!optimization.minimize_rooms_used,
          place_difficult_early: !!optimization.place_difficult_early,
          place_difficult_late: !!optimization.place_difficult_late
        },
        relaxations: {
          allow_consecutive_slots: !!relaxations.allow_consecutive_slots,
          max_consecutive_violations: relaxations.max_consecutive_violations,
          allow_three_per_day: !!relaxations.allow_three_per_day,
          max_three_per_day_violations: relaxations.max_three_per_day_violations,
          allow_capacity_overflow: !!relaxations.allow_capacity_overflow,
          max_capacity_overflow_percent: relaxations.max_capacity_overflow_percent
        }
      })

      // Save schedule to database (including detailed violations as JSON)
      await window.api.db.run(
        'INSERT INTO schedules (name, is_feasible, total_violations, violations_json) VALUES (?, ?, ?, ?)',
        [
          scheduleName,
          result.is_feasible ? 1 : 0,
          result.violations.reduce((sum, v) => sum + v.count, 0),
          JSON.stringify(result.violations)
        ]
      )

      // Get the ID of the just-inserted schedule
      const scheduleResult = await window.api.db.get(
        'SELECT id FROM schedules ORDER BY id DESC LIMIT 1',
        []
      )
      const schedule = scheduleResult as { id: number } | undefined
      const scheduleId = schedule?.id

      if (!scheduleId) {
        setMessage('Error: Could not get schedule ID!')
        setGenerating(false)
        return
      }

      // Save assignments
      for (const assignment of result.assignments) {
        await window.api.db.run(
          'INSERT INTO schedule_assignments (schedule_id, course_id, classroom_id, day_number, slot_number, violation_type) VALUES (?, ?, ?, ?, ?, ?)',
          [
            scheduleId,
            assignment.course_id,
            assignment.classroom_id,
            assignment.day_number,
            assignment.slot_number,
            assignment.violation_type || ''
          ]
        )
      }

      setMessage(
        `Successfully generated schedule! Assigned ${result.assignments.length}/${courses.length} courses. ${result.is_feasible ? 'Feasible solution found!' : `${result.violations.length} violation types.`}`
      )

      // Navigate to view page after a delay
      setTimeout(() => {
        navigate('/view')
      }, 2000)
    } catch (error) {
      console.error('Failed to generate schedule:', error)
      setMessage('Error generating schedule: ' + error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Generate Schedule</h1>
        <p className="text-gray-600 mt-2">
          Generate exam schedules based on your data and configuration
        </p>
      </div>

      <Card className="p-6 bg-white border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Data Check</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.classrooms}</div>
            <div className="text-sm text-blue-700 font-medium mt-1">Classrooms</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.courses}</div>
            <div className="text-sm text-green-700 font-medium mt-1">Courses</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.students}</div>
            <div className="text-sm text-purple-700 font-medium mt-1">Students</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.enrollments}</div>
            <div className="text-sm text-orange-700 font-medium mt-1">Enrollments</div>
          </div>
        </div>
        <div className="space-y-3">
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg ${stats.classrooms > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <span
              className={`text-lg font-bold ${stats.classrooms > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {stats.classrooms > 0 ? '✓' : '✗'}
            </span>
            <span
              className={`font-medium ${stats.classrooms > 0 ? 'text-green-800' : 'text-red-800'}`}
            >
              Classrooms imported
            </span>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg ${stats.courses > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <span
              className={`text-lg font-bold ${stats.courses > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {stats.courses > 0 ? '✓' : '✗'}
            </span>
            <span
              className={`font-medium ${stats.courses > 0 ? 'text-green-800' : 'text-red-800'}`}
            >
              Courses imported
            </span>
          </div>
          <div
            className={`flex items-center space-x-3 p-3 rounded-lg ${stats.students > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}
          >
            <span
              className={`text-lg font-bold ${stats.students > 0 ? 'text-green-600' : 'text-yellow-600'}`}
            >
              {stats.students > 0 ? '✓' : '⚠'}
            </span>
            <span
              className={`font-medium ${stats.students > 0 ? 'text-green-800' : 'text-yellow-800'}`}
            >
              Students imported (optional for basic scheduling)
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Name</label>
          <Input
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            placeholder="Enter schedule name"
            className="max-w-md"
          />
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Schedule</h2>
        <Button
          onClick={handleGenerate}
          disabled={generating || stats.courses === 0 || stats.classrooms === 0}
          className="bg-green-600 hover:bg-green-700 w-full h-16 text-lg"
        >
          {generating ? 'Generating Schedule...' : 'Generate Exam Schedule'}
        </Button>
        {message && (
          <div
            className={`mt-4 px-4 py-2 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {message}
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          The algorithm will assign exams to time slots while respecting fairness constraints (no
          consecutive exams, max 2 per day) and capacity limits. Relaxations configured in
          Configuration page will be applied if needed.
        </p>
      </Card>
    </div>
  )
}
