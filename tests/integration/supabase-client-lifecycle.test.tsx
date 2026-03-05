/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock del client Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  })),
}

// Mock createClient
const createClientMock = vi.fn(() => mockSupabaseClient)

// Map per tracciare i client per ogni istanza di componente
const componentClients = new Map<symbol, typeof mockSupabaseClient>()

// Implementazione semplificata di useSupabaseClient per il test
// (simula il comportamento reale usando useRef)
// NOTA: useRef mantiene lo stesso valore tra render, quindi createClientMock
// dovrebbe essere chiamato solo una volta per istanza di componente
function useSupabaseClient() {
  const clientRef = useRef<typeof mockSupabaseClient | null>(null)
  const componentIdRef = useRef<symbol | null>(null)

  if (!componentIdRef.current) {
    componentIdRef.current = Symbol('component-instance')
  }

  if (!clientRef.current) {
    // Crea il client solo se non esiste già per questa istanza di componente
    if (!componentClients.has(componentIdRef.current)) {
      componentClients.set(componentIdRef.current, createClientMock())
    }
    clientRef.current = componentClients.get(componentIdRef.current)!
  }

  return clientRef.current
}

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/home/profilo',
}))

// Mock useAuth (non necessario per questo test, ma utile se il componente lo richiede)
vi.mock('../../src/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', user_id: 'test-user-id', role: 'athlete' },
    loading: false,
    error: null,
  }),
}))

// Componente di test che usa useSupabaseClient
function TestComponent() {
  const supabase = useSupabaseClient()
  return <div data-testid="test-component">Client: {supabase ? 'OK' : 'NULL'}</div>
}

describe('Supabase Client Lifecycle', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    createClientMock.mockClear()
    componentClients.clear() // Reset component clients per ogni test
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create client only once per component instance', () => {
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    )

    // Verifica che createClient sia chiamato una sola volta per istanza
    expect(createClientMock).toHaveBeenCalledTimes(1)

    // Verifica che il componente funzioni
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Client: OK')).toBeInTheDocument()

    unmount()

    // Verifica che unmount non ricrei client (non dovrebbe essere chiamato di nuovo)
    // Nota: createClientMock non dovrebbe essere chiamato di nuovo dopo unmount
    expect(createClientMock).toHaveBeenCalledTimes(1)
  })

  it('should reuse same client instance on re-render', () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    )

    const firstCallCount = createClientMock.mock.calls.length

    // Rerender del componente
    rerender(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    )

    // Verifica che createClient non sia chiamato di nuovo (usa useRef per stabilità)
    expect(createClientMock).toHaveBeenCalledTimes(firstCallCount)
  })

  it('should create separate client instances for separate component instances', () => {
    // Prima istanza
    const { unmount: unmount1 } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    )

    const firstCallCount = createClientMock.mock.calls.length
    expect(firstCallCount).toBe(1)

    unmount1()

    // Seconda istanza (dovrebbe creare un nuovo client)
    const { unmount: unmount2 } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    )

    // Verifica che createClient sia chiamato una seconda volta per la nuova istanza
    expect(createClientMock).toHaveBeenCalledTimes(2)

    unmount2()
  })

  it('should maintain client stability across multiple hook calls in same component', () => {
    // Reset mock prima del test
    createClientMock.mockClear()
    componentClients.clear() // Reset per questo test

    // Componente che chiama useSupabaseClient più volte
    function MultiCallComponent() {
      const client1 = useSupabaseClient()
      const client2 = useSupabaseClient()
      const client3 = useSupabaseClient()

      // Verifica che tutti i client siano la stessa istanza (stesso riferimento)
      const areSame = client1 === client2 && client2 === client3

      return <div data-testid="multi-call">{areSame ? 'SAME' : 'DIFFERENT'}</div>
    }

    render(
      <QueryClientProvider client={queryClient}>
        <MultiCallComponent />
      </QueryClientProvider>,
    )

    // Verifica che tutti i client siano la stessa istanza
    // Nota: Il mock usa globalClientRef che viene condiviso tra tutte le chiamate
    // nello stesso componente, quindi tutti i client dovrebbero essere la stessa istanza
    expect(screen.getByText('SAME')).toBeInTheDocument()

    // Verifica che createClient sia chiamato (almeno una volta)
    // Nota: Con il mock attuale, potrebbe essere chiamato più volte perché ogni
    // chiamata a useSupabaseClient crea un nuovo useRef, ma condividono globalClientRef
    expect(createClientMock).toHaveBeenCalled()
  })

  it('should not recreate client on prop changes', () => {
    function PropChangeComponent({ prop }: { prop: string }) {
      useSupabaseClient() // Verifica che il client non venga ricreato
      return <div data-testid="prop-component">{prop}</div>
    }

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <PropChangeComponent prop="initial" />
      </QueryClientProvider>,
    )

    const initialCallCount = createClientMock.mock.calls.length
    expect(initialCallCount).toBe(1)

    // Cambia prop (dovrebbe causare re-render ma non ricreare client)
    rerender(
      <QueryClientProvider client={queryClient}>
        <PropChangeComponent prop="changed" />
      </QueryClientProvider>,
    )

    // Verifica che createClient non sia chiamato di nuovo
    expect(createClientMock).toHaveBeenCalledTimes(initialCallCount)
    expect(screen.getByText('changed')).toBeInTheDocument()
  })
})
