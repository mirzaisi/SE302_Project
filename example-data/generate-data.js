const fs = require('fs')

// Configuration
const NUM_STUDENTS = 1000
const NUM_COURSES = 200
const NUM_CLASSROOMS = 85
const MIN_COURSES = 1
const MAX_COURSES = 8

// Course subjects and prefixes
const subjects = [
  { prefix: 'CS', name: 'Computer Science', count: 25 },
  { prefix: 'MATH', name: 'Mathematics', count: 20 },
  { prefix: 'PHYS', name: 'Physics', count: 15 },
  { prefix: 'CHEM', name: 'Chemistry', count: 15 },
  { prefix: 'BIO', name: 'Biology', count: 15 },
  { prefix: 'ENG', name: 'English', count: 20 },
  { prefix: 'HIST', name: 'History', count: 15 },
  { prefix: 'ECON', name: 'Economics', count: 15 },
  { prefix: 'PSYC', name: 'Psychology', count: 15 },
  { prefix: 'SOC', name: 'Sociology', count: 10 },
  { prefix: 'ART', name: 'Art', count: 10 },
  { prefix: 'MUS', name: 'Music', count: 10 },
  { prefix: 'PE', name: 'Physical Education', count: 15 }
]

// Course levels and names
const courseLevels = [
  { level: '101', names: ['Introduction to', 'Fundamentals of', 'Principles of', 'Basics of'] },
  { level: '102', names: ['Introduction to', 'Elements of', 'Essentials of'] },
  { level: '201', names: ['Intermediate', 'Advanced Introduction to', 'Core Concepts in'] },
  { level: '202', names: ['Intermediate', 'Applications of', 'Methods in'] },
  { level: '301', names: ['Advanced', 'Topics in', 'Special Topics in'] },
  { level: '302', names: ['Advanced', 'Seminar in', 'Research in'] },
  { level: '401', names: ['Senior Seminar in', 'Capstone in', 'Advanced Topics in'] },
  { level: '402', names: ['Graduate Seminar in', 'Research Methods in', 'Advanced Study in'] }
]

// Student first and last names
const firstNames = [
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'Ethan',
  'Sophia',
  'Mason',
  'Isabella',
  'William',
  'Mia',
  'James',
  'Charlotte',
  'Benjamin',
  'Amelia',
  'Lucas',
  'Harper',
  'Henry',
  'Evelyn',
  'Alexander',
  'Abigail',
  'Michael',
  'Emily',
  'Daniel',
  'Elizabeth',
  'Matthew',
  'Sofia',
  'Jackson',
  'Avery',
  'Logan',
  'Ella',
  'David',
  'Scarlett',
  'Joseph',
  'Grace',
  'Samuel',
  'Chloe',
  'John',
  'Victoria',
  'Owen',
  'Riley',
  'Dylan',
  'Aria',
  'Luke',
  'Lily',
  'Gabriel',
  'Aubrey',
  'Anthony',
  'Zoey',
  'Isaac'
]

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
  'Baker',
  'Hall',
  'Rivera',
  'Campbell',
  'Mitchell',
  'Carter',
  'Roberts'
]

// Random number generator with normal distribution
function randomNormal(min, max, skew = 1) {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  num = num / 10.0 + 0.5
  if (num > 1 || num < 0) num = randomNormal(min, max, skew)
  num = Math.pow(num, skew)
  num *= max - min
  num += min
  return Math.round(num)
}

// Generate classrooms
function generateClassrooms() {
  const classrooms = []
  classrooms.push('name,capacity\n')

  // Distribution: 15 small (12-25), 50 medium (26-50), 15 large (51-80), 5 very large (81-100)
  const capacities = [
    ...Array(15)
      .fill(0)
      .map(() => randomNormal(12, 25)),
    ...Array(50)
      .fill(0)
      .map(() => randomNormal(26, 50)),
    ...Array(15)
      .fill(0)
      .map(() => randomNormal(51, 80)),
    ...Array(5)
      .fill(0)
      .map(() => randomNormal(81, 100))
  ]

  for (let i = 0; i < NUM_CLASSROOMS; i++) {
    const buildingTypes = ['Room', 'Hall', 'Lab', 'Auditorium', 'Studio']
    const building = buildingTypes[i % buildingTypes.length]
    const roomNum = String(101 + i).padStart(3, '0')
    classrooms.push(`${building}-${roomNum},${capacities[i]}\n`)
  }

  return classrooms.join('')
}

