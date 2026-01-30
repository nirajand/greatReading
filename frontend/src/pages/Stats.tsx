import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, PieChart, BarChart3, TrendingUp, Target } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { enhancedApi } from '../services/enhancedApi'

interface Book {
  id: number
  title: string
  author: string
  genre: string
  total_pages: number
  current_page: number
  last_read: string
}

interface ReadingStats {
  totalPages: number
  completedBooks: number
  averageProgress: number
  readingConsistency: number
  favoriteGenre: string
  pagesPerDay: number
}

export default function Stats() {
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => enhancedApi.getBooks(),
  })

  const calculateStats = (): ReadingStats => {
    if (!books || books.length === 0) {
      return {
        totalPages: 0,
        completedBooks: 0,
        averageProgress: 0,
        readingConsistency: 0,
        favoriteGenre: 'None',
        pagesPerDay: 0,
      }
    }

    const totalPages = books.reduce((sum, book) => sum + book.total_pages, 0)
    const completedBooks = books.filter(book => book.current_page === book.total_pages).length
    const averageProgress = Math.round(
      books.reduce((sum, book) => sum + (book.current_page / book.total_pages), 0) / books.length * 100
    )
    
    // Calculate reading consistency (days with reading activity in last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toDateString()
    })
    
    const readingDays = new Set(
      books
        .map(book => new Date(book.last_read).toDateString())
        .filter(date => last30Days.includes(date))
    ).size
    
    const readingConsistency = Math.round((readingDays / 30) * 100)

    // Find favorite genre
    const genreCount: Record<string, number> = {}
    books.forEach(book => {
      if (book.genre) {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1
      }
    })
    
    const favoriteGenre = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Uncategorized'

    // Calculate pages per day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toDateString()
    })
    
    const recentPages = books.reduce((sum, book) => {
      const lastReadDate = new Date(book.last_read).toDateString()
      if (last7Days.includes(lastReadDate)) {
        return sum + Math.min(book.current_page, 50) // Cap at 50 pages per day for calculation
      }
      return sum
    }, 0)
    
    const pagesPerDay = Math.round(recentPages / 7)

    return {
      totalPages,
      completedBooks,
      averageProgress,
      readingConsistency,
      favoriteGenre,
      pagesPerDay,
    }
  }

  const stats = calculateStats()

  // Generate heatmap data (last 90 days)
  const generateHeatmapData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Count books read on this day
      const booksRead = books?.filter(book => 
        new Date(book.last_read).toDateString() === date.toDateString()
      ).length || 0
      
      data.push({
        date,
        count: booksRead,
        intensity: Math.min(booksRead * 3, 10) // Scale intensity
      })
    }
    
    return data
  }

  const heatmapData = generateHeatmapData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">The Insights</h1>
          <p className="text-gray-400">Deep dive into your reading patterns</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last updated: Today</span>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Pages',
            value: stats.totalPages.toLocaleString(),
            icon: BookOpen,
            color: 'from-purple-500 to-pink-500',
          },
          {
            title: 'Completed Books',
            value: stats.completedBooks,
            icon: Target,
            color: 'from-green-500 to-emerald-500',
          },
          {
            title: 'Avg Progress',
            value: `${stats.averageProgress}%`,
            icon: TrendingUp,
            color: 'from-blue-500 to-cyan-500',
          },
          {
            title: 'Consistency',
            value: `${stats.readingConsistency}%`,
            icon: BarChart3,
            color: 'from-orange-500 to-amber-500',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Consistency Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Reading Consistency</h2>
                <p className="text-sm text-gray-400">Last 90 days</p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {/* Heatmap Grid */}
              <div className="grid grid-cols-13 gap-1">
                {heatmapData.map((day, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${day.intensity / 10})`,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    title={`${day.date.toLocaleDateString()}: ${day.count} books read`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Less</span>
                <div className="flex space-x-1">
                  {[0, 2, 4, 6, 8, 10].map((intensity) => (
                    <div
                      key={intensity}
                      className="w-4 h-4 rounded-sm"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${intensity / 10})`,
                      }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Genre Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Genre Distribution</h2>
                <p className="text-sm text-gray-400">Across your library</p>
              </div>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {/* Pie Chart Placeholder */}
              <div className="relative h-48 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {[30, 25, 20, 15, 10].map((percent, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border-8"
                      style={{
                        clipPath: `circle(50% at 50% 50%)`,
                        transform: `rotate(${i * 72}deg)`,
                        borderColor: [
                          '#8B5CF6',
                          '#3B82F6',
                          '#10B981',
                          '#F59E0B',
                          '#EF4444'
                        ][i],
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Genre List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                    <span>Fiction</span>
                  </div>
                  <span className="text-gray-400">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                    <span>Non-Fiction</span>
                  </div>
                  <span className="text-gray-400">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <span>Science</span>
                  </div>
                  <span className="text-gray-400">20%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Favorite genre: <span className="text-purple-400 font-medium">{stats.favoriteGenre}</span>
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reading Pace */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Reading Pace</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pages per day</span>
                <span>{stats.pagesPerDay}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${Math.min(stats.pagesPerDay, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {stats.pagesPerDay > 30 
                ? "You're reading at an excellent pace! 📚" 
                : stats.pagesPerDay > 15
                ? "Good progress, keep going! 👍"
                : "Try to read a few pages each day 💡"}
            </div>
          </div>
        </GlassCard>

        {/* Completion Rate */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Completion Rate</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {books && books.length > 0
                  ? Math.round((stats.completedBooks / books.length) * 100)
                  : 0}%
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-400">Books completed</p>
                <p className="text-lg">
                  {stats.completedBooks} / {books?.length || 0}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {stats.completedBooks === books?.length && books.length > 0
                ? "Perfect completion rate! 🌟"
                : "Finish what you start for better insights"}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}