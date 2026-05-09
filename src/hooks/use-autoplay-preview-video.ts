'use client'

import { useEffect, useRef, type RefObject } from 'react'

export type UseAutoplayPreviewVideoOptions = {
  /** When false, observers and listeners are not attached */
  enabled?: boolean
  /**
   * If true (default), pause when the element leaves the viewport.
   * Set false for modals/lightbox so playback is not tied to intersection.
   */
  pauseWhenOffscreen?: boolean
}

/**
 * Muted preview clips: aligns with browser autoplay rules (muted + play()),
 * retries when the tab becomes visible and optionally when the element scrolls into view.
 */
export function useAutoplayPreviewVideo(
  options: UseAutoplayPreviewVideoOptions = {},
): RefObject<HTMLVideoElement | null> {
  const { enabled = true, pauseWhenOffscreen = true } = options
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!enabled) return
    const video = ref.current
    if (!video) return

    const safePlay = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      video.muted = true
      void video.play().catch(() => {})
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        safePlay()
      } else {
        video.pause()
      }
    }

    let io: IntersectionObserver | undefined
    if (pauseWhenOffscreen && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) safePlay()
            else video.pause()
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px 12% 0px' },
      )
      io.observe(video)
    } else {
      safePlay()
    }

    document.addEventListener('visibilitychange', onVisibility)
    video.addEventListener('loadeddata', safePlay)
    video.addEventListener('canplay', safePlay)

    safePlay()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      video.removeEventListener('loadeddata', safePlay)
      video.removeEventListener('canplay', safePlay)
      io?.disconnect()
    }
  }, [enabled, pauseWhenOffscreen])

  return ref
}
