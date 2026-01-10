'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl',
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallbackText = '?',
  size = 'md',
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(Boolean(src))

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Se non c'è src o c'è stato un errore, mostra fallback
  if (!src || imageError) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex shrink-0 items-center justify-center rounded-full font-bold select-none',
          sizeClasses[size],
          className,
        )}
        aria-label={alt}
      >
        {fallbackText.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 items-center justify-center',
        sizeClasses[size],
        className,
      )}
    >
      {imageLoading && (
        <div className="absolute inset-0 bg-background-tertiary animate-pulse rounded-full" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

// Hook per generare initials da nome, cognome, o email come fallback
export function useAvatarInitials(
  nome?: string,
  cognome?: string,
  email?: string,
): string {
  // Usa nome/cognome se disponibili
  if (nome || cognome) {
    const firstInitial = nome?.charAt(0)?.toUpperCase() || ''
    const lastInitial = cognome?.charAt(0)?.toUpperCase() || ''
    const initials = firstInitial + lastInitial
    if (initials) return initials
  }

  // Fallback: usa iniziali da email (prima lettera prima di @)
  if (email && email.includes('@')) {
    const emailPart = email.split('@')[0]
    if (emailPart.length >= 2) {
      // Prendi prima e seconda lettera dell'email
      return (emailPart.charAt(0) + emailPart.charAt(1)).toUpperCase()
    }
    if (emailPart.length === 1) {
      return emailPart.charAt(0).toUpperCase() + emailPart.charAt(0).toUpperCase()
    }
  }

  // Ultimo fallback
  return '?'
}
