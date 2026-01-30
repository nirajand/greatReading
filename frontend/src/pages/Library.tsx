import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Upload, BookOpen, X, Trash2, User } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { enhancedApi } from '../services/enhancedApi'
import { toast } from 'sonner'
import { debounce } from 'lodash'

interface Book {
  id: number
  title: string
  author: string
  total_pages: number
  current_page: number
  file_path: string
  created_at: string
  last_read: string
}

export default function Library() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)

  // Fetch books
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => enhancedApi.getBooks(),
  })

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => enhancedApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Book deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete book')
    },
  })

  // Upload book mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      enhancedApi.uploadBook(file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      setUploading(false)
      toast.success('Book uploaded successfully')
    },
    onError: () => {
      setUploading(false)
      toast.error('Failed to upload book')
    },
  })

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      return
    }

    setUploading(true)
    const title = file.name.replace('.pdf', '')
    
    // Optimistic update: Add temporary book to UI
    const tempBook: Book = {
      id: Date.now(), // Temporary ID
      title,
      author: 'Uploading...',
      total_pages: 0,
      current_page: 0,
      file_path: '',
      created_at: new Date().toISOString(),
      last_read: new Date().toISOString(),
    }

    queryClient.setQueryData<Book[]>(['books'], (old = []) => [tempBook, ...old])

    try {
      await uploadMutation.mutateAsync({ file, title })
    } catch (error) {
      // Remove temporary book on error
      queryClient.setQueryData<Book[]>(['books'], (old = []) => 
        old.filter(b => b.id !== tempBook.id)
      )
    }
  }, [queryClient, uploadMutation])

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      // Optimistic update
      queryClient.setQueryData<Book[]>(['books'], (old = []) => 
        old.filter(book => book.id !== id)
      )
      deleteMutation.mutate(id)
    }
  }

  const filteredBooks = books?.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value)
  }, 300)

  const progressPercentage = (book: Book) => {
    return Math.round((book.current_page / book.total_pages) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">The Archive</h1>
          <p className="text-gray-400">Your personal reading collection</p>
        </div>
        
        {/* Upload Button */}
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <GlassCard className="px-6 py-3 hover:bg-white/10 transition-colors" hover={false}>
            <div className="flex items-center space-x-2">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload PDF</span>
                </>
              )}
            </div>
          </GlassCard>
        </label>
      </div>

      {/* Search Bar */}
      <GlassCard className="sticky top-24 z-40" blur="strong">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search books by title or author..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <GlassCard key={i} className="p-4" hover={false}>
              <div className="animate-pulse">
                <div className="h-48 bg-white/10 rounded-lg mb-4" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-3 bg-white/10 rounded w-3/4" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : filteredBooks && filteredBooks.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard className="p-4 h-full flex flex-col">
                  {/* Cover Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-4 overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/30" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-grow">
                    <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <User className="w-3 h-3 mr-1" />
                      <span className="line-clamp-1">{book.author}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{progressPercentage(book)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage(book)}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      Page {book.current_page} of {book.total_pages}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
                      Read
                    </button>
                    <button className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <GlassCard className="py-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Upload your first PDF to get started'}
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
              <Upload className="w-5 h-5" />
              <span>Upload PDF</span>
            </span>
          </label>
        </GlassCard>
      )}
    </div>
  )
}