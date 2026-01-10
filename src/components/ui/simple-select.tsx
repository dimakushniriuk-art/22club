'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: Array<{ value: string; label: string }>
  className?: string
  disabled?: boolean
}

export function SimpleSelect({
  value,
  onValueChange,
  placeholder = 'Seleziona...',
  options,
  className,
  disabled = false,
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(
    options.find((option) => option.value === value) || null,
  )
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const selectedOptionRef = React.useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  React.useEffect(() => {
    const option = options.find((option) => option.value === value)
    setSelectedOption(option || null)
  }, [value, options])

  // Scroll automatico all'opzione selezionata quando si apre il dropdown
  React.useEffect(() => {
    if (isOpen && selectedOptionRef.current && scrollContainerRef.current) {
      // Piccolo delay per assicurarsi che il DOM sia renderizzato
      setTimeout(() => {
        if (selectedOptionRef.current && scrollContainerRef.current) {
          const container = scrollContainerRef.current
          const selectedElement = selectedOptionRef.current

          // Calcola la posizione relativa dell'elemento selezionato
          const containerHeight = container.clientHeight
          const selectedElementTop = selectedElement.offsetTop
          const selectedElementHeight = selectedElement.offsetHeight

          // Calcola la posizione target per centrare l'elemento selezionato
          const targetScrollTop =
            selectedElementTop - containerHeight / 2 + selectedElementHeight / 2

          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
          })
        }
      }, 50)
    }
  }, [isOpen, selectedOption])

  // Funzione per calcolare la posizione del dropdown usando coordinate viewport (per fixed positioning)
  const updateDropdownPosition = React.useCallback(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Per fixed positioning, usiamo direttamente le coordinate del viewport (senza scrollY/scrollX)
      const position = {
        top: rect.bottom + 4, // 4px di margine
        left: rect.left,
        width: rect.width,
      }
      setDropdownPosition(position)
    }
  }, [isOpen])

  // Aggiorna posizione quando si apre/chiude
  React.useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
    } else {
      setDropdownPosition(null)
    }
  }, [isOpen, updateDropdownPosition])

  // Aggiorna posizione continuamente quando il dropdown è aperto
  React.useEffect(() => {
    if (!isOpen) return

    // Aggiorna immediatamente
    updateDropdownPosition()

    // Loop continuo con requestAnimationFrame per aggiornare la posizione
    let rafId: number | null = null
    let isRunning = true

    const updateLoop = () => {
      if (!isRunning) return
      updateDropdownPosition()
      rafId = requestAnimationFrame(updateLoop)
    }

    rafId = requestAnimationFrame(updateLoop)

    // Ascolta anche scroll e resize come fallback
    const handleScroll = () => {
      updateDropdownPosition()
    }
    const handleResize = () => {
      updateDropdownPosition()
    }

    // Ascolta scroll su window (principale scroll container)
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      isRunning = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', handleScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, updateDropdownPosition])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (option: { value: string; label: string }) => {
    setSelectedOption(option)
    onValueChange?.(option.value)
    setIsOpen(false)
  }

  const dropdownContent =
    isOpen && dropdownPosition ? (
      <div
        ref={dropdownRef}
        className="fixed z-[9999] rounded-lg border border-teal-500/30 bg-background-secondary/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          position: 'fixed', // Assicura che sia sempre fixed
        }}
      >
        <div ref={scrollContainerRef} className="max-h-60 overflow-auto py-1">
          {options.map((option) => (
            <button
              key={option.value}
              ref={selectedOption?.value === option.value ? selectedOptionRef : null}
              type="button"
              className={cn(
                'text-white hover:bg-teal-500/20 focus:bg-teal-500/30 flex w-full items-center px-3 py-2 text-sm focus:outline-none transition-colors duration-150 cursor-pointer',
                selectedOption?.value === option.value && 'bg-teal-500/30 text-white font-medium',
              )}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    ) : null

  return (
    <>
      <div className={cn('relative', className)}>
        <button
          ref={buttonRef}
          type="button"
          className={cn(
            'bg-background-secondary/50 text-white border-teal-500/30 focus:ring-teal-500/50 flex h-11 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-teal-500/50',
            isOpen && 'ring-teal-500/50 ring-2 border-teal-500 focus:border-teal-500',
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={cn('truncate', selectedOption ? 'text-white' : 'text-white/70')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-white/70 flex-shrink-0 ml-2 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </div>

      {/* Render dropdown in portal per evitare problemi di overflow */}
      {typeof window !== 'undefined' &&
        dropdownContent &&
        createPortal(dropdownContent, document.body)}

      {/* Backdrop - solo quando aperto */}
      {isOpen &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />,
          document.body,
        )}
    </>
  )
}
