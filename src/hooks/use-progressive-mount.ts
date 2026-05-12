'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type UseProgressiveMountOptions = {
  initial?: number
  step?: number
}

export function useProgressiveMount<T>(
  items: readonly T[],
  { initial = 8, step = 8 }: UseProgressiveMountOptions = {},
) {
  const [visibleCount, setVisibleCount] = useState(initial)

  useEffect(() => {
    setVisibleCount(initial)
  }, [items, initial])

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])
  const hasMore = visibleCount < items.length

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + step, items.length))
  }, [items.length, step])

  return { visibleItems, hasMore, loadMore, total: items.length }
}
