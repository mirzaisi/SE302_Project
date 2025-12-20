import { Card } from '../components/ui/card'

export function Help(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Help & Documentation</h1>
        <p className="text-gray-600 mt-2">Learn how to use ExamFlow effectively</p>
      </div>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Start Guide</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            <strong>Import Data:</strong> Go to Data Management and import your CSV files for
            classrooms, courses, students, and enrollments.
          </li>
          <li>
            <strong>Configure:</strong> Set up your exam period (days and slots) and choose
            optimization goals in the Configuration page.
          </li>
          <li>
            <strong>Set Relaxations:</strong> If needed, enable constraint relaxations to handle
            difficult scheduling scenarios.
          </li>
          <li>
            <strong>Generate:</strong> Use the Generate Schedule page to create exam schedules.
          </li>
          <li>
            <strong>View & Analyze:</strong> Review schedules from different perspectives (day,
            course, student, classroom).
          </li>
          <li>
            <strong>Export:</strong> Export final schedules for distribution.
          </li>
        </ol>
      </Card>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Data Format Requirements</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-bold">Classrooms CSV:</h3>
            <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">
              name,capacity
              <br />
              Room-101,50
              <br />
              Room-102,40
            </code>
          </div>
          <div>
            <h3 className="font-bold">Courses CSV:</h3>
            <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">
              code,name
              <br />
              CS101,Introduction to Computer Science
              <br />
              MATH201,Calculus II
            </code>
          </div>
          <div>
            <h3 className="font-bold">Students CSV:</h3>
            <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">
              student_id,name
              <br />
              2021001,John Doe
              <br />
              2021002,Jane Smith
            </code>
          </div>
          <div>
            <h3 className="font-bold">Enrollments CSV:</h3>
            <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">
              student_id,course_code
              <br />
              2021001,CS101
              <br />
              2021001,MATH201
            </code>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Common Issues</h2>
        <div className="space-y-3 text-gray-700">
          <div>
            <h3 className="font-bold">No Feasible Schedule Found:</h3>
            <p className="text-sm mt-1">
              Try enabling constraint relaxations or increasing the number of exam days/slots.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Import Errors:</h3>
            <p className="text-sm mt-1">
              Ensure your CSV files match the required format exactly. Check for extra commas or
              missing columns.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
