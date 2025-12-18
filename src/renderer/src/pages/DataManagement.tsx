import { useState, useEffect, useRef } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'

interface Classroom {
  id: number
  name: string
  capacity: number
}

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
  id: number
  student_id: string
  student_name: string
  course_code: string
  course_name: string
}

type DataRow = Classroom | Course | Student | Enrollment

interface ClassroomForm {
  name?: string
  capacity?: string
}

interface CourseForm {
  code?: string
  name?: string
}

interface StudentForm {
  student_id?: string
  name?: string
}

interface EnrollmentForm {
  student_id?: string
  course_code?: string
}

type FormData = ClassroomForm | CourseForm | StudentForm | EnrollmentForm

// shut up tslint
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DataManagement() {
  const [activeTab, setActiveTab] = useState('classrooms')
  const [importing, setImporting] = useState(false)
  const [data, setData] = useState<DataRow[]>([])
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({})

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        let query = ''
        switch (activeTab) {
          case 'classrooms':
            query = 'SELECT * FROM classrooms ORDER BY name'
            break
          case 'courses':
            query = 'SELECT * FROM courses ORDER BY code'
            break
          case 'students':
            query = 'SELECT * FROM students ORDER BY student_id'
            break
          case 'enrollments':
            query = `SELECT e.id, s.student_id, s.name as student_name, c.code as course_code, c.name as course_name
                   FROM enrollments e
                   JOIN students s ON e.student_id = s.id
                   JOIN courses c ON e.course_id = c.id
                   ORDER BY s.student_id, c.code`
            break
        }
        const result = (await window.api.db.query(query, [])) as unknown as DataRow[]
        setData(result)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [activeTab])

  const loadData = async (): Promise<void> => {
    try {
      let query = ''
      switch (activeTab) {
        case 'classrooms':
          query = 'SELECT * FROM classrooms ORDER BY name'
          break
        case 'courses':
          query = 'SELECT * FROM courses ORDER BY code'
          break
        case 'students':
          query = 'SELECT * FROM students ORDER BY student_id'
          break
        case 'enrollments':
          query = `SELECT e.id, s.student_id, s.name as student_name, c.code as course_code, c.name as course_name
                   FROM enrollments e
                   JOIN students s ON e.student_id = s.id
                   JOIN courses c ON e.course_id = c.id
                   ORDER BY s.student_id, c.code`
          break
      }
      const result = (await window.api.db.query(query, [])) as unknown as DataRow[]
      setData(result)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const parseCSV = (text: string): string[][] => {
    const lines = text.trim().split('\n')
    return lines.map((line) => line.split(',').map((cell) => cell.trim()))
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage('')

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      // Skip header row
      const dataRows = rows.slice(1)

      let successCount = 0
      let errorCount = 0

      for (const row of dataRows) {
        try {
          switch (activeTab) {
            case 'classrooms':
              if (row.length >= 2) {
                await window.api.db.run('INSERT INTO classrooms (name, capacity) VALUES (?, ?)', [
                  row[0],
                  parseInt(row[1])
                ])
                successCount++
              }
              break
            case 'courses':
              if (row.length >= 2) {
                await window.api.db.run(
                  'INSERT OR IGNORE INTO courses (code, name) VALUES (?, ?)',
                  [row[0], row[1]]
                )
                successCount++
              }
              break
            case 'students':
              if (row.length >= 2) {
                await window.api.db.run(
                  'INSERT OR IGNORE INTO students (student_id, name) VALUES (?, ?)',
                  [row[0], row[1]]
                )
                successCount++
              }
              break
            case 'enrollments':
              if (row.length >= 2) {
                // Get student id from student_id
                const studentResult = await window.api.db.get(
                  'SELECT id FROM students WHERE student_id = ?',
                  [row[0]]
                )
                // Get course id from code
                const courseResult = await window.api.db.get(
                  'SELECT id FROM courses WHERE code = ?',
                  [row[1]]
                )
                const student = studentResult as { id: number } | undefined
                const course = courseResult as { id: number } | undefined
                if (student && course) {
                  await window.api.db.run(
                    'INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)',
                    [student.id, course.id]
                  )
                  successCount++
                }
              }
              break
          }
        } catch (error) {
          console.error('Error importing row:', row, error)
          errorCount++
        }
      }

      setMessage(
        `Successfully imported ${successCount} records. ${errorCount > 0 ? `${errorCount} errors.` : ''}`
      )
      await loadData()
    } catch (error) {
      console.error('Failed to import CSV:', error)
      setMessage('Failed to import CSV file')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportCSV = (): void => {
    fileInputRef.current?.click()
  }

  const handleExportCSV = async (): Promise<void> => {
    try {
      let csvContent = ''
      let filename = ''

      switch (activeTab) {
        case 'classrooms': {
          csvContent = 'name,capacity\n'
          data.forEach((row) => {
            const classroomRow = row as Classroom
            csvContent += `${classroomRow.name},${classroomRow.capacity}\n`
          })
          filename = 'classrooms.csv'
          break
        }
        case 'courses': {
          csvContent = 'code,name\n'
          data.forEach((row) => {
            const courseRow = row as Course
            csvContent += `${courseRow.code},${courseRow.name}\n`
          })
          filename = 'courses.csv'
          break
        }
        case 'students': {
          csvContent = 'student_id,name\n'
          data.forEach((row) => {
            const studentRow = row as Student
            csvContent += `${studentRow.student_id},${studentRow.name}\n`
          })
          filename = 'students.csv'
          break
        }
        case 'enrollments': {
          csvContent = 'student_id,course_code\n'
          data.forEach((row) => {
            const enrollmentRow = row as Enrollment
            csvContent += `${enrollmentRow.student_id},${enrollmentRow.course_code}\n`
          })
          filename = 'enrollments.csv'
          break
        }
      }

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setMessage(`Exported ${data.length} records to ${filename}`)
    } catch (error) {
      console.error('Failed to export CSV:', error)
      setMessage('Failed to export CSV')
    }
  }

  const handleAddManual = (): void => {
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      switch (activeTab) {
        case 'classrooms': {
          const classroomForm = formData as ClassroomForm
          await window.api.db.run('INSERT INTO classrooms (name, capacity) VALUES (?, ?)', [
            classroomForm.name || '',
            parseInt(classroomForm.capacity || '0')
          ])
          break
        }
        case 'courses': {
          const courseForm = formData as CourseForm
          await window.api.db.run('INSERT OR IGNORE INTO courses (code, name) VALUES (?, ?)', [
            courseForm.code || '',
            courseForm.name || ''
          ])
          break
        }
        case 'students': {
          const studentForm = formData as StudentForm
          await window.api.db.run(
            'INSERT OR IGNORE INTO students (student_id, name) VALUES (?, ?)',
            [studentForm.student_id || '', studentForm.name || '']
          )
          break
        }
        case 'enrollments': {
          const enrollmentForm = formData as EnrollmentForm
          const studentResult = await window.api.db.get(
            'SELECT id FROM students WHERE student_id = ?',
            [enrollmentForm.student_id || '']
          )
          const courseResult = await window.api.db.get('SELECT id FROM courses WHERE code = ?', [
            enrollmentForm.course_code || ''
          ])
          const student = studentResult as { id: number } | undefined
          const course = courseResult as { id: number } | undefined
          if (student && course) {
            await window.api.db.run(
              'INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)',
              [student.id, course.id]
            )
          } else {
            setMessage('Error: Student or course not found!')
            return
          }
          break
        }
      }

      setMessage('Successfully added record!')
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      console.error('Failed to add record:', error)
      setMessage('Error adding record: ' + error)
    }
  }

  const handleDelete = async (row: DataRow): Promise<void> => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      switch (activeTab) {
        case 'classrooms':
          await window.api.db.run('DELETE FROM classrooms WHERE id = ?', [row.id])
          break
        case 'courses':
          await window.api.db.run('DELETE FROM courses WHERE id = ?', [row.id])
          break
        case 'students':
          await window.api.db.run('DELETE FROM students WHERE id = ?', [row.id])
          break
        case 'enrollments':
          await window.api.db.run('DELETE FROM enrollments WHERE id = ?', [row.id])
          break
      }

      setMessage('Successfully deleted record!')
      await loadData()
    } catch (error) {
      console.error('Failed to delete record:', error)
      setMessage('Error deleting record: ' + error)
    }
  }

  const handleDeleteAll = async (): Promise<void> => {
    const count = data.length
    if (
      !confirm(`Are you sure you want to delete ALL ${count} ${activeTab}? This cannot be undone!`)
    )
      return

    try {
      switch (activeTab) {
        case 'classrooms':
          await window.api.db.run('DELETE FROM classrooms', [])
          break
        case 'courses':
          await window.api.db.run('DELETE FROM courses', [])
          break
        case 'students':
          await window.api.db.run('DELETE FROM students', [])
          break
        case 'enrollments':
          await window.api.db.run('DELETE FROM enrollments', [])
          break
      }

      setMessage(`Successfully deleted all ${count} ${activeTab}!`)
      await loadData()
    } catch (error) {
      console.error('Failed to delete all records:', error)
      setMessage('Error deleting records: ' + error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Data Management</h1>
        <p className="text-gray-600 mt-2">
          Import and manage classrooms, courses, students, and enrollments
        </p>
      </div>

      <Card className="p-6 bg-white">
        <div className="space-y-6">
          {/* Tab Selection */}
          <div className="flex space-x-2 border-b">
            {['classrooms', 'courses', 'students', 'enrollments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Import/Export Actions */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={handleImportCSV}
                disabled={importing}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {importing ? 'Importing...' : `Import ${activeTab} (CSV)`}
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={data.length === 0}
                className="bg-green-500 hover:bg-green-600"
              >
                Export {activeTab} (CSV)
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddManual} className="bg-indigo-500 hover:bg-indigo-600">
                    Add Manually
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add {activeTab.slice(0, -1)}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {activeTab === 'classrooms' &&
                      (() => {
                        const form = formData as ClassroomForm
                        return (
                          <>
                            <div>
                              <Label htmlFor="name">Classroom Name</Label>
                              <Input
                                id="name"
                                value={form.name || ''}
                                onChange={(e) => setFormData({ ...form, name: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="capacity">Capacity</Label>
                              <Input
                                id="capacity"
                                type="number"
                                value={form.capacity || ''}
                                onChange={(e) => setFormData({ ...form, capacity: e.target.value })}
                                required
                              />
                            </div>
                          </>
                        )
                      })()}
                    {activeTab === 'courses' &&
                      (() => {
                        const form = formData as CourseForm
                        return (
                          <>
                            <div>
                              <Label htmlFor="code">Course Code</Label>
                              <Input
                                id="code"
                                value={form.code || ''}
                                onChange={(e) => setFormData({ ...form, code: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="name">Course Name</Label>
                              <Input
                                id="name"
                                value={form.name || ''}
                                onChange={(e) => setFormData({ ...form, name: e.target.value })}
                                required
                              />
                            </div>
                          </>
                        )
                      })()}
                    {activeTab === 'students' &&
                      (() => {
                        const form = formData as StudentForm
                        return (
                          <>
                            <div>
                              <Label htmlFor="student_id">Student ID</Label>
                              <Input
                                id="student_id"
                                value={form.student_id || ''}
                                onChange={(e) =>
                                  setFormData({ ...form, student_id: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="name">Student Name</Label>
                              <Input
                                id="name"
                                value={form.name || ''}
                                onChange={(e) => setFormData({ ...form, name: e.target.value })}
                                required
                              />
                            </div>
                          </>
                        )
                      })()}
                    {activeTab === 'enrollments' &&
                      (() => {
                        const form = formData as EnrollmentForm
                        return (
                          <>
                            <div>
                              <Label htmlFor="student_id">Student ID</Label>
                              <Input
                                id="student_id"
                                value={form.student_id || ''}
                                onChange={(e) =>
                                  setFormData({ ...form, student_id: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="course_code">Course Code</Label>
                              <Input
                                id="course_code"
                                value={form.course_code || ''}
                                onChange={(e) =>
                                  setFormData({ ...form, course_code: e.target.value })
                                }
                                required
                              />
                            </div>
                          </>
                        )
                      })()}
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Add
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleDeleteAll}
                disabled={data.length === 0}
                className="bg-red-500 hover:bg-red-600"
              >
                Remove All
              </Button>
            </div>
            {message && (
              <div
                className={`px-4 py-2 rounded ${message.includes('error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Data Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">Expected Format for {activeTab}:</h3>
            {activeTab === 'classrooms' && (
              <div className="text-sm text-blue-700">
                <p className="font-mono">name,capacity</p>
                <p className="mt-1 text-xs">Example: Room-101,50</p>
              </div>
            )}
            {activeTab === 'courses' && (
              <div className="text-sm text-blue-700">
                <p className="font-mono">code,name</p>
                <p className="mt-1 text-xs">Example: CS101,Introduction to Computer Science</p>
              </div>
            )}
            {activeTab === 'students' && (
              <div className="text-sm text-blue-700">
                <p className="font-mono">student_id,name</p>
                <p className="mt-1 text-xs">Example: 2021001,John Doe</p>
              </div>
            )}
            {activeTab === 'enrollments' && (
              <div className="text-sm text-blue-700">
                <p className="font-mono">student_id,course_code</p>
                <p className="mt-1 text-xs">Example: 2021001,CS101</p>
              </div>
            )}
          </div>

          {/* Preview/List */}
          <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50 max-h-[500px] overflow-auto">
            {data.length === 0 ? (
              <div className="text-sm text-gray-500 text-center mt-8">
                No data found. Import CSV to see data here.
              </div>
            ) : (
              <div>
                <div className="mb-2 text-sm text-gray-600">Showing {data.length} records</div>
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {activeTab === 'classrooms' && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Capacity
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === 'courses' && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === 'students' && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Student ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === 'enrollments' && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Student ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Student Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Course Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Course Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        {activeTab === 'classrooms' &&
                          (() => {
                            const classroomRow = row as Classroom
                            return (
                              <>
                                <td className="px-4 py-2 text-sm">{classroomRow.name}</td>
                                <td className="px-4 py-2 text-sm">{classroomRow.capacity}</td>
                                <td className="px-4 py-2 text-sm">
                                  <Button
                                    onClick={() => handleDelete(row)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </>
                            )
                          })()}
                        {activeTab === 'courses' &&
                          (() => {
                            const courseRow = row as Course
                            return (
                              <>
                                <td className="px-4 py-2 text-sm">{courseRow.code}</td>
                                <td className="px-4 py-2 text-sm">{courseRow.name}</td>
                                <td className="px-4 py-2 text-sm">
                                  <Button
                                    onClick={() => handleDelete(row)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </>
                            )
                          })()}
                        {activeTab === 'students' &&
                          (() => {
                            const studentRow = row as Student
                            return (
                              <>
                                <td className="px-4 py-2 text-sm">{studentRow.student_id}</td>
                                <td className="px-4 py-2 text-sm">{studentRow.name}</td>
                                <td className="px-4 py-2 text-sm">
                                  <Button
                                    onClick={() => handleDelete(row)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </>
                            )
                          })()}
                        {activeTab === 'enrollments' &&
                          (() => {
                            const enrollmentRow = row as Enrollment
                            return (
                              <>
                                <td className="px-4 py-2 text-sm">{enrollmentRow.student_id}</td>
                                <td className="px-4 py-2 text-sm">{enrollmentRow.student_name}</td>
                                <td className="px-4 py-2 text-sm">{enrollmentRow.course_code}</td>
                                <td className="px-4 py-2 text-sm">{enrollmentRow.course_name}</td>
                                <td className="px-4 py-2 text-sm">
                                  <Button
                                    onClick={() => handleDelete(row)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </>
                            )
                          })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
