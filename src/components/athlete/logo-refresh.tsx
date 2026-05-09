'use client'

import Image from 'next/image'
import Link from 'next/link'

export function LogoRefresh() {
  return (
    <Link
      href="/home"
      className="flex-shrink-0 cursor-pointer rounded transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      aria-label="Vai alla home"
    >
      <Image src="/logo.svg" alt="22 Club Logo" width={40} height={40} className="h-10 w-auto" />
    </Link>
  )
}
