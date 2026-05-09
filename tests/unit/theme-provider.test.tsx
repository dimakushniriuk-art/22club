import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'

// Mock per localStorage (prima di importare il provider)
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

let ThemeProvider: React.ComponentType<{ children: React.ReactNode }>
let useTheme: () => { theme: string; toggle: () => void; setTheme: (t: 'dark' | 'light') => void }

beforeAll(async () => {
  vi.resetModules()
  const mod = await import('@/providers/theme-provider')
  ThemeProvider = mod.ThemeProvider
  useTheme = mod.useTheme
})

// Componente di test per verificare il context
const TestComponent = () => {
  const { theme, toggle } = useTheme()

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button data-testid="toggle" onClick={toggle}>
        Toggle Theme
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  let classListToggleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    classListToggleSpy = vi.spyOn(document.documentElement.classList, 'toggle')
  })

  afterEach(() => {
    classListToggleSpy?.mockRestore()
  })

  it('should provide default dark theme', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
      { container },
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('should load theme from localStorage', async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) =>
      key === 'theme:anon' ? '"light"' : null,
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
      { container },
    )

    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'))
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme:anon')
  })

  it('should toggle theme', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
      { container },
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')

    fireEvent.click(screen.getByTestId('toggle'))

    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'))
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme:anon', '"light"')
    expect(classListToggleSpy).toHaveBeenCalledWith('dark', false)
  })

  it('should toggle from light to dark', async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) =>
      key === 'theme:anon' ? '"light"' : null,
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
      { container },
    )

    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'))

    fireEvent.click(screen.getByTestId('toggle'))

    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('dark'))
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme:anon', '"dark"')
    expect(classListToggleSpy).toHaveBeenCalledWith('dark', true)
  })

  it('should apply dark class on mount when theme is dark', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')

    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
      { container },
    )

    expect(classListToggleSpy).toHaveBeenCalledWith('dark', true)
  })

  it('should not apply dark class on mount when theme is light', async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) =>
      key === 'theme:anon' ? '"light"' : null,
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
      { container },
    )

    await waitFor(() => expect(classListToggleSpy).toHaveBeenCalledWith('dark', false))
  })
})
