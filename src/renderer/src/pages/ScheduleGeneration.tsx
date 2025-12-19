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