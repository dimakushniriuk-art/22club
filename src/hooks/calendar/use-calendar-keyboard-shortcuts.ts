'use client'

import { useEffect, useCallback } from 'react'

export type UseCalendarKeyboardShortcutsOptions = {
  showForm: boolean
  showPopover: boolean
  setShowForm: (value: boolean) => void
  setShowPopover: (value: boolean) => void
  setShowKeyboardHelp: (value: boolean) => void
}

/**
 * Registra le scorciatoie da tastiera per la pagina calendario.
 * Gestisce T (oggi), N (nuovo), M/W/D/A (viste), / (cerca), ? (aiuto), frecce, Esc.
 */
export function useCalendarKeyboardShortcuts({
  showForm,
  showPopover,
  setShowForm,
  setShowPopover,
  setShowKeyboardHelp,
}: UseCalendarKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (showForm || showPopover) {
        if (e.key === 'Escape') {
          setShowForm(false)
          setShowPopover(false)
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case 't':
          document.querySelector<HTMLButtonElement>('[data-action="today"]')?.click()
          break
        case 'n':
          e.preventDefault()
          setShowForm(true)
          break
        case 'm':
          document.querySelector<HTMLButtonElement>('[data-view="dayGridMonth"]')?.click()
          break
        case 'w':
          document.querySelector<HTMLButtonElement>('[data-view="timeGridWeek"]')?.click()
          break
        case 'd':
          document.querySelector<HTMLButtonElement>('[data-view="timeGridDay"]')?.click()
          break
        case 'a':
          document.querySelector<HTMLButtonElement>('[data-view="listWeek"]')?.click()
          break
        case '/':
          e.preventDefault()
          document.querySelector<HTMLInputElement>('[data-search]')?.focus()
          break
        case '?':
          setShowKeyboardHelp(true)
          break
        case 'arrowleft':
          document.querySelector<HTMLButtonElement>('[data-action="prev"]')?.click()
          break
        case 'arrowright':
          document.querySelector<HTMLButtonElement>('[data-action="next"]')?.click()
          break
      }
    },
    [showForm, showPopover, setShowForm, setShowPopover, setShowKeyboardHelp]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
