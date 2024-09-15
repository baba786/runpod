import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { X, UserCircle, Search, BarChart, Settings, LogOut } from 'lucide-react'

interface SidebarProps {
  session: any
  user: any
  isSidebarOpen: boolean
  toggleSidebar: () => void
  activeView: 'search' | 'dashboard'
  setActiveView: (view: 'search' | 'dashboard') => void
  handleSignOut: () => void
}

const Sidebar = memo(function Sidebar({
  session,
  user,
  isSidebarOpen,
  toggleSidebar,
  activeView,
  setActiveView,
  handleSignOut,
}: SidebarProps) {
  if (!session) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      ></div>
      <div
        className={`bg-white dark:bg-gray-900 fixed top-0 left-0 bottom-0 z-50 w-64 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex flex-col items-center mb-8 mt-12 lg:mt-0">
              <UserCircle className="h-20 w-20 text-blue-500 mb-2" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {user?.user_metadata?.name || user?.email || 'Guest'}
              </h2>
            </div>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'search'
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : ''
                    }`}
                    onClick={() => setActiveView('search')}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find Podcasts
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'dashboard'
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : ''
                    }`}
                    onClick={() => setActiveView('dashboard')}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
})

export default Sidebar
