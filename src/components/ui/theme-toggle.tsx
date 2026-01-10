'use client'

import * as React from 'react'

type ThemeName = 'athletica-dark' | 'athletica-light'

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<ThemeName>(() => {
    const current = document.documentElement.getAttribute('data-theme') as ThemeName | null
    return current ?? 'athletica-dark'
  })

  const toggle = React.useCallback(() => {
    const next: ThemeName = theme === 'athletica-dark' ? 'athletica-light' : 'athletica-dark'
    document.documentElement.setAttribute('data-theme', next)
    setTheme(next)
  }, [theme])

  return (
    <button className="btn btn-sm btn-ghost" onClick={toggle} type="button">
      {theme === 'athletica-dark' ? '🌙' : '☀️'}
    </button>
  )
}
