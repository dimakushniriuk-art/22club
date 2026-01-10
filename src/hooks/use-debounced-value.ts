import { useEffect, useState } from 'react'

/**
 * Hook per implementare debouncing di un valore
 * Utile per ricerche in tempo reale per evitare troppe chiamate API
 *
 * @param value - Il valore da "debounciare"
 * @param delay - Il ritardo in millisecondi (default: 300ms)
 * @returns Il valore debounced
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Imposta un timer per aggiornare il valore debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Pulisce il timer se il valore cambia prima che il delay sia trascorso
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
