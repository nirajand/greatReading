import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock API calls
vi.mock('../../services/api', () => ({
  getBooks: vi.fn().mockResolvedValue([]),
  getReadingStats: vi.fn().mockResolvedValue({
    total_sessions: 5,
    total_minutes: 120,
    total_books: 3,
    total_words_saved: 25,
    average_session_length: 24,
  }),
  getTimerPresets: vi.fn().mockResolvedValue([
    { minutes: 5, label: 'Quick Read' },
    { minutes: 10, label: 'Focused Session' },
    { minutes: 15, label: 'Deep Dive' },
  ]),
}))

describe('Dashboard', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('renders welcome banner', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument()
      expect(screen.getByText('Continue your reading journey')).toBeInTheDocument()
    })
  })

  it('displays reading statistics', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('120 min')).toBeInTheDocument() // Total Reading Time
      expect(screen.getByText('3')).toBeInTheDocument() // Books Read
      expect(screen.getByText('25')).toBeInTheDocument() // Words Saved
      expect(screen.getByText('24 min')).toBeInTheDocument() // Average Session
    })
  })

  it('displays timer presets', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Quick Read')).toBeInTheDocument()
      expect(screen.getByText('Focused Session')).toBeInTheDocument()
      expect(screen.getByText('Deep Dive')).toBeInTheDocument()
    })
  })

  it('shows empty state for books', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('No books yet')).toBeInTheDocument()
      expect(screen.getByText('Add Your First Book')).toBeInTheDocument()
    })
  })

  it('navigates to library', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const libraryLink = screen.getByText('View all')
      expect(libraryLink.closest('a')).toHaveAttribute('href', '/library')
    })
  })

  it('starts timer when clicking start button', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const startButtons = screen.getAllByText('Start')
      expect(startButtons.length).toBeGreaterThan(0)
      
      fireEvent.click(startButtons[0])
      // Add timer start logic test here
    })
  })
})
