'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

const BUCKET = 'progress-photos'

/** Estrae il path storage da URL pubblico Supabase (bucket progress-photos) */
export function getStoragePathFromProgressPhotoUrl(url: string): string | null {
  try {
    const match = url.match(/\/progress-photos\/([^?]+)/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

/** Mostra immagine da bucket privato progress-photos usando signed URL */
export function ProgressPhotoImage({
  imageUrl,
  alt,
  className,
  width,
  height,
}: {
  imageUrl: string
  alt: string
  className?: string
  width?: number
  height?: number
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!imageUrl || imageUrl.startsWith('data:')) {
      setSignedUrl(imageUrl)
      return
    }
    const path = getStoragePathFromProgressPhotoUrl(imageUrl)
    if (!path) {
      setSignedUrl(imageUrl)
      return
    }
    let cancelled = false
    createClient()
      .storage.from(BUCKET)
      .createSignedUrl(path, 3600)
      .then((res: { data: unknown; error: unknown }) => {
        const { data, error } = res
        if (cancelled) return
        if (error) {
          setFailed(true)
          return
        }
        setSignedUrl((data as { signedUrl?: string })?.signedUrl ?? imageUrl)
      })
    return () => {
      cancelled = true
    }
  }, [imageUrl])

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-background-tertiary ${className ?? ''}`}
        style={width && height ? { width, height } : undefined}
      >
        <span className="text-text-secondary text-xs">Immagine non disponibile</span>
      </div>
    )
  }
  if (!signedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-background-tertiary ${className ?? ''}`}
        style={width && height ? { width, height } : undefined}
      >
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }
  return (
    <Image
      src={signedUrl}
      alt={alt}
      className={className ?? 'h-full w-full object-cover'}
      width={width ?? 256}
      height={height ?? 256}
      unoptimized
    />
  )
}
