'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle2, XCircle, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:admin:user-import-modal')

interface ImportResult {
  success: boolean
  email: string
  nome?: string | null
  cognome?: string | null
  message: string
  index?: number
  rowNumber?: number
}

interface UserImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type UserRole = 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete' | 'nutrizionista' | 'massaggiatore'
type UserStato = 'attivo' | 'inattivo' | 'sospeso'

interface ParsedUser {
  nome: string | null
  cognome: string | null
  email: string
  phone: string | null
  role: UserRole
  stato: UserStato
  password: string
  trainerAssegnato: string | null // Email o nome+cognome del trainer
}

export function UserImportModal({ open, onClose, onSuccess }: UserImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Verifica che sia un file CSV
    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      notifyError('Errore', 'Il file deve essere un CSV')
      return
    }

    setFile(selectedFile)
    setResults([])
    setProgress(0)
  }

  // Funzione helper per rilevare il separatore CSV (virgola o punto e virgola)
  const detectSeparator = (headerLine: string): string => {
    // Conta virgole e punti e virgola
    const commaCount = (headerLine.match(/,/g) || []).length
    const semicolonCount = (headerLine.match(/;/g) || []).length

    // Se ci sono più punti e virgola, usa quello
    if (semicolonCount > commaCount) {
      logger.debug('Separatore CSV rilevato: punto e virgola (;)', { semicolonCount, commaCount })
      return ';'
    }
    // Altrimenti usa la virgola (default)
    logger.debug('Separatore CSV rilevato: virgola (,)', { semicolonCount, commaCount })
    return ','
  }

  // Funzione helper per parsare una riga CSV (gestisce virgolette correttamente)
  const parseCSVLine = (line: string, separator: string = ','): string[] => {
    const values: string[] = []
    let currentValue = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = i + 1 < line.length ? line[i + 1] : null

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Doppia virgoletta = virgoletta escaped (RFC 4180)
          currentValue += '"'
          i++ // Salta la prossima virgoletta
        } else if (insideQuotes && nextChar === separator) {
          // Fine del campo tra virgolette
          insideQuotes = false
          // Non aggiungere la virgoletta al valore
        } else {
          // Toggle insideQuotes
          insideQuotes = !insideQuotes
          // Non aggiungere la virgoletta al valore
        }
      } else if (char === separator && !insideQuotes) {
        // Fine del valore
        values.push(currentValue)
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    // Aggiungi l'ultimo valore
    values.push(currentValue)

    return values
  }

  // Funzione per parsare il CSV
  const parseCSV = (csvText: string): ParsedUser[] => {
    // Normalizza line endings
    const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = normalizedText.split('\n').filter((line) => line.trim().length > 0)
    
    if (lines.length < 2) {
      throw new Error('Il file CSV deve contenere almeno l\'intestazione e una riga di dati')
    }

    // Rileva il separatore dalla prima riga
    const headerLine = lines[0]
    const separator = detectSeparator(headerLine)

    // Leggi l'intestazione usando il parser CSV corretto con il separatore rilevato
    const headers = parseCSVLine(headerLine, separator).map((h) => h.replace(/^"|"$/g, '').trim())

    logger.debug('Header CSV rilevati', { headers, count: headers.length })

    // Mappa degli header possibili (più flessibile)
    const headerMap: Array<{ patterns: string[]; key: string }> = [
      { patterns: ['nome', 'name', 'first name', 'firstname'], key: 'nome' },
      { patterns: ['cognome', 'surname', 'last name', 'lastname', 'cogn'], key: 'cognome' },
      { patterns: ['email', 'e-mail', 'e_mail', 'mail', 'indirizzo email'], key: 'email' },
      { patterns: ['telefono', 'phone', 'tel', 'cellulare', 'mobile'], key: 'phone' },
      { patterns: ['ruolo', 'role', 'ruolo utente'], key: 'role' },
      { patterns: ['stato', 'status', 'stato utente'], key: 'stato' },
      { patterns: ['trainer assegnato', 'trainer', 'trainerassegnato', 'pt assegnato', 'pt assegn'], key: 'trainer_assegnato' },
      { patterns: ['password', 'pwd', 'pass'], key: 'password' },
    ]

    // Trova gli indici delle colonne
    const columnIndices: Record<string, number> = {}
    
    // Prima passata: match esatti (priorità alta)
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      
      for (const { patterns, key } of headerMap) {
        // Cerca match esatto prima
        for (const pattern of patterns) {
          if (normalizedHeader === pattern) {
            if (columnIndices[key] === undefined) {
              columnIndices[key] = index
              logger.debug(`Header mappato (esatto): "${header}" -> ${key}`, { index, pattern })
              break
            }
          }
        }
        if (columnIndices[key] !== undefined) break
      }
    })

    // Seconda passata: match parziali (solo se non trovato match esatto)
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      
      // Se questa colonna non è ancora mappata, prova match parziali
      let isMapped = false
      for (const key of Object.keys(columnIndices)) {
        if (columnIndices[key] === index) {
          isMapped = true
          break
        }
      }

      if (!isMapped) {
        for (const { patterns, key } of headerMap) {
          // Se questa chiave non è ancora mappata, cerca match parziali
          if (columnIndices[key] === undefined) {
            for (const pattern of patterns) {
              if (normalizedHeader.includes(pattern) && pattern.length >= 3) {
                // Match parziale solo se il pattern è abbastanza lungo
                columnIndices[key] = index
                logger.debug(`Header mappato (parziale): "${header}" -> ${key}`, { index, pattern })
                break
              }
            }
            if (columnIndices[key] !== undefined) break
          }
        }
      }
    })

    logger.debug('Indici colonne mappati', { columnIndices, headers, rawHeaders: headers })

    // Verifica che email sia presente - con fallback diretto
    if (columnIndices.email === undefined) {
      // Fallback: cerca direttamente "email" (case-insensitive)
      const emailIndex = headers.findIndex((h) => h.toLowerCase().trim() === 'email')
      if (emailIndex !== -1) {
        columnIndices.email = emailIndex
        logger.debug('Email trovata tramite fallback diretto', { emailIndex })
      } else {
        const availableHeaders = headers.join(', ')
        throw new Error(
          `Il file CSV deve contenere una colonna "Email". Colonne trovate: ${availableHeaders}`
        )
      }
    }

    // Parsa le righe
    const users: ParsedUser[] = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Usa il parser CSV corretto per le righe con il separatore rilevato
      const values = parseCSVLine(line, separator)

      // Estrai i valori (rimuovi virgolette se presenti)
      const getValue = (index: number | undefined): string | null => {
        if (index === undefined || index >= values.length) return null
        return values[index]?.replace(/^"|"$/g, '').trim() || null
      }

      let email = getValue(columnIndices.email)
      if (!email) {
        logger.warn('Riga senza email, saltata', { rowNumber: i + 1, values })
        continue // Salta righe senza email
      }

      // Normalizza email (rimuove spazi, lowercase, trim)
      email = email.toLowerCase().trim().replace(/\s+/g, '')

      const nome = getValue(columnIndices.nome)?.trim() || null
      const cognome = getValue(columnIndices.cognome)?.trim() || null
      const phone = getValue(columnIndices.phone)?.trim() || null
      const roleRaw = getValue(columnIndices.role)?.toLowerCase().trim() || 'atleta'
      const statoRaw = getValue(columnIndices.stato)?.toLowerCase().trim() || 'attivo'
      const passwordRaw = getValue(columnIndices.password)
      // Password: usa quella fornita se valida (min 6 caratteri), altrimenti default
      const password = passwordRaw && passwordRaw.length >= 6 ? passwordRaw : 'Password123!'
      const trainerAssegnato = getValue(columnIndices.trainer_assegnato)

      // Log per debug se password non valida
      if (passwordRaw && passwordRaw.length < 6) {
        logger.warn('Password troppo corta, uso default', {
          email,
          passwordLength: passwordRaw.length,
          rowNumber: i + 2,
        })
      }

      // Normalizza ruolo
      let role: UserRole = 'atleta'
      if (roleRaw === 'admin') role = 'admin'
      else if (roleRaw === 'pt' || roleRaw === 'personal trainer' || roleRaw === 'trainer') role = 'pt'
      else if (roleRaw === 'nutrizionista') role = 'nutrizionista'
      else if (roleRaw === 'massaggiatore') role = 'massaggiatore'
      else if (roleRaw === 'atleta' || roleRaw === 'athlete') role = 'atleta'

      // Normalizza stato
      let stato: UserStato = 'attivo'
      if (statoRaw === 'inattivo') stato = 'inattivo'
      else if (statoRaw === 'sospeso') stato = 'sospeso'

      users.push({
        nome,
        cognome,
        email,
        phone,
        role,
        stato,
        password,
        trainerAssegnato,
      })
    }

    return users
  }

  const handleImport = async () => {
    if (!file) {
      notifyError('Errore', 'Seleziona un file CSV')
      return
    }

    setImporting(true)
    setResults([])
    setProgress(0)

    try {
      // Leggi il file
      const text = await file.text()

      // Parsa il CSV
      let parsedUsers: ParsedUser[]
      try {
        parsedUsers = parseCSV(text)
      } catch (parseError) {
        logger.error('Errore parsing CSV', parseError)
        notifyError('Errore', parseError instanceof Error ? parseError.message : 'Errore nel parsing del file CSV')
        setImporting(false)
        return
      }

      if (parsedUsers.length === 0) {
        notifyError('Errore', 'Nessun utente valido trovato nel file CSV')
        setImporting(false)
        return
      }

      // Importa gli utenti usando l'endpoint bulk
      setProgress(50) // Mostra progresso iniziale

      try {
        const response = await fetch('/api/admin/users/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            users: parsedUsers.map((user) => ({
              email: user.email,
              password: user.password,
              nome: user.nome,
              cognome: user.cognome,
              phone: user.phone,
              role: user.role,
              stato: user.stato,
              trainerAssegnato: user.trainerAssegnato,
            })),
          }),
        })

        setProgress(90)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Errore durante l\'import bulk')
        }

        // Converti i risultati dal formato API al formato del modal
        const importResults: ImportResult[] = data.results.map((result: ImportResult) => ({
          success: result.success,
          email: result.email,
          nome: result.nome || undefined,
          cognome: result.cognome || undefined,
          message: result.message,
          rowNumber: (result.index ?? 0) + 2, // +2 perché la prima riga è l'header e l'array parte da 0
        }))

        setResults(importResults)
        setProgress(100)

        // Mostra notifica con riepilogo
        const successCount = data.successCount || 0
        const errorCount = data.errorCount || 0

        if (errorCount === 0) {
          notifySuccess('Import completato', `Tutti i ${successCount} utenti sono stati importati con successo`)
        } else if (successCount > 0) {
          notifySuccess(
            'Import parzialmente completato',
            `${successCount} utenti importati con successo, ${errorCount} errori`,
          )
        } else {
          notifyError('Import fallito', `Nessun utente importato. ${errorCount} errori.`)
        }

        // Se almeno un utente è stato importato, aggiorna la lista
        if (successCount > 0) {
          onSuccess()
        }
      } catch (error) {
        logger.error('Errore import bulk CSV', error)
        notifyError('Errore', error instanceof Error ? error.message : 'Errore durante l\'import del file CSV')
        setImporting(false)
        return
      }
    } catch (error) {
      logger.error('Errore import CSV', error)
      notifyError('Errore', error instanceof Error ? error.message : 'Errore durante l\'import del file CSV')
    } finally {
      setImporting(false)
    }
  }

  // Funzione per scaricare il template CSV
  const handleDownloadTemplate = () => {
    try {
      // Intestazioni CSV
      const headers = ['Nome', 'Cognome', 'Email', 'Telefono', 'Ruolo', 'Stato', 'Trainer Assegnato', 'Password']
      
      // Righe di esempio
      const exampleRows = [
        ['Mario', 'Rossi', 'mario.rossi@example.com', '+39123456789', 'atleta', 'attivo', 'luigi.verdi@example.com', 'Password123!'],
        ['Luigi', 'Verdi', 'luigi.verdi@example.com', '+39987654321', 'pt', 'attivo', '', 'Password123!'],
        ['Giulia', 'Bianchi', 'giulia.bianchi@example.com', '', 'trainer', 'attivo', '', ''],
        ['Marco', 'Neri', 'marco.neri@example.com', '+39111222333', 'nutrizionista', 'attivo', '', 'Password123!'],
        ['Sofia', 'Gialli', 'sofia.gialli@example.com', '+39444555666', 'massaggiatore', 'attivo', '', 'Password123!'],
      ]

      // Crea contenuto CSV
      const csvContent = [
        headers.join(','),
        ...exampleRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      // Crea blob e scarica
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `template_import_utenti_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      notifySuccess('Template scaricato', 'File CSV template scaricato con successo')
    } catch (error) {
      logger.error('Errore download template CSV', error)
      notifyError('Errore', 'Errore durante il download del template CSV')
    }
  }

  const handleClose = () => {
    if (!importing) {
      setFile(null)
      setResults([])
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    }
  }

  const successCount = results.filter((r) => r.success).length
  const errorCount = results.filter((r) => !r.success).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background-secondary border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Importa Utenti da CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sezione selezione file */}
          {results.length === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-text-primary text-sm font-medium">Seleziona file CSV</label>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    disabled={importing}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label
                    htmlFor="csv-file-input"
                    className="flex-1 cursor-pointer rounded-lg border border-border bg-background p-4 hover:bg-background-tertiary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-text-secondary" />
                      <div className="flex-1">
                        <p className="text-text-primary text-sm font-medium">
                          {file ? file.name : 'Clicca per selezionare un file CSV'}
                        </p>
                        {file && (
                          <p className="text-text-secondary text-xs mt-1">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-lg bg-background border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-text-primary text-sm font-medium">Formato CSV richiesto:</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    disabled={importing}
                    className="bg-background-secondary border-border hover:bg-background-tertiary text-xs"
                  >
                    <Download className="h-3 w-3 mr-1.5" />
                    Scarica Template
                  </Button>
                </div>
                <div className="text-text-secondary text-xs space-y-1">
                  <p>• Intestazione: Nome, Cognome, Email, Telefono, Ruolo, Stato, Trainer Assegnato, Password</p>
                  <p>• Email è obbligatoria</p>
                  <p>• Ruolo: admin, pt, trainer, atleta, nutrizionista, massaggiatore</p>
                  <p>• Stato: attivo, inattivo, sospeso (default: attivo)</p>
                  <p>• Trainer Assegnato: email o nome+cognome del trainer (solo per atleti, opzionale)</p>
                  <p>• Password: opzionale (default: Password123!)</p>
                  <p className="text-primary/80 mt-2">
                    💡 <strong>Suggerimento:</strong> Scarica il template per vedere esempi di formato corretto
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar durante l'import */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary">Importazione in corso...</span>
                <span className="text-text-secondary">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Risultati import */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-text-primary text-lg font-semibold">Risultati Import</h4>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {successCount} successi
                  </span>
                  {errorCount > 0 && (
                    <span className="text-red-400">
                      <XCircle className="h-4 w-4 inline mr-1" />
                      {errorCount} errori
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      result.success
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-text-primary font-medium text-sm">
                            {result.nome && result.cognome
                              ? `${result.nome} ${result.cognome}`
                              : result.email}
                          </span>
                          <span className="text-text-secondary text-xs">(Riga {result.rowNumber})</span>
                        </div>
                        <p
                          className={`text-xs ${
                            result.success ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={importing}
            className="bg-background border-border hover:bg-background-tertiary"
          >
            {results.length > 0 ? 'Chiudi' : 'Annulla'}
          </Button>
          {results.length === 0 && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
              className="bg-primary hover:bg-primary/90"
            >
              {importing ? 'Importazione...' : 'Importa'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
