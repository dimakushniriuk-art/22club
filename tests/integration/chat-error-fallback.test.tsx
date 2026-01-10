import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatPage from '@/app/home/chat/page'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  })),
}))

// Mock useAuth da providers/auth-provider
// isValidProfile richiede id e user_id come UUID validi
const validUUID = '123e4567-e89b-12d3-a456-426614174000'
vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    user: { id: validUUID, user_id: validUUID },
    loading: false,
    error: null,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock useSupabaseClient
vi.mock('@/hooks/use-supabase-client', () => ({
  useSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  })),
}))

// Mock useChat
const mockFetchConversations = vi.fn()
vi.mock('@/hooks/use-chat', () => ({
  useChat: vi.fn(() => ({
    conversations: [],
    currentConversation: null,
    sendMessage: vi.fn(),
    uploadFile: vi.fn(),
    setCurrentConversation: vi.fn(),
    loadMoreMessages: vi.fn(),
    isLoading: false,
    error: 'Test error message',
    fetchConversations: mockFetchConversations,
  })),
}))

describe('Chat Error Fallback', () => {
  let queryClient: QueryClient
  let reloadSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Mock window.location.reload usando Object.defineProperty
    // perché window.location è readonly e non può essere mockato direttamente
    reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: reloadSpy,
      },
      writable: true,
      configurable: true,
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: window.location,
      writable: true,
      configurable: true,
    })
    reloadSpy.mockClear()
  })

  it('should not call window.location.reload() on error retry', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries')

    render(
      <QueryClientProvider client={queryClient}>
        <ChatPage />
      </QueryClientProvider>,
    )

    // Verifica che l'errore sia mostrato
    await waitFor(() => {
      expect(screen.getByText(/errore nel caricamento/i)).toBeInTheDocument()
    })

    // Trova e clicca il button "Riprova"
    const retryButton = screen.getByText('Riprova')
    retryButton.click()

    // Attendi che le funzioni siano chiamate
    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalled()
      expect(refetchQueriesSpy).toHaveBeenCalled()
      expect(mockFetchConversations).toHaveBeenCalled()
    })

    // Verifica che window.location.reload() NON sia stato chiamato
    expect(reloadSpy).not.toHaveBeenCalled()
  })

  it('should use React Query refetch instead of reload', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries')

    render(
      <QueryClientProvider client={queryClient}>
        <ChatPage />
      </QueryClientProvider>,
    )

    // Verifica che l'errore sia mostrato
    await waitFor(() => {
      expect(screen.getByText(/errore nel caricamento/i)).toBeInTheDocument()
    })

    // Clicca "Riprova"
    const retryButton = screen.getByText('Riprova')
    retryButton.click()

    // Verifica che React Query refetch sia stato chiamato
    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalled()
      expect(refetchQueriesSpy).toHaveBeenCalled()
    })

    // Verifica che reload NON sia stato chiamato
    expect(reloadSpy).not.toHaveBeenCalled()
  })
})
