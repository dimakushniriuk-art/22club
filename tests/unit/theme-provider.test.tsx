import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, useTheme } from '@/providers/theme-provider'

// Mock per localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock per document.documentElement.classList
const mockClassList = {
  toggle: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
}

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: mockClassList,
  },
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
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should provide default dark theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('should load theme from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('should toggle theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')

    fireEvent.click(screen.getByTestId('toggle'))

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false)
  })

  it('should toggle from light to dark', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')

    fireEvent.click(screen.getByTestId('toggle'))

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true)
  })

  it('should apply dark class on mount when theme is dark', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true)
  })

  it('should not apply dark class on mount when theme is light', () => {
    mockLocalStorage.getItem.mockReturnValue('light')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false)
  })
})
