'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-white font-semibold mb-1">Controllo della tua Privacy</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Utilizziamo i cookie per migliorare la tua esperienza e analizzare il traffico del sito.
            Accettando, acconsenti all&apos;uso dei cookie come descritto nella nostra{' '}
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAccept}
            className="flex-1 md:flex-none text-slate-400 hover:text-white"
          >
            Rifiuta
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold px-8"
          >
            Accetta tutto
          </Button>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
