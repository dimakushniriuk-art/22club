'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  loadProfileLocalStorageJson,
  saveProfileLocalStorageJson,
} from '@/lib/prefs/profile-local-storage'

type Theme = 'dark' | 'light'

type ThemeContextType = {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const stored = loadProfileLocalStorageJson<Theme>(
      'theme',
      null,
      (raw) => (raw === 'light' || raw === 'dark' ? raw : 'dark'),
      { legacyKeys: ['theme'], defaultValue: 'dark' },
    )
    const initialTheme = stored.value

    setThemeState(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    saveProfileLocalStorageJson('theme', null, newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const toggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
