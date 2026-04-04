'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Checkbox } from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import {
  DOCUMENTS_STORAGE_BUCKET,
  fetchStorageBlobViaPreview,
  invoiceDocumentSuggestedFileName,
  resolveInvoiceDocumentsStoragePath,
} from '@/lib/documents'
import {
  Calendar,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Pencil,
  Trash2,
  Euro,
  BookOpen,
  FileUp,
  Lock,
  Unlock,
  Plus,
} from 'lucide-react'
import { COACHED_APP_DEBIT_REASON_PREFIX } from '@/lib/credits/coached-debit-reason'
import {
  parseServiceFromUrl,
  SERVICE_TYPES,
  type ServiceType,
} from '@/lib/abbonamenti-service-type'
import { lessonUsageByAthleteIds } from '@/lib/credits/athlete-training-lessons-display'
import {
  addCreditFromPayment,
  addReversalFromPayment,
  insertManualCreditLedgerRow,
} from '@/lib/credits/ledger'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  SimpleSelect,
  Textarea,
} from '@/components/ui'
import { NuovoPagamentoModal } from '@/components/dashboard/nuovo-pagamento-modal'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import {
  JSPDF_DEFAULT_MARGIN_MM,
  loadProjectLogoPngDataUrl,
  stampProjectLogoOnCurrentPage,
} from '@/lib/pdf'

const logger = createLogger('app:dashboard:pagamenti:atleta:page')

const UUID_LOOSE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type AthleteHeader = { id: string; nome: string | null; cognome: string | null }

type LedgerManualCreateForm = {
  entry_type: 'CREDIT' | 'DEBIT' | 'REVERSAL'
  qty: number
  service_type: ServiceType
  reason: string
  created_at_local: string
  payment_id: string
  appointment_id: string
  applies_to_counter: boolean
}

type PaymentRow = {
  id: string
  athlete_id: string
  created_at: string
  payment_date: string | null
  lessons_purchased: number
  amount: number
  invoice_url: string | null
  status: string | null
  is_reversal: boolean | null
  ref_payment_id: string | null
}

type LedgerDebitRow = {
  id: string
  created_at: string
  qty: number
  reason: string | null
  appointment_id: string | null
  service_type: string
}

type LedgerMovementRow = {
  id: string
  created_at: string
  entry_type: string
  qty: number
  reason: string | null
  appointment_id: string | null
  payment_id: string | null
  service_type: string
}

type LedgerMovementUi = {
  id: string
  date: string
  entryType: 'CREDIT' | 'DEBIT' | 'REVERSAL' | 'OTHER'
  qty: number
  label: string
  notes: string | null
  serviceType: string
  paymentId: string | null
  appointmentId: string | null
}

type AppointmentRow = {
  id: string
  starts_at: string
  ends_at: string
  type: string
  notes: string | null
}

