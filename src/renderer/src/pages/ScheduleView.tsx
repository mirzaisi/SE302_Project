import { useState, useEffect } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

interface Schedule {
  id: number
  name: string
  is_feasible: number
  total_violations: number
  created_at: string
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
  slot_name?: string
  start_time?: string
  end_time?: string
}

export function ScheduleView(): React.ReactNode {
  const [viewMode, setViewMode] = useState<'day' | 'course' | 'student' | 'classroom'>('day')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [scheduleData, setScheduleData] = useState<ScheduleAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDay, setFilterDay] = useState<number | null>(null)

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
                   ts.display_name as slot_name, ts.start_time, ts.end_time
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
                   cl.name as classroom_name,
                   ts.display_name as slot_name, ts.start_time, ts.end_time
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
                   cl.name as classroom_name,
                   ts.display_name as slot_name, ts.start_time, ts.end_time
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
                   cl.name as classroom_name,
                   ts.display_name as slot_name, ts.start_time, ts.end_time
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

    return filtered
  }

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">View Schedules</h1>
        <p className="text-gray-600 mt-2">
          View and analyze generated exam schedules from different perspectives
        </p>
      </div>

      {/* Schedule Selector */}
      {schedules.length > 0 && (
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Schedule</h2>
          <select
            value={selectedScheduleId || ''}
            onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
          >
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name} - {new Date(schedule.created_at).toLocaleString()}
                {schedule.is_feasible
                  ? ' (Feasible)'
                  : ` (${schedule.total_violations} violations)`}
              </option>
            ))}
          </select>
        </Card>
      )}

      {/* Search and Filter */}
      {schedules.length > 0 && (
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Search & Filter</h2>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by course or classroom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <select
              value={filterDay !== null ? filterDay : ''}
              onChange={(e) => setFilterDay(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Days</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setSearchTerm('')
                setFilterDay(null)
              }}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* View Mode Selector */}
      {schedules.length > 0 && (
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">View Mode</h2>
          <div className="flex space-x-2">
            {(['day', 'course', 'student', 'classroom'] as const).map((mode) => (
              <Button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={
                  viewMode === mode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} View
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Schedule Display */}
      <Card className="p-6 bg-white border border-gray-200 min-h-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
          </h2>
          {scheduleData.length > 0 && (
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Showing {filteredData.length} of {scheduleData.length} exams
            </span>
          )}
        </div>
        {schedules.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <p>No schedules generated yet.</p>
            <p className="text-sm mt-2">Generate a schedule first to view it here.</p>
          </div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                    Slot
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                    Classroom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">Day {row.day_number}</td>
                    <td className="px-4 py-2 text-sm">
                      {row.slot_name || `Slot ${row.slot_number}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {row.start_time && row.end_time ? `${row.start_time}-${row.end_time}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="font-medium">{row.course_code}</div>
                      <div className="text-xs text-gray-600">{row.course_name}</div>
                    </td>
                    <td className="px-4 py-2 text-sm">{row.classroom_name}</td>
                    <td className="px-4 py-2 text-sm">
                      {row.violation_type ? (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          {row.violation_type.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center text-gray-500 py-8">No results match your filters</div>
            )}
          </div>
        )}
      </Card>

      {/* Feasibility Summary */}
      {selectedSchedule && (
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Feasibility & Violations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Status:</span>
              <span
                className={`px-4 py-2 rounded-lg font-bold ${selectedSchedule.is_feasible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
              >
                {selectedSchedule.is_feasible ? 'Feasible Solution' : 'Has Violations'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Total Violations:</span>
              <span
                className={`font-bold text-2xl ${selectedSchedule.total_violations > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {selectedSchedule.total_violations}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Total Assignments:</span>
              <span className="font-bold text-2xl text-blue-600">{scheduleData.length}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
