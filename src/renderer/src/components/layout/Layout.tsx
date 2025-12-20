import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): React.ReactNode {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/data', label: 'Data Management' },
    { path: '/config', label: 'Configuration' },
    { path: '/generate', label: 'Generate Schedule' },
    { path: '/view', label: 'View Schedules' },
    { path: '/help', label: 'Help' }
  ]

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-blue-600">ExamFlow</div>
              <div className="text-sm text-gray-500">Exam Scheduling System</div>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  className={
                    location.pathname === item.path
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-6 py-8">{children}</main>
    </div>
  )
}