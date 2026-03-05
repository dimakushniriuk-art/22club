'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type Section = { id: string; title: string; content: ReactNode }

function AccordionBlock({
  section,
  isOpen,
  onToggle,
}: {
  section: Section
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-background/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-text-primary font-semibold hover:bg-background/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`privacy-content-${section.id}`}
        id={`privacy-trigger-${section.id}`}
      >
        <span className="text-brand">{section.title}</span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <div
        id={`privacy-content-${section.id}`}
        role="region"
        aria-labelledby={`privacy-trigger-${section.id}`}
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
}

const privacySections: Section[] = [
  {
    id: 'p-1',
    title: '1. Titolare del trattamento',
    content: <p>Il Titolare del trattamento è: 22Club (sede legale e email: [●]).</p>,
  },
  {
    id: 'p-2',
    title: '2. Tipologie di dati trattati',
    content: (
      <>
        <p>22Club tratta le seguenti categorie di dati personali:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Dati identificativi e di contatto (nome, cognome, email, telefono)</li>
          <li>Dati di account (credenziali, ruolo utente)</li>
          <li>Dati di utilizzo del servizio (allenamenti, attività, storico)</li>
          <li>Dati amministrativi e di pagamento (abbonamenti, stato pagamenti)</li>
          <li>Dati tecnici (IP, log, dispositivo, browser)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'p-3',
    title: '3. Finalità del trattamento',
    content: (
      <>
        <p>I dati sono trattati per:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Erogazione dei servizi della piattaforma</li>
          <li>Gestione account e profili utente</li>
          <li>Gestione allenamenti e attività sportive</li>
          <li>Gestione abbonamenti e pagamenti</li>
          <li>Comunicazioni di servizio</li>
          <li>Sicurezza, prevenzione abusi e miglioramento del servizio</li>
          <li>Adempimenti legali e fiscali</li>
        </ul>
      </>
    ),
  },
  {
    id: 'p-4',
    title: '4. Base giuridica',
    content: (
      <>
        <p>Il trattamento si fonda su:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Esecuzione di un contratto (art. 6.1.b GDPR)</li>
          <li>Obblighi legali (art. 6.1.c GDPR)</li>
          <li>Consenso dell&apos;utente, ove richiesto</li>
          <li>Legittimo interesse del Titolare (art. 6.1.f GDPR)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'p-5',
    title: '5. Modalità e sicurezza',
    content: (
      <>
        <p>Il trattamento avviene tramite strumenti informatici sicuri. 22Club utilizza:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>infrastruttura cloud sicura</li>
          <li>autenticazione e autorizzazione per ruoli</li>
          <li>Row Level Security (RLS)</li>
          <li>controllo accessi e logging</li>
          <li>cifratura ove applicabile</li>
        </ul>
      </>
    ),
  },
  {
    id: 'p-6',
    title: '6. Conservazione dei dati',
    content: (
      <p>
        I dati sono conservati per il tempo strettamente necessario alle finalità dichiarate e agli
        obblighi di legge.
      </p>
    ),
  },
  {
    id: 'p-7',
    title: '7. Destinatari dei dati',
    content: (
      <>
        <p>I dati possono essere comunicati a:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>fornitori tecnici e cloud</li>
          <li>provider di pagamento</li>
          <li>consulenti autorizzati</li>
          <li>autorità competenti</li>
        </ul>
        <p className="mt-2">I dati non sono diffusi né venduti.</p>
      </>
    ),
  },
  {
    id: 'p-8',
    title: '8. Trasferimenti extra UE',
    content: (
      <p>
        Eventuali trasferimenti avvengono nel rispetto degli artt. 44–49 GDPR (SCC, adeguatezza).
      </p>
    ),
  },
  {
    id: 'p-9',
    title: "9. Diritti dell'interessato",
    content: (
      <p>
        L&apos;utente può esercitare i diritti di cui agli artt. 15–22 GDPR (accesso, rettifica,
        cancellazione, portabilità, opposizione).
      </p>
    ),
  },
  {
    id: 'p-10',
    title: '10. Reclamo',
    content: (
      <p>È possibile proporre reclamo al Garante per la Protezione dei Dati Personali.</p>
    ),
  },
]

const terminiSections: Section[] = [
  {
    id: 't-1',
    title: '1. Oggetto',
    content: (
      <p>
        I presenti Termini disciplinano l&apos;uso della piattaforma 22Club, accessibile via web e
        applicazione mobile.
      </p>
    ),
  },
  {
    id: 't-2',
    title: '2. Registrazione e account',
    content: (
      <p>
        Per utilizzare il servizio è necessario creare un account. L&apos;utente garantisce la
        veridicità dei dati forniti ed è responsabile della riservatezza delle credenziali.
      </p>
    ),
  },
  {
    id: 't-3',
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
    id: 't-4',
    title: '4. Abbonamenti e pagamenti',
    content: (
      <p>
        Alcuni servizi sono soggetti a pagamento. I pagamenti sono gestiti tramite provider esterni
        sicuri. In caso di mancato pagamento, l&apos;accesso ai servizi può essere sospeso.
      </p>
    ),
  },
  {
    id: 't-5',
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
    id: 't-6',
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
    id: 't-7',
    title: '7. Proprietà intellettuale',
    content: (
      <p>
        Tutti i contenuti, marchi e software sono di proprietà di 22Club o dei rispettivi titolari.
        È vietata la riproduzione non autorizzata.
      </p>
    ),
  },
  {
    id: 't-8',
    title: '8. Sospensione e cessazione',
    content: (
      <p>22Club può sospendere o chiudere account che violano i presenti Termini.</p>
    ),
  },
  {
    id: 't-9',
    title: '9. Legge applicabile e foro competente',
    content: (
      <p>I presenti Termini sono regolati dalla legge italiana. Foro competente: [●].</p>
    ),
  },
]

const cookieSections: Section[] = [
  {
    id: 'c-1',
    title: '1. Cosa sono i cookie',
    content: (
      <p>
        I cookie sono piccoli file di testo che il sito invia al dispositivo dell&apos;utente per
        migliorare l&apos;esperienza di navigazione.
      </p>
    ),
  },
  {
    id: 'c-2',
    title: '2. Tipologie di cookie utilizzati',
    content: (
      <>
        <p className="font-medium text-text-primary">Cookie tecnici (necessari)</p>
        <p className="mt-1">
          Utilizzati per il corretto funzionamento della piattaforma. Non richiedono consenso.
        </p>
        <p className="font-medium text-text-primary mt-4">Cookie di funzionalità</p>
        <p className="mt-1">Permettono di memorizzare preferenze dell&apos;utente.</p>
        <p className="font-medium text-text-primary mt-4">Cookie analitici (eventuali)</p>
        <p className="mt-1">
          Utilizzati in forma aggregata e anonimizzata per analisi statistiche.
        </p>
        <p className="mt-2">
          22Club non utilizza cookie di profilazione senza consenso esplicito.
        </p>
      </>
    ),
  },
  {
    id: 'c-3',
    title: '3. Gestione dei cookie',
    content: (
      <p>
        L&apos;utente può gestire o disabilitare i cookie tramite le impostazioni del browser.
      </p>
    ),
  },
  {
    id: 'c-4',
    title: '4. Cookie di terze parti',
    content: (
      <p>
        Alcuni servizi esterni (es. pagamento, hosting) possono installare cookie propri, soggetti
        alle rispettive policy.
      </p>
    ),
  },
  {
    id: 'c-5',
    title: '5. Aggiornamenti',
    content: (
      <p>
        La presente Cookie Policy può essere aggiornata. Le modifiche saranno comunicate.
      </p>
    ),
  },
]

export function PrivacyAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-10 text-[15px] leading-relaxed">
      {/* Privacy Policy */}
      <section>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">Privacy Policy</h1>
        <p className="text-text-tertiary text-sm mb-4">
          (ai sensi degli artt. 13 e 14 Reg. UE 2016/679 – GDPR)
        </p>
        <div className="space-y-1">
          {privacySections.map((section) => (
            <AccordionBlock
              key={section.id}
              section={section}
              isOpen={openId === section.id}
              onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            />
          ))}
        </div>
      </section>

      {/* Termini e Condizioni */}
      <section className="pt-6 border-t border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">
          Termini e Condizioni di utilizzo
        </h1>
        <div className="space-y-1">
          {terminiSections.map((section) => (
            <AccordionBlock
              key={section.id}
              section={section}
              isOpen={openId === section.id}
              onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            />
          ))}
        </div>
      </section>

      {/* Cookie Policy */}
      <section className="pt-6 border-t border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">Cookie Policy</h1>
        <div className="space-y-1">
          {cookieSections.map((section) => (
            <AccordionBlock
              key={section.id}
              section={section}
              isOpen={openId === section.id}
              onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