type WorkoutLogRow = {
  id: string
  completed_at: string | null
  started_at: string | null
  scheda_id: string | null
  scheda_name: string | null
  note: string | null
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function invoiceFileLabel(invoiceUrl: string, fallbackDateIso: string): string {
  const parts = invoiceUrl.trim().split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (last) return last
  return `Fattura ${new Date(fallbackDateIso).toLocaleDateString('it-IT')}`
}

function pickDebitDisplayDate(row: {
  ledgerCreatedAt: string
  appointmentStartsAt?: string | null
  workoutCompletedAt?: string | null
}): string {
  return row.workoutCompletedAt || row.appointmentStartsAt || row.ledgerCreatedAt
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PagamentiAtletaPage() {
  const params = useParams<{ athleteId: string }>()
  const athleteId = params?.athleteId
  const searchParams = useSearchParams()
  const serviceType: ServiceType = parseServiceFromUrl(searchParams.get('service')) ?? 'training'

  const [athlete, setAthlete] = useState<AthleteHeader | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [counter, setCounter] = useState<{
    remaining: number
    used: number
    purchased: number
  } | null>(null)
  const [movements, setMovements] = useState<LedgerMovementUi[]>([])
  const [ledgerEditOpen, setLedgerEditOpen] = useState(false)
  const [ledgerEditingId, setLedgerEditingId] = useState<string | null>(null)
  const [ledgerEditForm, setLedgerEditForm] = useState<{
    entry_type: 'CREDIT' | 'DEBIT' | 'REVERSAL'
    qty: number
    reason: string
    created_at_local: string
    service_type: string
    payment_id: string | null
    appointment_id: string | null
  } | null>(null)
  const [ledgerEditSaving, setLedgerEditSaving] = useState(false)
  const [ledgerDeleteOpen, setLedgerDeleteOpen] = useState(false)
  const [ledgerMovementToDelete, setLedgerMovementToDelete] = useState<{
    id: string
    label: string
  } | null>(null)
  const [ledgerDeleting, setLedgerDeleting] = useState(false)
  const [ledgerMovementActionsUnlocked, setLedgerMovementActionsUnlocked] = useState(false)
  const [ledgerCreateOpen, setLedgerCreateOpen] = useState(false)
  const [ledgerCreateSaving, setLedgerCreateSaving] = useState(false)
  const [ledgerCreateForm, setLedgerCreateForm] = useState<LedgerManualCreateForm | null>(null)
  const [paymentRowActionsUnlocked, setPaymentRowActionsUnlocked] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newPaymentOpen, setNewPaymentOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editInvoiceFile, setEditInvoiceFile] = useState<File | null>(null)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfPreviewBlob, setPdfPreviewBlob] = useState<Blob | null>(null)
  const [pdfPreviewFilename, setPdfPreviewFilename] = useState<string | null>(null)
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false)
  const [editForm, setEditForm] = useState<{
    payment_date: string
    lessons_purchased: number
    amount: number
    status: 'completed' | 'cancelled'
  } | null>(null)
  const [debits, setDebits] = useState<
    Array<{
      id: string
      date: string
      qty: number
      source: 'appointment' | 'workout_log' | 'other'
      schedaName: string | null
      contextLabel: string
      notes: string | null
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const invoiceOnlyFileInputRef = useRef<HTMLInputElement>(null)
  const invoiceOnlyPaymentRef = useRef<PaymentRow | null>(null)
  const [invoiceOnlyUploadingId, setInvoiceOnlyUploadingId] = useState<string | null>(null)
  const [invoicePreviewLoadingPaymentId, setInvoicePreviewLoadingPaymentId] = useState<
    string | null
  >(null)

  const athleteName = useMemo(() => {
    if (!athlete) return 'Atleta'
    const n = `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim()
    return n || 'Atleta'
  }, [athlete])

  const paymentsKpis = useMemo(() => {
    const eligible = payments.filter((p) => {
      if (p.is_reversal) return false
      if (p.status === 'cancelled') return false
      if (p.amount <= 0) return false
      if (p.lessons_purchased <= 0) return false
      return true
    })
    const totalPaid = eligible.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const totalLessons = eligible.reduce((sum, p) => sum + (Number(p.lessons_purchased) || 0), 0)
    const avgPerLesson = totalLessons > 0 ? totalPaid / totalLessons : 0
    return { totalPaid, totalLessons, avgPerLesson }
  }, [payments])

  const closePdfPreview = useCallback((open: boolean) => {
    setPdfPreviewOpen(open)
    if (!open) {
      setPdfPreviewFilename(null)
      setPdfPreviewBlob(null)
      setPdfPreviewLoading(false)
    }
  }, [])

  const handleExportPaymentsPdf = useCallback(async () => {
    if (debits.length === 0 && payments.length === 0 && movements.length === 0) return

    const safeName = athleteName
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .trim()
      .replace(/\s+/g, '_')
    const filename = `pagamenti_${safeName || 'atleta'}_${serviceType}_${new Date().toISOString().split('T')[0]}.pdf`

    setPdfPreviewLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const paymentStato = (p: PaymentRow) =>
        p.is_reversal ? 'Storno' : p.status === 'cancelled' ? 'Stornato' : 'Attivo'

      const byDateDesc = (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime()

      const debitsSorted = [...debits].sort((a, b) => byDateDesc(a.date, b.date))
      const paymentsSorted = [...payments].sort((a, b) =>
        byDateDesc(a.payment_date ?? a.created_at, b.payment_date ?? b.created_at),
      )
      const movementsSorted = [...movements].sort((a, b) => byDateDesc(a.date, b.date))

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const logoPng = await loadProjectLogoPngDataUrl()
      const margin = JSPDF_DEFAULT_MARGIN_MM
      if (logoPng) stampProjectLogoOnCurrentPage(doc, logoPng, { marginMm: margin })

      let cursorY = margin

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`Tabelle pagamenti — ${athleteName}`, margin, cursorY)
      cursorY += 7
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Service: ${serviceType}`, margin, cursorY)
      cursorY += 5
      doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, cursorY)
      cursorY += 8

      const docWithAuto = doc as import('jspdf').jsPDF & {
        lastAutoTable?: { finalY: number }
      }

      const headStyle = {
        fillColor: [6, 182, 212] as [number, number, number],
        textColor: [0, 0, 0] as [number, number, number],
        fontStyle: 'bold' as const,
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Storico consumi lezioni', margin, cursorY)
      cursorY += 6
      doc.setFont('helvetica', 'normal')

      autoTable(doc, {
        startY: cursorY,
        head: [['Data/Ora', 'Scheda / Attività', 'Lezioni', 'Note']],
        body:
          debitsSorted.length === 0
            ? [['—', 'Nessun consumo registrato', '—', '—']]
            : debitsSorted.map((d) => [
                formatDateTime(d.date),
                d.contextLabel,
                String(d.qty),
                d.notes?.trim() ? d.notes : '—',
              ]),
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: headStyle,
        margin: { left: margin, right: margin },
      })

      cursorY = (docWithAuto.lastAutoTable?.finalY ?? cursorY) + 10

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Pagamenti', margin, cursorY)
      cursorY += 6
      doc.setFont('helvetica', 'normal')

      autoTable(doc, {
        startY: cursorY,
        head: [['Data', 'Allenamenti', 'Fattura', 'Pagato', 'Stato']],
        body:
          paymentsSorted.length === 0
            ? [['—', '—', 'Nessun pagamento', '—', '—']]
            : paymentsSorted.map((p) => {
                const dateIso = p.payment_date ?? p.created_at
                return [
                  formatDateTime(dateIso),
                  String(p.lessons_purchased),
                  p.invoice_url ? invoiceFileLabel(p.invoice_url, dateIso) : '—',
                  formatCurrency(p.amount),
                  paymentStato(p),
                ]
              }),
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: headStyle,
        margin: { left: margin, right: margin },
        columnStyles: {
          1: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'center' },
        },
      })

      cursorY = (docWithAuto.lastAutoTable?.finalY ?? cursorY) + 10

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Storico movimenti', margin, cursorY)
      cursorY += 6
      doc.setFont('helvetica', 'normal')

      autoTable(doc, {
        startY: cursorY,
        head: [['Tipo', 'Qty', 'Data/Ora', 'Causale']],
        body:
          movementsSorted.length === 0
            ? [['—', '—', 'Nessun movimento', '—']]
            : movementsSorted.map((m) => [
                m.entryType,
                String(m.qty),
                formatDateTime(m.date),
                m.label,
              ]),
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: headStyle,
        margin: { left: margin, right: margin },
        columnStyles: {
          1: { halign: 'right' },
        },
      })

      if (logoPng) {
        const pageCount = doc.getNumberOfPages()
        for (let p = 2; p <= pageCount; p++) {
          doc.setPage(p)
          stampProjectLogoOnCurrentPage(doc, logoPng, { marginMm: margin })
        }
        doc.setPage(1)
      }

      const blob = doc.output('blob') as Blob
      setPdfPreviewBlob(blob)
      setPdfPreviewFilename(filename)
      setPdfPreviewOpen(true)
    } catch (err) {
      logger.error('Errore export PDF pagamenti', err, { athleteId, serviceType })
      setError(err instanceof Error ? err.message : 'Errore durante export PDF')
    } finally {
      setPdfPreviewLoading(false)
    }
  }, [athleteId, athleteName, debits, movements, payments, serviceType])

  const load = useCallback(async () => {
    if (!athleteId) return
    try {
      setLoading(true)
      setError(null)

      const { data: athleteRow, error: athleteErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome')
        .eq('id', athleteId)
        .maybeSingle()

      if (athleteErr) throw athleteErr
      setAthlete((athleteRow as AthleteHeader | null) ?? null)

      const { data: paymentsRows, error: paymentsErr } = await supabase
        .from('payments')
        .select(
          'id, athlete_id, created_at, payment_date, lessons_purchased, amount, invoice_url, status, is_reversal, ref_payment_id',
        )
        .eq('athlete_id', athleteId)
        .eq('service_type', serviceType)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (paymentsErr) throw paymentsErr

      setPayments((paymentsRows as PaymentRow[] | null) ?? [])

      // Contatore attuale (allineato a dashboard abbonamenti / profilo atleta)
      const usage = await lessonUsageByAthleteIds(supabase, [athleteId], serviceType)
      const u = usage.get(athleteId)
      setCounter(
        u
          ? { remaining: u.totalRemaining, used: u.totalUsed, purchased: u.totalPurchased }
          : { remaining: 0, used: 0, purchased: 0 },
      )

      // Storico consumi lezioni (DEBIT)
      const { data: ledgerRows, error: ledgerErr } = await supabase
        .from('credit_ledger')
        .select('id, created_at, qty, reason, appointment_id, service_type')
        .eq('athlete_id', athleteId)
        .eq('entry_type', 'DEBIT')
        .eq('service_type', serviceType)
        .order('created_at', { ascending: false })

      if (ledgerErr) throw ledgerErr

      const debitRows = ((ledgerRows as LedgerDebitRow[] | null) ?? []).filter((r) => r.qty === -1)

      const appointmentIds = [
        ...new Set(debitRows.map((r) => r.appointment_id).filter((x): x is string => !!x)),
      ]
      const workoutLogIds = [
        ...new Set(
          debitRows
            .map((r) => (r.reason ?? '').trim())
            .filter((r) => r.startsWith(COACHED_APP_DEBIT_REASON_PREFIX))
            .map((r) => r.slice(COACHED_APP_DEBIT_REASON_PREFIX.length))
            .filter(Boolean),
        ),
      ]

      const [appointmentsRes, workoutLogsRes] = await Promise.all([
        appointmentIds.length > 0
          ? supabase
              .from('appointments')
              .select('id, starts_at, ends_at, type, notes')
              .in('id', appointmentIds)
          : Promise.resolve({ data: [] as AppointmentRow[], error: null }),
        workoutLogIds.length > 0
          ? supabase
              .from('workout_logs')
              .select(
                'id, completed_at, started_at, scheda_id, note, scheda:workout_plans!scheda_id(name)',
              )
              .in('id', workoutLogIds)
          : Promise.resolve({ data: [] as unknown[], error: null }),
      ])

      if (appointmentsRes.error) throw appointmentsRes.error
      if (workoutLogsRes.error) throw workoutLogsRes.error

      const appointmentsById = new Map<string, AppointmentRow>()
      ;((appointmentsRes.data as AppointmentRow[] | null) ?? []).forEach((a) => {
        appointmentsById.set(a.id, a)
      })

      const workoutLogsById = new Map<string, WorkoutLogRow>()
      ;((workoutLogsRes.data as unknown[] | null) ?? []).forEach((raw) => {
        const r = raw as {
          id: string
          completed_at: string | null
          started_at: string | null
          scheda_id: string | null
          note: string | null
          scheda?: { name?: string | null } | null
        }
        workoutLogsById.set(r.id, {
          id: r.id,
          completed_at: r.completed_at ?? null,
          started_at: r.started_at ?? null,
          scheda_id: r.scheda_id ?? null,
          scheda_name: r.scheda?.name ?? null,
          note: r.note ?? null,
        })
      })

      const mappedDebits = debitRows
        .map((r) => {
          const reason = (r.reason ?? '').trim()
          const isWorkoutLog = reason.startsWith(COACHED_APP_DEBIT_REASON_PREFIX)
          const workoutLogId = isWorkoutLog
            ? reason.slice(COACHED_APP_DEBIT_REASON_PREFIX.length)
            : null
          const wl = workoutLogId ? workoutLogsById.get(workoutLogId) : undefined
          const apt = r.appointment_id ? appointmentsById.get(r.appointment_id) : undefined

          const source: 'appointment' | 'workout_log' | 'other' = apt
            ? 'appointment'
            : wl
              ? 'workout_log'
              : 'other'

          const date = pickDebitDisplayDate({
            ledgerCreatedAt: r.created_at,
            appointmentStartsAt: apt?.starts_at ?? null,
            workoutCompletedAt: wl?.completed_at ?? null,
          })

          const qty = Math.abs(r.qty)
          const schedaName = wl?.scheda_name ?? null

          const contextLabel =
            source === 'appointment'
              ? `Appuntamento (${apt?.type ?? 'servizio'})`
              : source === 'workout_log'
                ? schedaName
                  ? `Scheda: ${schedaName}`
                  : 'Allenamento coachato'
                : reason || 'Consumo lezione'

          const notes =
            source === 'appointment'
              ? (apt?.notes ?? null)
              : source === 'workout_log'
                ? (wl?.note ?? null)
                : (r.reason ?? null)

          return {
            id: r.id,
            date,
            qty,
            source,
            schedaName,
            contextLabel,
            notes,
          }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setDebits(mappedDebits)

      // Storico movimenti completo (CREDIT/DEBIT/REVERSAL)
      const { data: movementRows, error: movementErr } = await supabase
        .from('credit_ledger')
        .select('id, created_at, entry_type, qty, reason, appointment_id, payment_id, service_type')
        .eq('athlete_id', athleteId)
        .eq('service_type', serviceType)
        .order('created_at', { ascending: false })

      if (movementErr) throw movementErr

      const mappedMovements = ((movementRows as LedgerMovementRow[] | null) ?? [])
        .map((r) => {
          const etRaw = String(r.entry_type ?? '').toUpperCase()
          const entryType: 'CREDIT' | 'DEBIT' | 'REVERSAL' | 'OTHER' =
            etRaw === 'CREDIT' || etRaw === 'DEBIT' || etRaw === 'REVERSAL' ? etRaw : 'OTHER'

          const reason = (r.reason ?? '').trim()

          const label =
            entryType === 'CREDIT'
              ? reason || 'Acquisto crediti'
              : entryType === 'REVERSAL'
                ? reason || 'Storno'
                : entryType === 'DEBIT'
                  ? (() => {
                      const isWorkoutLog = reason.startsWith(COACHED_APP_DEBIT_REASON_PREFIX)
                      if (isWorkoutLog) {
                        const id = reason.slice(COACHED_APP_DEBIT_REASON_PREFIX.length)
                        const wl = id ? workoutLogsById.get(id) : undefined
                        if (wl?.scheda_name) return `Scheda: ${wl.scheda_name}`
                        return 'Allenamento coachato'
                      }
                      if (r.appointment_id) return 'Appuntamento completato'
                      return reason || 'Consumo lezione'
                    })()
                  : reason || 'Movimento'

          return {
            id: r.id,
            date: r.created_at,
            entryType,
            qty: Number(r.qty ?? 0),
            label,
            notes: reason || null,
            serviceType: String(r.service_type ?? serviceType),
            paymentId: r.payment_id ?? null,
            appointmentId: r.appointment_id ?? null,
          }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setMovements(mappedMovements)
    } catch (err) {
      logger.error('Errore caricamento pagamenti atleta', err, { athleteId })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei pagamenti')
    } finally {
      setLoading(false)
    }
  }, [athleteId, serviceType])

  useEffect(() => {
    void load()
  }, [load])

  const openLedgerMovementEdit = useCallback((m: LedgerMovementUi) => {
    const et: 'CREDIT' | 'DEBIT' | 'REVERSAL' =
      m.entryType === 'CREDIT' || m.entryType === 'DEBIT' || m.entryType === 'REVERSAL'
        ? m.entryType
        : 'DEBIT'
    setLedgerEditingId(m.id)
    setLedgerEditForm({
      entry_type: et,
      qty: m.qty,
      reason: m.notes ?? '',
      created_at_local: toDatetimeLocalValue(m.date),
      service_type: m.serviceType,
      payment_id: m.paymentId,
      appointment_id: m.appointmentId,
    })
    setLedgerEditOpen(true)
  }, [])

  const saveLedgerMovementEdit = useCallback(async () => {
    if (!athleteId || !ledgerEditingId || !ledgerEditForm) return
    const qty = Number(ledgerEditForm.qty)
    if (!qty || qty === 0) {
      setError('Quantità non valida (deve essere diversa da zero).')
      return
    }
    if (!ledgerEditForm.created_at_local.trim()) {
      setError('Data/ora obbligatoria.')
      return
    }
    const createdAtDate = new Date(ledgerEditForm.created_at_local)
    if (Number.isNaN(createdAtDate.getTime())) {
      setError('Data/ora non valida.')
      return
    }
    setLedgerEditSaving(true)
    setError(null)
    try {
      const createdIso = createdAtDate.toISOString()
      const { error: updErr } = await supabase.rpc('staff_update_credit_ledger_movement', {
        p_id: ledgerEditingId,
        p_athlete_id: athleteId,
        p_service_type: serviceType,
        p_entry_type: ledgerEditForm.entry_type,
        p_qty: qty,
        p_reason: ledgerEditForm.reason.trim() || null,
        p_created_at: createdIso,
      })
      if (updErr) throw updErr
      setLedgerEditOpen(false)
      setLedgerEditingId(null)
      setLedgerEditForm(null)
      await load()
    } catch (err) {
      logger.error('Errore aggiornamento credit_ledger', err, { ledgerId: ledgerEditingId })
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio del movimento')
    } finally {
      setLedgerEditSaving(false)
    }
  }, [athleteId, ledgerEditForm, ledgerEditingId, load, serviceType])

  const requestDeleteLedgerMovement = useCallback((m: LedgerMovementUi) => {
    setLedgerMovementToDelete({
      id: m.id,
      label: `${m.entryType} · ${m.label} · qty ${m.qty}`,
    })
    setLedgerDeleteOpen(true)
  }, [])

  const confirmDeleteLedgerMovement = useCallback(async () => {
    if (!athleteId || !ledgerMovementToDelete) return
    setLedgerDeleting(true)
    setError(null)
    try {
      const { error: delErr } = await supabase.rpc('staff_delete_credit_ledger_movement', {
        p_id: ledgerMovementToDelete.id,
        p_athlete_id: athleteId,
        p_service_type: serviceType,
      })
      if (delErr) throw delErr
      setLedgerDeleteOpen(false)
      setLedgerMovementToDelete(null)
      await load()
    } catch (err) {
      logger.error('Errore eliminazione credit_ledger', err, {
        ledgerId: ledgerMovementToDelete.id,
      })
      setError(err instanceof Error ? err.message : 'Errore durante eliminazione movimento')
    } finally {
      setLedgerDeleting(false)
    }
  }, [athleteId, ledgerMovementToDelete, load, serviceType])

  const openLedgerManualCreate = useCallback(() => {
    setLedgerCreateForm({
      entry_type: 'DEBIT',
      qty: -1,
      service_type: serviceType,
      reason: '',
      created_at_local: toDatetimeLocalValue(new Date().toISOString()),
      payment_id: '',
      appointment_id: '',
      applies_to_counter: true,
    })
    setLedgerCreateOpen(true)
  }, [serviceType])

  const saveLedgerManualCreate = useCallback(async () => {
    if (!athleteId || !ledgerCreateForm) return
    const qty = Number(ledgerCreateForm.qty)
    if (!qty || qty === 0) {
      setError('Quantità non valida (deve essere diversa da zero).')
      return
    }
    if (ledgerCreateForm.entry_type === 'CREDIT' && qty <= 0) {
      setError('Per CREDIT la quantità deve essere positiva (es. lezioni accreditate).')
      return
    }
    if (
      (ledgerCreateForm.entry_type === 'DEBIT' || ledgerCreateForm.entry_type === 'REVERSAL') &&
      qty >= 0
    ) {
      setError('Per DEBIT / REVERSAL la quantità deve essere negativa (es. -1).')
      return
    }
    if (!ledgerCreateForm.created_at_local.trim()) {
      setError('Data/ora obbligatoria.')
      return
    }
    const createdAtDate = new Date(ledgerCreateForm.created_at_local)
    if (Number.isNaN(createdAtDate.getTime())) {
      setError('Data/ora non valida.')
      return
    }

    const payRaw = ledgerCreateForm.payment_id.trim()
    if (payRaw && !UUID_LOOSE.test(payRaw)) {
      setError('payment_id: UUID non valido (lascia vuoto se assente).')
      return
    }
    const aptRaw = ledgerCreateForm.appointment_id.trim()
    if (aptRaw && !UUID_LOOSE.test(aptRaw)) {
      setError('appointment_id: UUID non valido (lascia vuoto se assente).')
      return
    }

    setLedgerCreateSaving(true)
    setError(null)
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Utente non autenticato')

      const { data: staffProfile, error: staffErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (staffErr) throw staffErr
      const staffId = (staffProfile as { id?: string } | null)?.id
      if (!staffId) throw new Error('Profilo staff non trovato')

      await insertManualCreditLedgerRow({
        athleteId,
        entryType: ledgerCreateForm.entry_type,
        qty,
        serviceType: ledgerCreateForm.service_type,
        reason: ledgerCreateForm.reason.trim() ? ledgerCreateForm.reason.trim() : null,
        createdAtIso: createdAtDate.toISOString(),
        createdByProfileId: staffId,
        paymentId: payRaw ? payRaw.toLowerCase() : null,
        appointmentId: aptRaw ? aptRaw.toLowerCase() : null,
        appliesToCounter: ledgerCreateForm.applies_to_counter,
      })

      setLedgerCreateOpen(false)
      setLedgerCreateForm(null)
      await load()
    } catch (err) {
      logger.error('Errore insert manuale credit_ledger', err, { athleteId })
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del movimento')
    } finally {
      setLedgerCreateSaving(false)
    }
  }, [athleteId, ledgerCreateForm, load])

  const openInvoicePdfPreview = useCallback(
    async (paymentId: string, invoiceUrl: string, fallbackDateIso: string) => {
      const filePath = resolveInvoiceDocumentsStoragePath(invoiceUrl)
      if (!filePath) {
        setError('Percorso fattura non valido')
        return
      }
      const safeName = invoiceDocumentSuggestedFileName(invoiceUrl, fallbackDateIso)
      setError(null)
      setInvoicePreviewLoadingPaymentId(paymentId)
      try {
        const blob = await fetchStorageBlobViaPreview(DOCUMENTS_STORAGE_BUCKET, filePath)
        setPdfPreviewBlob(blob)
        setPdfPreviewFilename(safeName)
        setPdfPreviewOpen(true)
      } catch (err) {
        logger.error('Errore anteprima fattura PDF', err, { paymentId })
        setError(err instanceof Error ? err.message : 'Errore durante il caricamento della fattura')
      } finally {
        setInvoicePreviewLoadingPaymentId(null)
      }
    },
    [],
  )

  const handleDeletePayment = useCallback((p: PaymentRow) => {
    setPaymentToDelete(p)
    setDeleteDialogOpen(true)
  }, [])

  const startInvoiceOnlyUpload = useCallback((p: PaymentRow) => {
    if (p.invoice_url) return
    if (p.is_reversal || p.status === 'cancelled') return
    invoiceOnlyPaymentRef.current = p
    invoiceOnlyFileInputRef.current?.click()
  }, [])

  const onInvoiceOnlyFileSelected = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      const targetPayment = invoiceOnlyPaymentRef.current
      invoiceOnlyPaymentRef.current = null
      e.target.value = ''
      if (!file || !targetPayment) return

      setError(null)
      setInvoiceOnlyUploadingId(targetPayment.id)
      try {
        const fileExt = file.name.split('.').pop() || 'pdf'
        const storagePath = `fatture/${serviceType}/${targetPayment.athlete_id}/${targetPayment.id}.${fileExt}`
        const { error: uploadErr } = await supabase.storage
          .from(DOCUMENTS_STORAGE_BUCKET)
          .upload(storagePath, file, { cacheControl: '3600', upsert: true })
        if (uploadErr) throw uploadErr

        const { error: invUpdErr } = await supabase
          .from('payments')
          .update({ invoice_url: storagePath })
          .eq('id', targetPayment.id)
        if (invUpdErr) throw invUpdErr

        await load()
      } catch (err) {
        logger.error('Errore caricamento fattura (solo allegato)', err, {
          paymentId: targetPayment.id,
        })
        setError(err instanceof Error ? err.message : 'Errore durante il caricamento della fattura')
      } finally {
        setInvoiceOnlyUploadingId(null)
      }
    },
    [load, serviceType],
  )

  const openEditPayment = useCallback((p: PaymentRow) => {
    setEditingPayment(p)
    const iso =
      (p.payment_date ?? p.created_at).split('T')[0] ?? new Date().toISOString().split('T')[0]
    setEditInvoiceFile(null)
    setEditForm({
      payment_date: iso,
      lessons_purchased: Number(p.lessons_purchased ?? 0) || 0,
      amount: Number(p.amount ?? 0) || 0,
      status: p.status === 'cancelled' ? 'cancelled' : 'completed',
    })
    setEditOpen(true)
  }, [])

  const saveEditedPaymentAsHistory = useCallback(async () => {
    if (!editingPayment || !editForm) return

    setEditSaving(true)
    setError(null)
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Utente non autenticato')

      const { data: staffProfile, error: staffErr } = await supabase
        .from('profiles')
        .select('id, org_id, role')
        .eq('user_id', user.id)
        .maybeSingle()
      if (staffErr) throw staffErr
      if (!staffProfile?.id) throw new Error('Profilo staff non trovato')

      const orgIdRaw = (staffProfile as { org_id?: string | null }).org_id
      let orgId: string | undefined =
        orgIdRaw && String(orgIdRaw).trim() ? String(orgIdRaw).trim() : undefined
      if (!orgId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rpcOrg, error: rpcErr } = await (supabase.rpc as any)(
            'get_org_id_for_current_user',
          )
          if (!rpcErr && rpcOrg) {
            orgId = String(rpcOrg).trim()
          }
        } catch {
          /* ignora: fallback sotto */
        }
      }
      if (!orgId || orgId.trim() === '') {
        throw new Error(
          'Organizzazione non configurata. Imposta org_id sul profilo o verifica get_org_id_for_current_user().',
        )
      }

      // org_id atleta per insert su credit_ledger (trigger org-match)
      // 1) Cancella (status) il pagamento originale per mantenere storico
      const { error: cancelErr } = await supabase
        .from('payments')
        .update({
          status: 'cancelled',
          notes: `Sostituito il ${new Date().toISOString()} da ${staffProfile.id}`,
        })
        .eq('id', editingPayment.id)
      if (cancelErr) throw cancelErr

      // 2) Ledger: storno crediti del pagamento originale
      await addReversalFromPayment(
        {
          id: editingPayment.id,
          athlete_id: editingPayment.athlete_id,
          lessons_purchased: editingPayment.lessons_purchased ?? 0,
          serviceType: serviceType,
        },
        staffProfile.id,
      )

      // 3) Crea nuovo pagamento corretto
      const paymentDateIso = new Date(editForm.payment_date).toISOString()
      const { data: newPaymentRow, error: newPayErr } = await supabase
        .from('payments')
        .insert({
          athlete_id: editingPayment.athlete_id,
          amount: editForm.amount,
          payment_date: paymentDateIso,
          lessons_purchased: editForm.lessons_purchased,
          status: editForm.status,
          created_by_staff_id: staffProfile.id,
          created_by_profile_id: staffProfile.id,
          org_id: orgId,
          service_type: serviceType,
          payment_method: 'abbonamento',
          notes: `Correzione di pagamento ${editingPayment.id}`,
        })
        .select('id')
        .single()
      if (newPayErr) throw newPayErr
      const newPaymentId = (newPaymentRow as { id?: string } | null)?.id
      if (!newPaymentId) throw new Error('Pagamento creato ma ID non disponibile')

      // 4) Fattura: se caricata, upload su nuovo id
      if (editInvoiceFile) {
        const fileExt = editInvoiceFile.name.split('.').pop() || 'pdf'
        const storagePath = `fatture/${serviceType}/${editingPayment.athlete_id}/${newPaymentId}.${fileExt}`
        const { error: uploadErr } = await supabase.storage
          .from(DOCUMENTS_STORAGE_BUCKET)
          .upload(storagePath, editInvoiceFile, { cacheControl: '3600', upsert: true })
        if (uploadErr) throw uploadErr
        const { error: invUpdErr } = await supabase
          .from('payments')
          .update({ invoice_url: storagePath })
          .eq('id', newPaymentId)
        if (invUpdErr) throw invUpdErr
      }

      // 5) Ledger: accredita crediti sul nuovo pagamento
      await addCreditFromPayment({
        id: newPaymentId,
        athlete_id: editingPayment.athlete_id,
        lessons_purchased: editForm.lessons_purchased,
        created_by_staff_id: staffProfile.id,
        serviceType: serviceType,
      })

      setEditOpen(false)
      setEditingPayment(null)
      setEditForm(null)
      setEditInvoiceFile(null)
      await load()
    } catch (err) {
      logger.error('Errore modifica pagamento (storico)', err, { paymentId: editingPayment.id })
      setError(err instanceof Error ? err.message : 'Errore durante modifica pagamento')
    } finally {
      setEditSaving(false)
    }
  }, [editForm, editInvoiceFile, editingPayment, load, serviceType])

  const confirmDeletePayment = useCallback(async () => {
    if (!paymentToDelete) return
    setIsDeleting(true)
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('Utente non autenticato')

      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (profileErr) throw profileErr

      const deletedByProfileId = (profileRow as { id?: string } | null)?.id ?? null

      const { error: updErr } = await supabase
        .from('payments')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by_profile_id: deletedByProfileId,
        })
        .eq('id', paymentToDelete.id)

      if (updErr) throw updErr

      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
      await load()
    } catch (err) {
      logger.error('Errore eliminazione pagamento', err, { paymentId: paymentToDelete.id })
      setError(err instanceof Error ? err.message : 'Errore durante eliminazione pagamento')
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setPaymentToDelete(null)
    }
  }, [load, paymentToDelete])

  if (loading) {
    return <StaffDashboardSegmentSkeleton />
  }

  const serviceTypeLabel = SERVICE_TYPES.find((s) => s.value === serviceType)?.label ?? serviceType

  return (
    <StaffContentLayout
      title={`Storico ${athleteName}`}
      description={`Pagamenti e crediti · servizio ${serviceTypeLabel.toLowerCase()}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportPaymentsPdf()}
            disabled={debits.length === 0 && payments.length === 0 && movements.length === 0}
          >
            {pdfPreviewLoading ? 'Generazione…' : 'Esporta PDF'}
          </Button>
          <Button size="sm" variant="primary" onClick={() => setNewPaymentOpen(true)}>
            Nuovo Pagamento
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <input
          ref={invoiceOnlyFileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          aria-hidden
          onChange={(e) => void onInvoiceOnlyFileSelected(e)}
        />
        {error && (
          <Card variant="default" className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-red-200">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void load()}>
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-1">
            <Card variant="default">
              <CardContent className="p-4 space-y-3">
                <div className="rounded-lg border border-border bg-background-tertiary/30 p-3">
                  <p className="text-text-secondary text-sm mb-1">Contatore attuale</p>
                  <p className="text-2xl font-bold text-text-primary">{counter?.remaining ?? 0}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-background-tertiary/20 p-3">
                    <p className="text-text-secondary text-xs mb-1">Usate</p>
                    <p className="text-lg font-semibold text-text-primary">{counter?.used ?? 0}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background-tertiary/20 p-3">
                    <p className="text-text-secondary text-xs mb-1">Acquistate</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {counter?.purchased ?? 0}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-lg border border-border bg-background-tertiary/20 p-3">
                    <p className="text-text-secondary text-xs mb-1">Totale pagato</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {formatCurrency(paymentsKpis.totalPaid)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background-tertiary/20 p-3">
                    <p className="text-text-secondary text-xs mb-1">Costo medio per lezione</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {paymentsKpis.totalLessons > 0
                        ? `${formatCurrency(paymentsKpis.avgPerLesson)} / lezione`
                        : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card variant="default" className="overflow-hidden">
              <CardHeader>
                <CardTitle size="md">Storico consumi lezioni ({debits.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/[0.02]">
                      <tr>
                        <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                          Data/Ora
                        </th>
                        <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                          Scheda / Attività
                        </th>
                        <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                          Lezioni
                        </th>
                        <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {debits.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-text-secondary">
                            Nessun consumo registrato
                          </td>
                        </tr>
                      ) : (
                        debits.map((d) => (
                          <tr key={d.id} className="hover:bg-white/[0.04] transition-colors">
                            <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                              {formatDateTime(d.date)}
                            </td>
                            <td className="px-4 py-3 text-text-primary">
                              <span className="font-medium">{d.contextLabel}</span>
                            </td>
                            <td className="px-4 py-3 text-center text-text-primary font-semibold">
                              {d.qty}
                            </td>
                            <td className="px-4 py-3 text-text-secondary text-sm">
                              {d.notes?.trim() ? (
                                d.notes
                              ) : (
                                <span className="text-text-tertiary">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card variant="default" className="overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <CardTitle size="md" className="min-w-0">
              Pagamenti ({payments.length})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto shrink-0 gap-1.5"
              onClick={() => {
                setPaymentRowActionsUnlocked((prev) => {
                  const next = !prev
                  if (!next) {
                    setEditOpen(false)
                    setEditingPayment(null)
                    setEditForm(null)
                    setEditInvoiceFile(null)
                    setDeleteDialogOpen(false)
                    setPaymentToDelete(null)
                    closePdfPreview(false)
                  }
                  return next
                })
              }}
              title={
                paymentRowActionsUnlocked
                  ? 'Blocca: nasconde azioni sui pagamenti'
                  : 'Sblocca per mostrare azioni sui pagamenti'
              }
              aria-pressed={paymentRowActionsUnlocked}
            >
              {paymentRowActionsUnlocked ? (
                <Unlock className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <Lock className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="text-xs font-medium">
                {paymentRowActionsUnlocked ? 'Blocca' : 'Sblocca'}
              </span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Data
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Allenamenti
                    </th>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Fattura
                    </th>
                    <th className="px-4 py-3 text-right text-text-primary text-sm font-semibold">
                      Pagato
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Stato
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-text-secondary">
                        Nessun pagamento trovato
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => {
                      const dateIso = p.payment_date ?? p.created_at
                      const hasInvoice = !!p.invoice_url
                      const canAttachInvoiceOnly =
                        !hasInvoice && !p.is_reversal && p.status !== 'cancelled'
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="px-4 py-3 text-text-secondary">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-text-tertiary" />
                              <span className="text-text-primary text-sm">
                                {formatDateTime(dateIso)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-text-primary font-semibold">
                            {p.lessons_purchased}
                          </td>
                          <td className="px-4 py-3 text-left text-text-primary text-sm">
                            {hasInvoice ? (
                              <span className="inline-flex items-center gap-2">
                                <FileText className="h-4 w-4 text-text-tertiary" />
                                {invoiceFileLabel(p.invoice_url!, dateIso)}
                              </span>
                            ) : (
                              <span className="text-text-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-text-primary font-semibold">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={p.is_reversal ? 'warning' : 'success'} size="sm">
                              {p.is_reversal
                                ? 'Storno'
                                : p.status === 'cancelled'
                                  ? 'Stornato'
                                  : 'Attivo'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {paymentRowActionsUnlocked ? (
                              <div className="flex items-center justify-center gap-2">
                                {hasInvoice ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      void openInvoicePdfPreview(p.id, p.invoice_url!, dateIso)
                                    }
                                    disabled={invoicePreviewLoadingPaymentId === p.id}
                                    title="Anteprima fattura PDF"
                                    className="gap-1.5"
                                  >
                                    <Eye className="h-4 w-4 shrink-0" />
                                    <span className="text-xs font-semibold">PDF</span>
                                  </Button>
                                ) : (
                                  <>
                                    <span className="text-text-secondary text-xs">
                                      Nessuna fattura
                                    </span>
                                    {canAttachInvoiceOnly ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startInvoiceOnlyUpload(p)}
                                        disabled={invoiceOnlyUploadingId === p.id}
                                        className="border-orange-400/70 text-orange-300 hover:border-orange-300/80 hover:bg-orange-500/15 active:bg-orange-500/25 focus-visible:ring-1 focus-visible:ring-orange-400"
                                        title="Carica fattura"
                                      >
                                        <Download className="h-4 w-4 rotate-180" />
                                      </Button>
                                    ) : null}
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditPayment(p)}
                                  title="Modifica"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePayment(p)}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                  title="Elimina"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  title="Storno (da Gestione Pagamenti)"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-text-tertiary text-sm tabular-nums">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {athleteId && (
          <NuovoPagamentoModal
            open={newPaymentOpen}
            onOpenChange={setNewPaymentOpen}
            serviceType={serviceType}
            defaultAthleteId={athleteId}
            lockAthlete
            onSuccess={() => {
              setNewPaymentOpen(false)
              void load()
            }}
          />
        )}

        {paymentToDelete && (
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setPaymentToDelete(null)
            }}
            title="Elimina pagamento"
            description="Vuoi eliminare questo pagamento? L'operazione è reversibile solo lato database."
            confirmText="Elimina"
            cancelText="Annulla"
            variant="destructive"
            onConfirm={confirmDeletePayment}
            loading={isDeleting}
          />
        )}

        {ledgerMovementToDelete && (
          <ConfirmDialog
            open={ledgerDeleteOpen}
            onOpenChange={(open) => {
              setLedgerDeleteOpen(open)
              if (!open) setLedgerMovementToDelete(null)
            }}
            title="Elimina movimento ledger"
            description={`Questa azione rimuove il movimento dal registro crediti in modo definitivo e può modificare il conteggio lezioni visibile in app. Confermi? Movimento: ${ledgerMovementToDelete.label}`}
            confirmText="Elimina dal DB"
            cancelText="Annulla"
            variant="destructive"
            onConfirm={confirmDeleteLedgerMovement}
            loading={ledgerDeleting}
          />
        )}

        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) {
              setEditingPayment(null)
              setEditForm(null)
              setEditInvoiceFile(null)
            }
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Modifica pagamento</DialogTitle>
              <DialogDescription>
                La modifica viene salvata “a storico”: il pagamento originale viene stornato e viene
                creato un nuovo record.
              </DialogDescription>
            </DialogHeader>

            {!editingPayment || !editForm ? null : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data *
                  </label>
                  <Input
                    type="date"
                    value={editForm.payment_date}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, payment_date: e.target.value } : prev,
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Allenamenti *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.lessons_purchased}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                lessons_purchased: parseInt(e.target.value || '0', 10) || 0,
                              }
                            : prev,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Pagato (€) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, amount: parseFloat(e.target.value || '0') || 0 } : prev,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Stato *</label>
                  <SimpleSelect
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, status: value as 'completed' | 'cancelled' } : prev,
                      )
                    }
                    options={[
                      { value: 'completed', label: 'Attivo' },
                      { value: 'cancelled', label: 'Stornato' },
                    ]}
                    placeholder="Seleziona stato..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Fattura (PDF)
                  </label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setEditInvoiceFile(f)
                    }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                Annulla
              </Button>
              <Button
                onClick={() => void saveEditedPaymentAsHistory()}
                disabled={editSaving || !editingPayment || !editForm}
              >
                Salva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={ledgerEditOpen}
          onOpenChange={(open) => {
            setLedgerEditOpen(open)
            if (!open) {
              setLedgerEditingId(null)
              setLedgerEditForm(null)
            }
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Modifica movimento ledger</DialogTitle>
              <DialogDescription>
                Le modifiche aggiornano il registro crediti e possono cambiare il conteggio lezioni.
                Se il movimento è legato a un pagamento o a un appuntamento, il salvataggio può
                essere rifiutato per vincoli del database.
              </DialogDescription>
            </DialogHeader>

            {ledgerEditForm ? (
              <div className="space-y-4">
                <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-text-secondary space-y-1">
                  <p>
                    <span className="text-text-tertiary">Service:</span>{' '}
                    {ledgerEditForm.service_type}
                  </p>
                  {ledgerEditForm.payment_id ? (
                    <p>
                      <span className="text-text-tertiary">payment_id:</span>{' '}
                      {ledgerEditForm.payment_id}
                    </p>
                  ) : null}
                  {ledgerEditForm.appointment_id ? (
                    <p>
                      <span className="text-text-tertiary">appointment_id:</span>{' '}
                      {ledgerEditForm.appointment_id}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Tipo movimento *</label>
                  <SimpleSelect
                    value={ledgerEditForm.entry_type}
                    onValueChange={(value) =>
                      setLedgerEditForm((prev) =>
                        prev
                          ? { ...prev, entry_type: value as 'CREDIT' | 'DEBIT' | 'REVERSAL' }
                          : prev,
                      )
                    }
                    options={[
                      { value: 'CREDIT', label: 'CREDIT' },
                      { value: 'DEBIT', label: 'DEBIT' },
                      { value: 'REVERSAL', label: 'REVERSAL' },
                    ]}
                    placeholder="Tipo…"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Quantità (qty) *</label>
                  <Input
                    type="number"
                    step="1"
                    value={ledgerEditForm.qty}
                    onChange={(e) =>
                      setLedgerEditForm((prev) =>
                        prev ? { ...prev, qty: parseInt(e.target.value || '0', 10) || 0 } : prev,
                      )
                    }
                  />
                  <p className="text-text-tertiary text-xs">
                    Valor tipici: CREDIT positivo, DEBIT negativo, REVERSAL negativo.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Data/ora (created_at) *
                  </label>
                  <Input
                    type="datetime-local"
                    value={ledgerEditForm.created_at_local}
                    onChange={(e) =>
                      setLedgerEditForm((prev) =>
                        prev ? { ...prev, created_at_local: e.target.value } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Causale (reason)</label>
                  <Textarea
                    value={ledgerEditForm.reason}
                    onChange={(e) =>
                      setLedgerEditForm((prev) =>
                        prev ? { ...prev, reason: e.target.value } : prev,
                      )
                    }
                    rows={3}
                    className="min-h-[80px] resize-y"
                  />
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setLedgerEditOpen(false)
                  setLedgerEditingId(null)
                  setLedgerEditForm(null)
                }}
                disabled={ledgerEditSaving}
              >
                Annulla
              </Button>
              <Button
                onClick={() => void saveLedgerMovementEdit()}
                disabled={ledgerEditSaving || !ledgerEditForm}
              >
                Salva su DB
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={ledgerCreateOpen}
          onOpenChange={(open) => {
            setLedgerCreateOpen(open)
            if (!open) setLedgerCreateForm(null)
          }}
        >
          <DialogContent className="max-w-xl max-h-[min(90vh,720px)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo movimento ledger (manuale)</DialogTitle>
              <DialogDescription>
                Inserisci una riga su <code className="text-xs">credit_ledger</code> senza passare
                da pagamenti o calendario. Per il servizio <strong>training</strong> il riepilogo
                lezioni usa i DEBIT nel ledger: un CREDIT manuale compare qui ma non aumenta le
                lezioni &quot;acquistate&quot; (quelle restano legate ai pagamenti).{' '}
                <code className="text-xs">payment_id</code> /{' '}
                <code className="text-xs">appointment_id</code> devono esistere se compilati;
                vincoli univoci del DB possono rifiutare duplicati.
              </DialogDescription>
            </DialogHeader>

            {ledgerCreateForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Tipo movimento *</label>
                  <SimpleSelect
                    value={ledgerCreateForm.entry_type}
                    onValueChange={(value) =>
                      setLedgerCreateForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              entry_type: value as LedgerManualCreateForm['entry_type'],
                            }
                          : prev,
                      )
                    }
                    options={[
                      { value: 'CREDIT', label: 'CREDIT (qty positiva)' },
                      { value: 'DEBIT', label: 'DEBIT (qty negativa)' },
                      { value: 'REVERSAL', label: 'REVERSAL (qty negativa)' },
                    ]}
                    placeholder="Tipo…"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Servizio *</label>
                  <SimpleSelect
                    value={ledgerCreateForm.service_type}
                    onValueChange={(value) =>
                      setLedgerCreateForm((prev) =>
                        prev ? { ...prev, service_type: value as ServiceType } : prev,
                      )
                    }
                    options={[
                      { value: 'training', label: 'training' },
                      { value: 'nutrition', label: 'nutrition' },
                      { value: 'massage', label: 'massage' },
                    ]}
                    placeholder="Servizio…"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Quantità (qty) *</label>
                  <Input
                    type="number"
                    step="1"
                    value={ledgerCreateForm.qty}
                    onChange={(e) =>
                      setLedgerCreateForm((prev) =>
                        prev ? { ...prev, qty: parseInt(e.target.value || '0', 10) || 0 } : prev,
                      )
                    }
                  />
                  <p className="text-text-tertiary text-xs">
                    CREDIT: positivo (es. 5). DEBIT / REVERSAL: negativo (es. -1).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Data/ora (created_at) *
                  </label>
                  <Input
                    type="datetime-local"
                    value={ledgerCreateForm.created_at_local}
                    onChange={(e) =>
                      setLedgerCreateForm((prev) =>
                        prev ? { ...prev, created_at_local: e.target.value } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Causale (reason)</label>
                  <Textarea
                    value={ledgerCreateForm.reason}
                    onChange={(e) =>
                      setLedgerCreateForm((prev) =>
                        prev ? { ...prev, reason: e.target.value } : prev,
                      )
                    }
                    rows={3}
                    className="min-h-[80px] resize-y"
                    placeholder="Es. Rettifica manuale, omaggio lezioni, …"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    payment_id (opzionale)
                  </label>
                  <Input
                    value={ledgerCreateForm.payment_id}
                    onChange={(e) =>
                      setLedgerCreateForm((prev) =>
                        prev ? { ...prev, payment_id: e.target.value } : prev,
                      )
                    }
                    placeholder="UUID o vuoto"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    appointment_id (opzionale)
                  </label>
                  <Input
                    value={ledgerCreateForm.appointment_id}
                    onChange={(e) =>
                      setLedgerCreateForm((prev) =>
                        prev ? { ...prev, appointment_id: e.target.value } : prev,
                      )
                    }
                    placeholder="UUID o vuoto"
                    className="font-mono text-xs"
                  />
                </div>

                <Checkbox
                  checked={ledgerCreateForm.applies_to_counter}
                  onChange={(e) =>
                    setLedgerCreateForm((prev) =>
                      prev ? { ...prev, applies_to_counter: e.target.checked } : prev,
                    )
                  }
                  label="Applica al contatore lezioni (applies_to_counter)"
                  helperText="Disattiva solo in casi eccezionali; la maggior parte dei movimenti deve aggiornare il conteggio."
                />
              </div>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setLedgerCreateOpen(false)
                  setLedgerCreateForm(null)
                }}
                disabled={ledgerCreateSaving}
              >
                Annulla
              </Button>
              <Button
                onClick={() => void saveLedgerManualCreate()}
                disabled={ledgerCreateSaving || !ledgerCreateForm}
              >
                Inserisci nel DB
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <PdfCanvasPreviewDialog
          open={pdfPreviewOpen}
          onOpenChange={closePdfPreview}
          blob={pdfPreviewBlob}
          filename={pdfPreviewFilename}
        />

        <Card variant="default" className="overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <CardTitle size="md" className="min-w-0">
              Storico movimenti ({movements.length})
            </CardTitle>
            <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => {
                  setLedgerMovementActionsUnlocked((prev) => {
                    const next = !prev
                    if (!next) {
                      setLedgerEditOpen(false)
                      setLedgerEditingId(null)
                      setLedgerEditForm(null)
                      setLedgerDeleteOpen(false)
                      setLedgerMovementToDelete(null)
                      setLedgerCreateOpen(false)
                      setLedgerCreateForm(null)
                    }
                    return next
                  })
                }}
                title={
                  ledgerMovementActionsUnlocked
                    ? 'Blocca: nasconde modifica ed elimina movimenti'
                    : 'Sblocca per mostrare modifica ed elimina movimenti'
                }
                aria-pressed={ledgerMovementActionsUnlocked}
              >
                {ledgerMovementActionsUnlocked ? (
                  <Unlock className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <Lock className="h-4 w-4 shrink-0" aria-hidden />
                )}
                <span className="text-xs font-medium">
                  {ledgerMovementActionsUnlocked ? 'Blocca' : 'Sblocca'}
                </span>
              </Button>
              {ledgerMovementActionsUnlocked ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={openLedgerManualCreate}
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-xs font-medium">Nuovo movimento</span>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-right text-text-primary text-sm font-semibold">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Data/Ora
                    </th>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Causale
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-text-secondary">
                        Nessun movimento
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              m.entryType === 'DEBIT'
                                ? 'warning'
                                : m.entryType === 'REVERSAL'
                                  ? 'warning'
                                  : m.entryType === 'CREDIT'
                                    ? 'success'
                                    : 'default'
                            }
                            size="sm"
                          >
                            {m.entryType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary font-semibold">
                          {m.qty}
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {formatDateTime(m.date)}
                        </td>
                        <td className="px-4 py-3 text-text-primary text-sm">{m.label}</td>
                        <td className="px-4 py-3 text-center">
                          {ledgerMovementActionsUnlocked ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openLedgerMovementEdit(m)}
                                title="Modifica movimento ledger"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => requestDeleteLedgerMovement(m)}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                title="Elimina movimento dal DB"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-text-tertiary text-sm tabular-nums">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffContentLayout>
  )
}
