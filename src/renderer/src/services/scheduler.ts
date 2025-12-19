interface Course {
  id: number
  code: string
  name: string
}

interface Student {
  id: number
  student_id: string
  name: string
}

interface Enrollment {
  student_id: number
  course_id: number
}

interface Classroom {
  id: number
  name: string
  capacity: number
}

interface Assignment {
  course_id: number
  classroom_id: number
  day_number: number
  slot_number: number
  violation_type: string | null
}

interface OptimizationSettings {
  balance_across_days: boolean
  minimize_days_used: boolean
  minimize_rooms_used: boolean
  place_difficult_early: boolean
  place_difficult_late: boolean
}

interface ConstraintRelaxations {
  allow_consecutive_slots: boolean
  max_consecutive_violations: number
  allow_three_per_day: boolean
  max_three_per_day_violations: number
  allow_capacity_overflow: boolean
  max_capacity_overflow_percent: number
}

interface SchedulerConfig {
  numDays: number
  slotsPerDay: number
  optimization: OptimizationSettings
  relaxations: ConstraintRelaxations
}

interface ScheduleResult {
  assignments: Assignment[]
  violations: Array<{
    type: string
    description: string
    count: number
  }>
  is_feasible: boolean
}

export async function generateSchedule(
  courses: Course[],
  _students: Student[],
  enrollments: Enrollment[],
  classrooms: Classroom[],
  config: SchedulerConfig
): Promise<ScheduleResult> {
  const assignments: Assignment[] = []
  const violations: Array<{ type: string; description: string; count: number }> = []

  // Build enrollment map: course -> students
  const courseStudents = new Map<number, Set<number>>()
  enrollments.forEach((e) => {
    if (!courseStudents.has(e.course_id)) {
      courseStudents.set(e.course_id, new Set())
    }
    courseStudents.get(e.course_id)!.add(e.student_id)
  })

  // Calculate course sizes
  const courseSizes = courses.map((c) => ({
    course: c,
    studentCount: courseStudents.get(c.id)?.size || 0
  }))

  // Sort courses based on optimization goals
  if (config.optimization.place_difficult_early) {
    // Difficult courses (more students) first
    courseSizes.sort((a, b) => b.studentCount - a.studentCount)
  } else if (config.optimization.place_difficult_late) {
    // Easy courses (fewer students) first
    courseSizes.sort((a, b) => a.studentCount - b.studentCount)
  }

  // Track assignments: "day-slot" -> course_id
  const schedule = new Map<string, number>()

  // Track student exams: student_id -> [{day, slot}]
  const studentExams = new Map<number, Array<{ day: number; slot: number }>>()

  // Track room usage: classroom_id -> count
  const roomUsage = new Map<number, number>()

  // Track days used
  const daysUsed = new Set<number>()

  let consecutiveViolations = 0
  let threePerDayViolations = 0
  let capacityViolations = 0
  
  // Helper: Get day with least exams (for balance)
  const getDayWithLeastExams = (): number => {
    const dayCount = new Map<number, number>()
    for (let day = 1; day <= config.numDays; day++) {
      dayCount.set(day, 0)
    }
    for (const [key] of schedule) {
      const day = parseInt(key.split('-')[0])
      dayCount.set(day, (dayCount.get(day) || 0) + 1)
    }

    let minDay = 1
    let minCount = dayCount.get(1) || 0
    for (let day = 2; day <= config.numDays; day++) {
      const count = dayCount.get(day) || 0
      if (count < minCount) {
        minDay = day
        minCount = count
      }
    }
    return minDay
  }

  // Helper: Select classroom based on minimize_rooms_used
  const selectClassroom = (studentCount: number): Classroom | null => {
    if (config.optimization.minimize_rooms_used) {
      // Try to reuse already-used rooms first
      const usedRooms = Array.from(roomUsage.keys())
        .map((id) => classrooms.find((c) => c.id === id))
        .filter((c) => c && c.capacity >= studentCount)
        .sort((a, b) => (roomUsage.get(b!.id) || 0) - (roomUsage.get(a!.id) || 0))

      if (usedRooms.length > 0 && usedRooms[0]) {
        return usedRooms[0]
      }
    }

    // Find smallest suitable room
    const suitableRooms = classrooms
      .filter((c) => c.capacity >= studentCount)
      .sort((a, b) => a.capacity - b.capacity)

    return suitableRooms[0] || null
  }

  // Main scheduling loop
  for (const { course, studentCount } of courseSizes) {
    let assigned = false
    const students = courseStudents.get(course.id) || new Set()

    // Determine day order based on optimization goals
    let dayOrder: number[] = []

    if (config.optimization.balance_across_days) {
      // Start with day that has least exams, then round-robin
      const startDay = getDayWithLeastExams()
      for (let i = 0; i < config.numDays; i++) {
        dayOrder.push(((startDay - 1 + i) % config.numDays) + 1)
      }
    } else if (config.optimization.minimize_days_used) {
      // Try to fill currently used days first
      if (daysUsed.size > 0) {
        dayOrder = Array.from(daysUsed).sort((a, b) => a - b)
        // Then try next unused day
        for (let day = 1; day <= config.numDays; day++) {
          if (!daysUsed.has(day)) {
            dayOrder.push(day)
          }
        }
      } else {
        dayOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, config.numDays)
      }
    } else {
      // Default: sequential order
      dayOrder = Array.from({ length: config.numDays }, (_, i) => i + 1)
    }

    // Try to assign course to a slot
    dayLoop: for (const day of dayOrder) {
      for (let slot = 1; slot <= config.slotsPerDay; slot++) {
        const key = `${day}-${slot}`

        // Check if slot is already taken
        if (schedule.has(key)) continue

        // Check constraints for all students in this course
        let hasConflict = false
        let wouldViolateConsecutive = false
        let wouldViolateThreePerDay = false

        for (const studentId of students) {
          const exams = studentExams.get(studentId) || []

          // HARD CONSTRAINT: Same time conflict (cannot relax)
          if (exams.some((e) => e.day === day && e.slot === slot)) {
            hasConflict = true
            break
          }

          // SOFT CONSTRAINT: Consecutive slots
          if (exams.some((e) => e.day === day && Math.abs(e.slot - slot) === 1)) {
            if (!config.relaxations.allow_consecutive_slots) {
              wouldViolateConsecutive = true
            } else if (consecutiveViolations >= config.relaxations.max_consecutive_violations) {
              wouldViolateConsecutive = true
            }
          }

          // SOFT CONSTRAINT: Max 2 exams per day
          const examsOnDay = exams.filter((e) => e.day === day).length
          if (examsOnDay >= 2) {
            if (!config.relaxations.allow_three_per_day) {
              wouldViolateThreePerDay = true
            } else if (threePerDayViolations >= config.relaxations.max_three_per_day_violations) {
              wouldViolateThreePerDay = true
            }
          }
        }

        // Skip if hard conflict
        if (hasConflict) continue

        // Skip if soft constraint violated and can't relax
        if (wouldViolateConsecutive && !config.relaxations.allow_consecutive_slots) continue
        if (wouldViolateThreePerDay && !config.relaxations.allow_three_per_day) continue

        // Find suitable classroom
        let selectedClassroom = selectClassroom(studentCount)

        // SOFT CONSTRAINT: Capacity overflow
        if (!selectedClassroom && config.relaxations.allow_capacity_overflow) {
          const largestRoom = [...classrooms].sort((a, b) => b.capacity - a.capacity)[0]
          if (largestRoom) {
            const overflow = ((studentCount - largestRoom.capacity) / largestRoom.capacity) * 100
            if (overflow <= config.relaxations.max_capacity_overflow_percent) {
              selectedClassroom = largestRoom
              capacityViolations++
            }
          }
        }

        if (!selectedClassroom) continue

        // Track violations
        let violationType: string | null = null
        if (wouldViolateConsecutive && config.relaxations.allow_consecutive_slots) {
          consecutiveViolations++
          violationType = 'consecutive_slots'
        }
        if (wouldViolateThreePerDay && config.relaxations.allow_three_per_day) {
          threePerDayViolations++
          violationType = 'three_per_day'
        }

        // Assign exam
        schedule.set(key, course.id)
        daysUsed.add(day)
        roomUsage.set(selectedClassroom.id, (roomUsage.get(selectedClassroom.id) || 0) + 1)

        assignments.push({
          course_id: course.id,
          classroom_id: selectedClassroom.id,
          day_number: day,
          slot_number: slot,
          violation_type: violationType
        })

        // Update student exam records
        for (const studentId of students) {
          if (!studentExams.has(studentId)) {
            studentExams.set(studentId, [])
          }
          studentExams.get(studentId)!.push({ day, slot })
        }

        assigned = true
        break dayLoop
      }
    }

    if (!assigned) {
      // Could not assign this course
      violations.push({
        type: 'unassigned_course',
        description: `Could not assign course ${course.code}`,
        count: 1
      })
    }
  }

  // Build violations summary
  if (consecutiveViolations > 0) {
    violations.push({
      type: 'consecutive_slots',
      description: 'Students with exams in consecutive slots',
      count: consecutiveViolations
    })
  }

  if (threePerDayViolations > 0) {
    violations.push({
      type: 'three_per_day',
      description: 'Students with 3+ exams per day',
      count: threePerDayViolations
    })
  }

  if (capacityViolations > 0) {
    violations.push({
      type: 'capacity_overflow',
      description: 'Exams exceeding classroom capacity',
      count: capacityViolations
    })
  }

  const is_feasible = assignments.length === courses.length && violations.length === 0

  return {
    assignments,
    violations,
    is_feasible
  }
}