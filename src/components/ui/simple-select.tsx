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
  /** Rimuove lo styling del button interno (per uso in contenitori custom) */
  unstyled?: boolean
}

export function SimpleSelect({
  value,
  onValueChange,
  placeholder = 'Seleziona...',
  options,
  className,
  disabled = false,
  unstyled = false,
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
        className="fixed z-[9999] overflow-hidden rounded-xl border border-primary/35 bg-background-secondary shadow-xl shadow-black/30 backdrop-blur-xl"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          position: 'fixed',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        <div ref={scrollContainerRef} className="max-h-60 overflow-auto py-1.5">
          {options.map((option) => {
            const isSelected = selectedOption?.value === option.value
            return (
              <button
                key={option.value}
                ref={isSelected ? selectedOptionRef : null}
                type="button"
                className={cn(
                  'flex min-h-[44px] w-full cursor-pointer items-center px-4 py-2.5 text-left text-base outline-none transition-colors duration-150',
                  isSelected
                    ? 'bg-primary/25 text-primary font-medium'
                    : 'text-text-primary hover:bg-primary/15 focus:bg-primary/20',
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            )
          })}
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
            'flex w-full items-center justify-between text-sm disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            unstyled
              ? 'h-full bg-transparent border-0 px-0 py-0 focus:outline-none'
              : 'min-h-[44px] w-full rounded-xl border border-primary/35 bg-background-secondary/80 px-4 py-2.5 text-base text-text-primary outline-none placeholder:text-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 hover:bg-background-secondary',
            !unstyled && isOpen && 'border-primary ring-2 ring-primary/30',
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={cn('truncate', selectedOption ? 'text-text-primary' : 'text-text-tertiary')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 ml-2 text-text-tertiary transition-transform duration-200',
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
