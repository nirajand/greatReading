import { useState } from 'react'
import { Search, Filter, Star, Volume2, Trash2, ChevronDown } from 'lucide-react'

const Dictionary = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [masteryFilter, setMasteryFilter] = useState<number | undefined>()
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)

  // Sample data
  const sampleEntries = [
    {
      id: 1,
      word: "ephemeral",
      definition: "Lasting for a very short time.",
      context: "The beauty of cherry blossoms is ephemeral.",
      phonetic: "/ɪˈfem.ər.əl/",
      part_of_speech: "adjective",
      mastered: 2,
      examples: ["The ephemeral nature of fame", "An ephemeral moment of happiness"]
    },
    {
      id: 2,
      word: "ubiquitous",
      definition: "Present, appearing, or found everywhere.",
      context: "Smartphones have become ubiquitous in modern society.",
      phonetic: "/juːˈbɪk.wɪ.təs/",
      part_of_speech: "adjective",
      mastered: 1,
      examples: ["The ubiquitous presence of social media", "Coffee shops are ubiquitous in the city"]
    },
    {
      id: 3,
      word: "serendipity",
      definition: "The occurrence of events by chance in a happy or beneficial way.",
      context: "Finding that old photo was pure serendipity.",
      phonetic: "/ˌser.ənˈdɪp.ə.ti/",
      part_of_speech: "noun",
      mastered: 3,
      examples: ["A serendipitous discovery", "Serendipity led them to meet"]
    }
  ]

  const filteredEntries = sampleEntries.filter(entry =>
    entry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.definition.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMasteryColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-blue-100 text-blue-800'
      case 2:
        return 'bg-green-100 text-green-800'
      case 3:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Personal Dictionary</h1>
            <p className="mt-2 text-gray-600">
              Your collection of saved words and definitions
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search words or definitions..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Mastery
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 top-full z-10 mt-2 hidden w-48 rounded-lg border border-gray-200 bg-white shadow-lg group-hover:block">
                  <div className="p-2">
                    <button
                      onClick={() => setMasteryFilter(undefined)}
                      className="block w-full rounded px-3 py-2 text-left hover:bg-gray-100"
                    >
                      All Levels
                    </button>
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        onClick={() => setMasteryFilter(level)}
                        className="block w-full rounded px-3 py-2 text-left hover:bg-gray-100"
                      >
                        Level {level} - {level === 1 ? 'Learning' : level === 2 ? 'Familiar' : 'Mastered'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dictionary Entries */}
        {filteredEntries.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchQuery ? 'No matching entries found' : 'No words saved yet'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'Start reading and save words to build your dictionary'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold">{entry.word}</h3>
                      {entry.phonetic && (
                        <span className="text-gray-600">{entry.phonetic}</span>
                      )}
                      <button className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {entry.part_of_speech && (
                      <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {entry.part_of_speech}
                      </span>
                    )}

                    <div className="mt-4">
                      <p className="text-gray-700">{entry.definition}</p>
                      
                      {entry.context && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3 italic">
                          "{entry.context}"
                        </div>
                      )}

                      {expandedEntry === entry.id && (
                        <div className="mt-4 space-y-3">
                          {entry.examples?.map((example, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4">
                              <p className="text-gray-600">{example}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-3">
                    <div className="flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          onClick={() => {}}
                          className={`rounded-full p-2 ${
                            entry.mastered >= level
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Star className="h-5 w-5" fill="currentColor" />
                        </button>
                      ))}
                    </div>
                    
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getMasteryColor(entry.mastered)}`}>
                      Level {entry.mastered}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {expandedEntry === entry.id ? 'Show less' : 'Show more'}
                      </button>
                      <button
                        onClick={() => {}}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Word Section */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Word</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Word</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter a word"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Definition</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter definition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Context (Optional)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={2}
                placeholder="Where did you encounter this word?"
              />
            </div>
            <button className="md:col-span-2 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
              Add to Dictionary
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dictionary
