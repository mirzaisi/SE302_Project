import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { LayoutDashboard, Database, Settings, Calendar, Eye, HelpCircle } from 'lucide-react'
import logoImage from '../../assets/logo.png'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): React.ReactNode {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/data', label: 'Data', icon: Database },
    { path: '/config', label: 'Config', icon: Settings },
    { path: '/generate', label: 'Generate', icon: Calendar },
    { path: '/view', label: 'View', icon: Eye },
    { path: '/help', label: 'Help', icon: HelpCircle }
  ]

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Navigation - Fixed height */}
      <nav className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <img src={logoImage} alt="ExamFlow Logo" className="h-12 w-auto object-contain" />
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  ExamFlow
                </div>
                <div className="text-xs text-gray-500 font-medium tracking-wide">
                  Intelligent Exam Scheduling
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      size="sm"
                      className={`
                        transition-all duration-200 flex items-center gap-2.5 text-sm px-4 py-2.5
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25'
                            : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto px-6 py-6">{children}</main>

      {/* Footer - Fixed height */}
      <footer className="flex-shrink-0 px-4 py-2 text-center text-xs text-gray-400 border-t border-gray-200/50 bg-white/50">
        ExamFlow © 2025 — Streamlined Exam Scheduling
      </footer>
    </div>
  )
}
