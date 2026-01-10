'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Home } from 'lucide-react'

export function HomeButton() {
  const router = useRouter()
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-black/80 backdrop-blur-xl border-t border-teal-500/20">
      <Button
        onClick={() => {
          router.push('/home')
        }}
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-4 text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
        aria-label="Torna alla Home"
      >
        <Home className="mr-2 h-5 w-5" />
        Torna alla Home
      </Button>
    </div>
  )
}
