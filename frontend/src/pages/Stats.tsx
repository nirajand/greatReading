import { Calendar, TrendingUp, Target, Award, Clock, BookOpen, Star } from 'lucide-react'

const Stats = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reading Statistics</h1>
          <p className="mt-2 text-gray-600">
            Track your reading progress and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reading Time</p>
                <p className="text-2xl font-bold mt-2">12h 45m</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% from last week
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Books Completed</p>
                <p className="text-2xl font-bold mt-2">8</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3 this month
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Words Learned</p>
                <p className="text-2xl font-bold mt-2">142</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +24 this week
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reading Streak</p>
                <p className="text-2xl font-bold mt-2">14 days</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Award className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Keep going!
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Reading Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Reading Activity</h2>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Last 30 days</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { day: 'Mon', minutes: 45 },
                { day: 'Tue', minutes: 60 },
                { day: 'Wed', minutes: 30 },
                { day: 'Thu', minutes: 75 },
                { day: 'Fri', minutes: 90 },
                { day: 'Sat', minutes: 120 },
                { day: 'Sun', minutes: 45 }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{item.day}</div>
                  <div className="flex-1 ml-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(item.minutes / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">{item.minutes}m</div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average per day:</span>
                <span className="font-medium">66 minutes</span>
              </div>
            </div>
          </div>

          {/* Reading Goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Reading Goals</h2>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Daily Reading</span>
                  <span className="text-gray-600">45/60 minutes</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Books This Month</span>
                  <span className="text-gray-600">2/4 books</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">New Words</span>
                  <span className="text-gray-600">24/50 words</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '48%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Tip:</span> Set realistic goals and track your progress daily for better consistency.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Recent Achievements</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold">7-Day Streak</h4>
              <p className="text-sm text-gray-600 mt-1">Read for 7 consecutive days</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold">Book Worm</h4>
              <p className="text-sm text-gray-600 mt-1">Complete 5 books</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold">Vocabulary Builder</h4>
              <p className="text-sm text-gray-600 mt-1">Save 100 words</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold">Focused Reader</h4>
              <p className="text-sm text-gray-600 mt-1">10+ hours of reading</p>
            </div>
          </div>
        </div>

        {/* Reading History */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Reading History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Book</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pages Read</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Words Saved</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Today', book: 'The Great Gatsby', duration: '45m', pages: 12, words: 3 },
                  { date: 'Yesterday', book: 'To Kill a Mockingbird', duration: '30m', pages: 8, words: 2 },
                  { date: 'Jan 25', book: '1984', duration: '60m', pages: 15, words: 5 },
                  { date: 'Jan 24', book: 'Pride and Prejudice', duration: '40m', pages: 10, words: 2 },
                  { date: 'Jan 23', book: 'The Great Gatsby', duration: '55m', pages: 14, words: 4 },
                ].map((session, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{session.date}</td>
                    <td className="py-3 px-4 text-sm font-medium">{session.book}</td>
                    <td className="py-3 px-4 text-sm">{session.duration}</td>
                    <td className="py-3 px-4 text-sm">{session.pages} pages</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {session.words} words
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total this month:</span>
              <div className="space-y-1 text-right">
                <div className="font-medium">12 hours of reading</div>
                <div className="text-gray-600">156 pages • 42 words saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Monthly Overview</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <p className="text-sm text-gray-600 mt-2">Books Read</p>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 from last month
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600">28h</div>
              <p className="text-sm text-gray-600 mt-2">Total Reading Time</p>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5h from last month
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">86</div>
              <p className="text-sm text-gray-600 mt-2">Words Mastered</p>
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +32 from last month
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <Target className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Monthly Goal Progress</p>
                <p className="text-sm text-blue-800 mt-1">
                  You're on track to complete your monthly goals! Keep up the good work.
                  You've completed 75% of your reading goals this month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats
