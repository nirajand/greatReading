import { BookOpen, Clock, TrendingUp, BookMarked, Plus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="mt-2 text-blue-100">
              Continue your reading journey. Pick up where you left off or start something new.
            </p>
          </div>
          <BookOpen className="h-16 w-16 mt-4 md:mt-0 opacity-20" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Reading Time</p>
              <p className="text-2xl font-bold">0 min</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Books Read</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <BookMarked className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Words Saved</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Average Session</p>
              <p className="text-2xl font-bold">0 min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quick Timer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Quick Reading Timer</h2>
          </div>
          <div className="grid gap-4">
            {[
              { minutes: 5, label: 'Quick Read' },
              { minutes: 10, label: 'Focused Session' },
              { minutes: 15, label: 'Deep Dive' }
            ].map((preset) => (
              <div key={preset.minutes} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">{preset.label}</p>
                  <p className="text-sm text-gray-600">{preset.minutes} minutes</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Books */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Books</h2>
            <Link
              to="/library"
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No books yet</p>
              <Link
                to="/library"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
