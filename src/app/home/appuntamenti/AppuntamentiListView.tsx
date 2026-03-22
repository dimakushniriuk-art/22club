'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { RefreshButton } from '@/components/common/RefreshButton'
import { AppointmentPopover } from '@/components/calendar'
import type { AppointmentUI, CreateAppointmentData, EditAppointmentData } from '@/types/appointment'
import { LoadingState } from '@/components/dashboard/loading-state'
import { Calendar, Clock } from 'lucide-react'
import { AppuntamentiPageHeader } from './AppuntamentiPageHeader'
import { AppointmentListCard } from './AppointmentListCard'

const AppointmentForm = lazy(() =>
  import('@/components/calendar').then((mod) => ({ default: mod.AppointmentForm })),
)

export interface AppuntamentiListViewProps {
  futureAppointments: AppointmentUI[]
  pastAppointments: AppointmentUI[]
  normalizedRole: string
  loading: boolean
  refetch: () => void | Promise<unknown>
  selectedAppointment: AppointmentUI | null
  popoverPosition: { x: number; y: number }
  showPopover: boolean
  editingAppointment: EditAppointmentData | null
  showForm: boolean
  appointments: AppointmentUI[]
  onBack: () => void
  onCardClick: (appointment: AppointmentUI, event: React.MouseEvent<HTMLDivElement>) => void
  onCardKeyDown: (appointment: AppointmentUI, event: React.KeyboardEvent<HTMLDivElement>) => void
  onEdit: () => void
  onCancel: () => void
  onDelete: () => void
  onFormSubmit: (data: CreateAppointmentData) => Promise<void>
  onClosePopover: () => void
  onCloseForm: () => void
  formPreviousFocusRef: React.RefObject<HTMLElement | null>
}

export function AppuntamentiListView({
  futureAppointments,
  pastAppointments,
  normalizedRole,
  loading,
  refetch,
  selectedAppointment,
  popoverPosition,
  showPopover,
  editingAppointment,
  showForm,
  appointments,
  onBack,
  onCardClick,
  onCardKeyDown,
  onEdit,
  onCancel,
  onDelete,
  onFormSubmit,
  onClosePopover,
  onCloseForm,
  formPreviousFocusRef: _formPreviousFocusRef,
}: AppuntamentiListViewProps) {
  const emptyTitle =
    normalizedRole === 'athlete'
      ? 'Nessun appuntamento programmato'
      : 'Nessun appuntamento per i tuoi atleti'
  const emptySubtitle =
    normalizedRole === 'athlete'
      ? 'Controlla più tardi o contatta il tuo trainer'
      : 'Gli appuntamenti dei tuoi atleti appariranno qui'

  const athleteForForm = editingAppointment?.athlete_id
    ? [
        {
          id: editingAppointment.athlete_id,
          name:
            (appointments.find((a) => a.id === editingAppointment?.id) as AppointmentUI | undefined)
              ?.athlete_name || 'Atleta',
          email: '',
        },
      ]
    : []

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <AppuntamentiPageHeader
          title="I miei Appuntamenti"
          subtitle="Visualizza i tuoi appuntamenti programmati"
          onBack={onBack}
        />

        <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <CardHeader className="pb-2.5 border-b border-white/10">
            <CardTitle
              size="sm"
              className="flex items-center gap-2 text-sm font-semibold text-text-primary"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Calendar className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="truncate">Prossimi Appuntamenti</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2.5">
            {futureAppointments.length === 0 ? (
              <div className="py-6 text-center px-2">
                <div className="mb-3 text-4xl opacity-50">📅</div>
                <h3 className="text-text-primary mb-2 text-base font-semibold line-clamp-2">
                  {emptyTitle}
                </h3>
                <p className="text-text-secondary text-xs mb-4 line-clamp-2">{emptySubtitle}</p>
                <RefreshButton
                  onRefresh={() => refetch()}
                  isLoading={loading}
                  ariaLabel="Ricarica appuntamenti"
                  className="rounded-lg border border-white/10 hover:bg-white/5 min-h-[44px] text-text-primary"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {futureAppointments.map((appointment) => (
                  <AppointmentListCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="future"
                    onClick={onCardClick}
                    onKeyDown={onCardKeyDown}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {pastAppointments.length > 0 && (
          <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <CardHeader className="pb-2.5 border-b border-white/10">
              <CardTitle
                size="sm"
                className="flex items-center gap-2 text-sm font-semibold text-text-primary"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Clock className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="truncate">Appuntamenti Passati</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2.5">
              <div className="space-y-2.5">
                {pastAppointments.map((appointment) => (
                  <AppointmentListCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="past"
                    onClick={onCardClick}
                    onKeyDown={onCardKeyDown}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showPopover && selectedAppointment && (
          <AppointmentPopover
            appointment={selectedAppointment}
            position={popoverPosition}
            onEdit={onEdit}
            onCancel={onCancel}
            onDelete={onDelete}
            onClose={onClosePopover}
            loading={loading}
            canEdit={true}
            canDelete={true}
          />
        )}

        {showForm && editingAppointment && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto overflow-x-hidden bg-black/70 backdrop-blur-sm p-3 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:p-4">
            <Suspense fallback={<LoadingState message="Caricamento form..." />}>
              <AppointmentForm
                appointment={editingAppointment}
                athletes={athleteForForm}
                onSubmit={(data) => onFormSubmit(data).then(() => {})}
                onCancel={onCloseForm}
                loading={loading}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
