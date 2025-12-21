import { Card } from '../components/ui/card'
import {
  BookOpen,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  HelpCircle,
  Calendar,
  Users,
  Building2,
  BarChart3,
  Download,
  Upload,
  PlayCircle,
  Eye
} from 'lucide-react'

export function Help(): React.ReactNode {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <HelpCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Help & Documentation</h1>
          <p className="text-gray-500">Everything you need to know about ExamFlow</p>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Quick Start Guide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              step: 1,
              title: 'Import Data',
              desc: 'Upload CSV files for classrooms, courses, students, and enrollments',
              icon: FileText
            },
            {
              step: 2,
              title: 'Configure Period',
              desc: 'Set exam days, time slots, and scheduling parameters',
              icon: Calendar
            },
            {
              step: 3,
              title: 'Set Preferences',
              desc: 'Choose optimization goals and enable relaxations if needed',
              icon: Settings
            },
            {
              step: 4,
              title: 'Generate',
              desc: 'Run the scheduler to create optimized exam timetables',
              icon: BarChart3
            },
            {
              step: 5,
              title: 'Review',
              desc: 'Analyze schedules by day, course, classroom, or student',
              icon: CheckCircle
            },
            {
              step: 6,
              title: 'Export',
              desc: 'Download and distribute final schedules',
              icon: FileText
            }
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 hover:from-blue-50 hover:to-indigo-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{item.title}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Formats */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Data Format Requirements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-gray-800">Classrooms CSV</h3>
            </div>
            <code className="block bg-white/80 p-3 rounded-lg text-sm font-mono text-gray-700">
              name,capacity
              <br />
              Room-101,50
              <br />
              Room-102,40
              <br />
              Auditorium,200
            </code>
          </div>
          <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <h3 className="font-bold text-gray-800">Courses CSV</h3>
            </div>
            <code className="block bg-white/80 p-3 rounded-lg text-sm font-mono text-gray-700">
              code,name
              <br />
              CS101,Intro to CS
              <br />
              MATH201,Calculus II
              <br />
              PHY101,Physics I
            </code>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <h3 className="font-bold text-gray-800">Students CSV</h3>
            </div>
            <code className="block bg-white/80 p-3 rounded-lg text-sm font-mono text-gray-700">
              student_id,name
              <br />
              2021001,John Doe
              <br />
              2021002,Jane Smith
              <br />
              2021003,Bob Wilson
            </code>
          </div>
          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <h3 className="font-bold text-gray-800">Enrollments CSV</h3>
            </div>
            <code className="block bg-white/80 p-3 rounded-lg text-sm font-mono text-gray-700">
              student_id,course_code
              <br />
              2021001,CS101
              <br />
              2021001,MATH201
              <br />
              2021002,CS101
            </code>
          </div>
        </div>
      </Card>

      {/* Constraints & Violations */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Understanding Constraints & Violations
          </h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
            <h3 className="font-bold text-red-800 mb-2">Hard Constraints (Must be satisfied)</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>No Student Conflicts:</strong> A student cannot have two exams at the same
                  time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>Room Capacity:</strong> Classroom must fit all enrolled students
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>No Room Conflicts:</strong> Only one exam per room at any time slot
                </span>
              </li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Soft Constraints (Can be relaxed)</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  <strong>Consecutive Slots:</strong> Students shouldn&apos;t have back-to-back
                  exams
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  <strong>Three Per Day:</strong> Students shouldn&apos;t have more than 2 exams per
                  day
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  <strong>Capacity Overflow:</strong> Allow slight overbooking of rooms (with limit)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Relaxations Explained */}
            {/* How to Use Each Tab */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">What each tab does</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
                {[
                  { title: 'Dashboard', desc: 'Shows counts of classrooms, courses, students, schedules.' },
                  { title: 'Data', desc: 'Import CSVs or add/edit/delete classrooms, courses, students, enrollments.' },
                  { title: 'Config', desc: 'Set exam days, time slots, optimization goals, relaxations.' },
                  { title: 'Generate', desc: 'Run the scheduler. If data is missing, a warning appears.' },
                  { title: 'View', desc: 'Inspect schedules by day, course, or classroom. Filter and export CSV/PDF.' },
                  { title: 'Help', desc: 'You are here. Use these guides and examples for quick onboarding.' }
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="font-semibold text-gray-800">{item.title}</div>
                    <div className="text-gray-600">{item.desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Common Tasks */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Do these in order</h2>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Open Data → import classrooms, courses, students, enrollments (CSV samples above).</li>
                <li>Open Config → set number of days, slots, and (optional) custom times.</li>
                <li>Still in Config → set optimization goals and relaxations.</li>
                <li>Go to Generate → click Generate Schedule. If anything is missing, fix and retry.</li>
                <li>Go to View → pick a schedule, filter by day/course/room, and check violations.</li>
                <li>Export → use Export CSV/PDF buttons in View (choose the view you want to export).</li>
              </ol>
            </Card>

            {/* Export & File Tips */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Download className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">Exporting schedules</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <Upload className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">CSV export</div>
                    <div>Ideal for spreadsheets. Includes course, room, day/slot, times, counts, and violations.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-purple-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">PDF export</div>
                    <div>Select the view (Day / Course / Classroom) before exporting for the layout you want.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-gray-600 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800">Violations</div>
                    <div>Rows with conflicts or capacity overflows show a violation note. Filter “Violations only” in View.</div>
                  </div>
                </div>
              </div>
            </Card>
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Constraint Relaxations Explained</h2>
        </div>
        <p className="text-gray-600 mb-4">
          When a feasible schedule cannot be found, you can enable relaxations to allow some
          violations:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Allow Consecutive Slots</h3>
            <p className="text-sm text-gray-600 mb-2">
              Permits scheduling back-to-back exams for the same student.
            </p>
            <div className="text-xs text-blue-600 bg-blue-100 rounded px-2 py-1 inline-block">
              Set max allowed violations
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <h3 className="font-bold text-green-800 mb-2">Allow 3+ Exams/Day</h3>
            <p className="text-sm text-gray-600 mb-2">
              Permits students to have three or more exams in a single day.
            </p>
            <div className="text-xs text-green-600 bg-green-100 rounded px-2 py-1 inline-block">
              Set max allowed violations
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
            <h3 className="font-bold text-purple-800 mb-2">Allow Capacity Overflow</h3>
            <p className="text-sm text-gray-600 mb-2">
              Permits slight overbooking of classroom capacity.
            </p>
            <div className="text-xs text-purple-600 bg-purple-100 rounded px-2 py-1 inline-block">
              Set max overflow percentage
            </div>
          </div>
        </div>
      </Card>

      {/* Optimization Goals */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Optimization Goals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">Balance Across Days</div>
                <div className="text-sm text-gray-600">
                  Distribute exams evenly across all exam days
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">Minimize Days Used</div>
                <div className="text-sm text-gray-600">Compact schedule into fewer days</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">Minimize Rooms Used</div>
                <div className="text-sm text-gray-600">Use fewer classrooms for efficiency</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">Place Difficult Early</div>
                <div className="text-sm text-gray-600">
                  Schedule courses with many students early
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">Place Difficult Late</div>
                <div className="text-sm text-gray-600">
                  Schedule courses with many students late
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Troubleshooting */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Troubleshooting</h2>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
            <h3 className="font-bold text-red-800">No Feasible Schedule Found</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Try enabling constraint relaxations in Configuration</li>
              <li>• Increase the number of exam days or time slots</li>
              <li>• Add more classrooms or larger rooms</li>
              <li>• Check for data issues (duplicate enrollments, etc.)</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100">
            <h3 className="font-bold text-yellow-800">Import Errors</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Ensure CSV files have correct headers</li>
              <li>• Check for extra commas or missing columns</li>
              <li>• Remove any empty rows at the end of files</li>
              <li>• Use UTF-8 encoding for special characters</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <h3 className="font-bold text-blue-800">Schedule Has Many Violations</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Review relaxation limits — they may be too permissive</li>
              <li>• Consider adding more time slots per day</li>
              <li>• Check if room capacities match course sizes</li>
              <li>• Look for courses with unusual enrollment patterns</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Version Info */}
      <div className="text-center text-sm text-gray-400 py-4">
        ExamFlow v1.0.0 — Built with Electron, React, and TypeScript
      </div>
    </div>
  )
}
