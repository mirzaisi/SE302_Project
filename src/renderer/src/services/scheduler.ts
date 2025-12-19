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