// Generate courses
function generateCourses() {
  const courses = []
  courses.push('code,name\n')

  let courseCount = 0
  for (const subject of subjects) {
    for (let i = 0; i < subject.count && courseCount < NUM_COURSES; i++) {
      const level = courseLevels[i % courseLevels.length]
      const namePrefix = level.names[Math.floor(Math.random() * level.names.length)]
      const code = `${subject.prefix}${level.level}`
      const name = `${namePrefix} ${subject.name}`
      courses.push(`${code},${name}\n`)
      courseCount++
    }
  }

  return courses.join('')
}

// Generate students
function generateStudents() {
  const students = []
  students.push('student_id,name\n')

  for (let i = 1; i <= NUM_STUDENTS; i++) {
    const studentId = `S${String(i).padStart(4, '0')}`
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    students.push(`${studentId},${name}\n`)
  }

  return students.join('')
}

// Generate enrollments
function generateEnrollments() {
  const enrollments = []
  enrollments.push('student_id,course_code\n')

  // Read courses to get valid course codes
  const courseCodes = []
  for (const subject of subjects) {
    for (let i = 0; i < subject.count; i++) {
      const level = courseLevels[i % courseLevels.length]
      courseCodes.push(`${subject.prefix}${level.level}`)
      if (courseCodes.length >= NUM_COURSES) break
    }
    if (courseCodes.length >= NUM_COURSES) break
  }

  // For each student, assign random number of courses
  for (let i = 1; i <= NUM_STUDENTS; i++) {
    const studentId = `S${String(i).padStart(4, '0')}`

    // Use normal distribution centered around 5, min 1, max 8
    let numCourses = randomNormal(MIN_COURSES, MAX_COURSES)
    if (numCourses < MIN_COURSES) numCourses = MIN_COURSES
    if (numCourses > MAX_COURSES) numCourses = MAX_COURSES

    // Randomly select courses (without duplicates)
    const shuffled = [...courseCodes].sort(() => 0.5 - Math.random())
    const selectedCourses = shuffled.slice(0, numCourses)

    for (const courseCode of selectedCourses) {
      enrollments.push(`${studentId},${courseCode}\n`)
    }
  }

  return enrollments.join('')
}

// Generate all files
console.log('Generating test data...\n')

console.log('Generating classrooms...')
const classroomsData = generateClassrooms()
fs.writeFileSync('classrooms.csv', classroomsData)
console.log(`✓ Generated ${NUM_CLASSROOMS} classrooms\n`)

console.log('Generating courses...')
const coursesData = generateCourses()
fs.writeFileSync('courses.csv', coursesData)
console.log(`✓ Generated ${NUM_COURSES} courses\n`)

console.log('Generating students...')
const studentsData = generateStudents()
fs.writeFileSync('students.csv', studentsData)
console.log(`✓ Generated ${NUM_STUDENTS} students\n`)

console.log('Generating enrollments...')
const enrollmentsData = generateEnrollments()
fs.writeFileSync('enrollments.csv', enrollmentsData)
const enrollmentCount = enrollmentsData.split('\n').length - 2 // Subtract header and empty line
console.log(`✓ Generated ${enrollmentCount} enrollments\n`)

console.log('Statistics:')
console.log(`- Average courses per student: ${(enrollmentCount / NUM_STUDENTS).toFixed(2)}`)
console.log(`- Average students per course: ${(enrollmentCount / NUM_COURSES).toFixed(2)}`)

console.log('\nFiles created:')
console.log('- classrooms.csv')
console.log('- courses.csv')
console.log('- students.csv')
console.log('- enrollments.csv')
console.log('\nReady to import into ExamFlow!')
