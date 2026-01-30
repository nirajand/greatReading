import { useState } from 'react'
import { Upload, Search, Filter, Grid, List, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const Library = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Library</h1>
            <p className="mt-2 text-gray-600">
              Manage your collection of books and documents
            </p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Upload className="mr-2 h-5 w-5" />
            Upload Book
          </button>
        </div>

        {/* Filters and Search */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title or author..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                <Filter className="mr-2 h-5 w-5" />
                Filter
              </button>
              <div className="flex rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid/List */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">No books yet</h3>
          <p className="mt-2 text-gray-600">
            Upload your first PDF book to start reading
          </p>
          <button className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Upload First Book
          </button>
          
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sample book cards for demonstration */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="font-semibold">Sample Book 1</h4>
              <p className="text-sm text-gray-600">By Author Name</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">120 pages</span>
                <Link to="/reader/1" className="text-blue-600 hover:text-blue-800">
                  Read →
                </Link>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="font-semibold">Sample Book 2</h4>
              <p className="text-sm text-gray-600">By Another Author</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">85 pages</span>
                <Link to="/reader/2" className="text-blue-600 hover:text-blue-800">
                  Read →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library
