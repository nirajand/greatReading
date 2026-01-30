import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  BookOpen, Clock, Flame, TrendingUp, Target, Zap, 
  BarChart3, Calendar, Eye, ArrowRight, Library,
  ChevronRight, Plus, Search, Filter, MoreVertical
} from 'lucide-react'
import GlassCard from '@/components/GlassCard'
import { enhancedApi } from '@/services/enhancedApi'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

interface Book {
  id: number
  title: string
  author: string
  total_pages: number
  current_page: number
  last_read: string
  genre: string
  cover_color: string
}

interface ReadingStats {
  totalBooks: number
  totalPages: number
  readingTime: number
  currentStreak: number
  completionRate: number
  pagesReadToday: number
}

const generateMockHeatmap = () => {
  const days = []
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const intensity = Math.floor(Math.random() * 4)
    days.push({ date, intensity })
  }
  return days
}

export default function Dashboard() {
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => enhancedApi.getBooks(),
  })

  const calculateStats = (): ReadingStats => {
    if (!books || books.length === 0) {
      return {
        totalBooks: 0,
        totalPages: 0,
        readingTime: 0,
        currentStreak: 0,
        completionRate: 0,
        pagesReadToday: 0,
      }
    }

    const totalBooks = books.length
    const totalPages = books.reduce((sum, book) => sum + book.total_pages, 0)
    const readingTime = Math.floor(totalPages / 2) // 2 pages per minute
    const completionRate = Math.round(
      books.reduce((sum, book) => sum + (book.current_page / book.total_pages), 0) / books.length * 100
    )
    const pagesReadToday = books
      .filter(book => new Date(book.last_read).toDateString() === new Date().toDateString())
      .reduce((sum, book) => sum + Math.min(book.current_page, 50), 0)

    // Simple streak calculation
    let streak = 0
    const sortedDates = books
      .map(b => new Date(b.last_read))
      .sort((a, b) => b.getTime() - a.getTime())
    
    if (sortedDates.length > 0) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (sortedDates[0].toDateString() === today.toDateString() || 
          sortedDates[0].toDateString() === yesterday.toDateString()) {
        streak = Math.min(books.length, 7) // Mock streak for demo
      }
    }

    return {
      totalBooks,
      totalPages,
      readingTime,
      currentStreak: streak,
      completionRate,
      pagesReadToday,
    }
  }

  const stats = calculateStats()
  const heatmapData = generateMockHeatmap()
  const continueReadingBook = books?.sort((a, b) => 
    new Date(b.last_read).getTime() - new Date(a.last_read).getTime()
  )[0]

  const progressPercentage = continueReadingBook 
    ? Math.round((continueReadingBook.current_page / continueReadingBook.total_pages) * 100)
    : 0

  const statsCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      change: '+2 this week',
      description: 'In your library'
    },
    {
      title: 'Reading Time',
      value: `${stats.readingTime}h`,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      change: '+3h from last week',
      description: 'Total time spent'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak}d`,
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      change: 'Keep going!',
      description: 'Daily reading streak'
    },
    {
      title: 'Completion',
      value: `${stats.completionRate}%`,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      change: '+5% this month',
      description: 'Overall progress'
    }
  ]

  const readingGoals = [
    { title: 'Daily Goal', current: 45, target: 60, unit: 'pages', icon: Zap },
    { title: 'Weekly Books', current: 2, target: 3, unit: 'books', icon: Library },
    { title: 'Monthly Time', current: 12, target: 20, unit: 'hours', icon: Clock },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-8 bg-white/10 rounded w-1/2 mb-4" />
                <div className="h-4 bg-white/10 rounded w-full" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Your reading journey at a glance • {books?.length || 0} books in library
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search books, authors..."
                className="pl-10 bg-white/5 border-white/10 w-full md:w-64"
              />
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard hover gradient className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                  <Badge variant="outline" className="mt-3 bg-white/5 border-white/10">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Continue Reading - 2/3 width */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6" gradient>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Continue Reading</h2>
                <p className="text-gray-400">Pick up where you left off</p>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View all <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {continueReadingBook ? (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-32 h-48 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/30" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600">
                      {progressPercentage}%
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{continueReadingBook.title}</h3>
                        <p className="text-gray-400 mb-4">by {continueReadingBook.author}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Last read {formatDistanceToNow(new Date(continueReadingBook.last_read), { addSuffix: true })}
                          </span>
                          <span>•</span>
                          <span>{continueReadingBook.genre}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Page {continueReadingBook.current_page} of {continueReadingBook.total_pages}</span>
                        <span>{continueReadingBook.total_pages - continueReadingBook.current_page} pages left</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Continue Reading
                      </Button>
                      <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No books in progress</h3>
                <p className="text-gray-400 mb-6">Start reading to see your progress here</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Book
                </Button>
              </div>
            )}
          </GlassCard>

          {/* Goals Section */}
          <GlassCard className="mt-6 p-6">
            <h3 className="text-xl font-bold mb-6">Reading Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {readingGoals.map((goal, index) => (
                <motion.div
                  key={goal.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <goal.icon className="w-5 h-5 text-gray-400" />
                      <Badge variant="outline" className="bg-white/5">
                        {Math.round((goal.current / goal.target) * 100)}%
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-2">{goal.title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{goal.current} / {goal.target} {goal.unit}</span>
                        <span className="font-medium">{goal.current} {goal.unit}</span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Reading Velocity */}
          <GlassCard className="p-6" gradient>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Reading Velocity</h3>
                <p className="text-sm text-gray-400">Pages per day (Last 7 days)</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>

            {/* Sparkline Chart */}
            <div className="h-32 flex items-end space-x-1 mb-6">
              {[30, 45, 60, 40, 55, 70, 80].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Today</p>
                <p className="text-2xl font-bold">{stats.pagesReadToday}</p>
                <p className="text-xs text-gray-500">pages</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg/Day</p>
                <p className="text-2xl font-bold">
                  {books && books.length > 0 
                    ? Math.round(books.reduce((sum, b) => sum + b.current_page, 0) / 7)
                    : 0}
                </p>
                <p className="text-xs text-gray-500">pages</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">
                {stats.pagesReadToday > 30 
                  ? "🔥 You're reading at an excellent pace!" 
                  : stats.pagesReadToday > 15
                  ? "📈 Good progress, keep going!"
                  : "📚 Time for some reading!"}
              </p>
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {books?.slice(0, 3).map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                      {book.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{book.title}</p>
                    <p className="text-xs text-gray-400">
                      {Math.round((book.current_page / book.total_pages) * 100)}% complete
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Reading Heatmap */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Consistency</h3>
                <p className="text-sm text-gray-400">Last 90 days</p>
              </div>
              <Flame className="w-5 h-5 text-orange-400" />
            </div>

            <div className="grid grid-cols-13 gap-1">
              {heatmapData.map((day, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: `rgba(139, 92, 246, ${day.intensity * 0.25})`,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-400">Less</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: `rgba(139, 92, 246, ${level * 0.25})` }}
                  />
                ))}
              </div>
              <span className="text-gray-400">More</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Active Books</p>
          <p className="text-2xl font-bold">{books?.filter(b => b.current_page > 0).length || 0}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Avg. Pages/Day</p>
          <p className="text-2xl font-bold">
            {books && books.length > 0 
              ? Math.round(books.reduce((sum, b) => sum + b.current_page, 0) / 30)
              : 0}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Fav. Genre</p>
          <p className="text-2xl font-bold">
            {books && books.length > 0 
              ? books.reduce((acc, book) => {
                  acc[book.genre] = (acc[book.genre] || 0) + 1
                  return acc
                }, {} as Record<string, number>) 
              : 'None'}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Est. Finish</p>
          <p className="text-2xl font-bold">
            {books?.filter(b => b.current_page === b.total_pages).length || 0}
          </p>
        </div>
      </motion.div>
    </div>
  )
}