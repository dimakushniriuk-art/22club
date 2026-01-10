'use client'

import Image from 'next/image'

export function LogoRefresh() {
  const handleClick = () => {
    window.location.reload()
  }

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-black rounded"
      aria-label="Aggiorna la pagina"
      type="button"
    >
      <Image src="/logo.svg" alt="22 Club Logo" width={40} height={40} className="h-10 w-auto" />
    </button>
  )
}
