import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'
import { Loader2 } from 'lucide-react'

const ProtectedLayout = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-bold">GreatReading</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 GreatReading. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Import BookOpen at the top
import { BookOpen } from 'lucide-react'

export default ProtectedLayout
