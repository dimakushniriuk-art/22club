'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const sections = [
  {
    id: '1',
    title: '1. Oggetto',
    content: (
      <p>
        I presenti Termini disciplinano l&apos;uso della piattaforma 22Club, accessibile via web e
        applicazione mobile.
      </p>
    ),
  },
  {
    id: '2',
    title: '2. Registrazione e account',
    content: (
      <p>
        Per utilizzare il servizio è necessario creare un account. L&apos;utente garantisce la
        veridicità dei dati forniti ed è responsabile della riservatezza delle credenziali.
      </p>
    ),
  },
  {
    id: '3',
    title: '3. Servizi offerti',
    content: (
      <>
        <p>
          22Club fornisce una piattaforma per la gestione di allenamenti, attività sportive, utenti
          e abbonamenti.
        </p>
        <p className="mt-2">
          22Club non fornisce consulenze mediche né sostituisce il parere di professionisti
          sanitari.
        </p>
      </>
    ),
  },
  {
    id: '4',
    title: '4. Abbonamenti e pagamenti',
    content: (
      <p>
        Alcuni servizi sono soggetti a pagamento. I pagamenti sono gestiti tramite provider esterni
        sicuri. In caso di mancato pagamento, l&apos;accesso ai servizi può essere sospeso.
      </p>
    ),
  },
  {
    id: '5',
    title: "5. Obblighi dell'utente",
    content: (
      <>
        <p>L&apos;utente si impegna a:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>usare la piattaforma in modo lecito</li>
          <li>non violare diritti di terzi</li>
          <li>non tentare accessi non autorizzati</li>
          <li>non caricare contenuti illegali o dannosi</li>
        </ul>
      </>
    ),
  },
  {
    id: '6',
    title: '6. Limitazione di responsabilità',
    content: (
      <>
        <p>22Club non è responsabile per:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>interruzioni temporanee del servizio</li>
          <li>perdita di dati dovuta a cause esterne</li>
          <li>uso improprio della piattaforma</li>
        </ul>
      </>
    ),
  },
  {
    id: '7',
    title: '7. Proprietà intellettuale',
    content: (
      <p>
        Tutti i contenuti, marchi e software sono di proprietà di 22Club o dei rispettivi titolari.
        È vietata la riproduzione non autorizzata.
      </p>
    ),
  },
  {
    id: '8',
    title: '8. Sospensione e cessazione',
    content: (
      <p>22Club può sospendere o chiudere account che violano i presenti Termini.</p>
    ),
  },
  {
    id: '9',
    title: '9. Legge applicabile e foro competente',
    content: (
      <p>I presenti Termini sono regolati dalla legge italiana. Foro competente: [●].</p>
    ),
  },
]

export function TerminiAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const isOpen = openId === section.id
        return (
          <div
            key={section.id}
            className="rounded-lg border border-border overflow-hidden bg-background/30"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-text-primary font-semibold hover:bg-background/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-inset"
              aria-expanded={isOpen}
              aria-controls={`termini-content-${section.id}`}
              id={`termini-trigger-${section.id}`}
            >
              <span className="text-brand">{section.title}</span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            <div
              id={`termini-content-${section.id}`}
              role="region"
              aria-labelledby={`termini-trigger-${section.id}`}
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-0 text-text-secondary text-[15px] leading-relaxed border-t border-border">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
