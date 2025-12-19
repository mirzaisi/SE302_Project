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