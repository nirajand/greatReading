import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Timer, Volume2, Maximize2, BookMarked } from 'lucide-react'

const Reader = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const [currentPage, setCurrentPage] = useState(1)
  const [readingMode, setReadingMode] = useState<'page' | 'sentence'>('page')
  const [isTimerActive, setIsTimerActive] = useState(false)

  const totalPages = 120 // Example total pages

  const handlePageChange = (delta: number) => {
    const newPage = currentPage + delta
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const sampleText = `This is a sample page from your book. You can read content here in either page view or sentence-by-sentence mode.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sample Book Title</h1>
            <p className="text-gray-600">by Sample Author</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="text-sm text-gray-600">
              {Math.round((currentPage / totalPages) * 100)}% complete
            </div>
          </div>
        </div>

        {/* Reading Controls */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(-1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rounded-lg border border-gray-300">
                <button
                  onClick={() => setReadingMode('page')}
                  className={`px-4 py-2 ${readingMode === 'page' ? 'bg-blue-600 text-white' : ''}`}
                >
                  Page View
                </button>
                <button
                  onClick={() => setReadingMode('sentence')}
                  className={`px-4 py-2 ${readingMode === 'sentence' ? 'bg-blue-600 text-white' : ''}`}
                >
                  Sentence View
                </button>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                <Timer className="h-5 w-5" />
                Timer
              </button>

              <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50">
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Start</span>
              <span>{Math.round((currentPage / totalPages) * 100)}%</span>
              <span>Finish</span>
            </div>
          </div>
        </div>

        {/* Reading Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          {readingMode === 'page' ? (
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                {sampleText.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Sample interactive elements */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <BookMarked className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Word Lookup Feature</p>
                    <p className="text-blue-800 text-sm mt-1">
                      Double-click any word to look it up in the dictionary and save it to your personal dictionary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-3xl mx-auto">
              <div className="text-2xl leading-relaxed mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-100">
                "This is a sample sentence from your book. In sentence view mode, you focus on one sentence at a time."
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {}}
                  className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Previous Sentence
                </button>
                <button
                  onClick={() => {}}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  Next Sentence
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                Sentence 1 of 15
                <br />
                Press Spacebar for next sentence
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous Page
          </button>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
              <Volume2 className="h-5 w-5" />
              Listen
            </button>
            <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              Save Progress
            </button>
          </div>
          
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Next Page
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reader
