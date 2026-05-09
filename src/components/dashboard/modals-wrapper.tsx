'use client'

import { useState, createContext, useContext, lazy, Suspense } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:modals-wrapper')

// Lazy load modali pesanti per ottimizzazione bundle
const AppointmentModal = lazy(() =>
  import('./appointment-modal').then((mod) => ({ default: mod.AppointmentModal })),
)
const PaymentFormModal = lazy(() =>
  import('./payment-form-modal').then((mod) => ({ default: mod.PaymentFormModal })),
)
const AssignWorkoutModal = lazy(() =>
  import('./assign-workout-modal').then((mod) => ({ default: mod.AssignWorkoutModal })),
)
const DocumentUploaderModal = lazy(() =>
  import('@/components/documents/document-uploader-modal').then((mod) => ({
    default: mod.DocumentUploaderModal,
  })),
)

// Context for modal actions
interface ModalContextType {
  openAppointment: () => void
  openPayment: () => void
  openWorkout: () => void
  openDocument: () => void
  isAvailable: boolean // Flag per verificare se il context è disponibile
}

const defaultContext: ModalContextType = {
  openAppointment: () => {
    logger.warn('ModalContext: openAppointment called but context not available')
  },
  openPayment: () => {
    logger.warn('ModalContext: openPayment called but context not available')
  },
  openWorkout: () => {
    logger.warn('ModalContext: openWorkout called but context not available')
  },
  openDocument: () => {
    logger.warn('ModalContext: openDocument called but context not available')
  },
  isAvailable: false,
}

export const ModalContext = createContext<ModalContextType>(defaultContext)

export function useModalActions() {
  return useContext(ModalContext)
}

function DashboardModalLazyFallback() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Caricamento modale"
    >
      <div className="rounded-2xl border border-white/10 bg-surface-200/90 px-5 py-4 text-sm text-text-secondary shadow-xl">
        Caricamento...
      </div>
    </div>
  )
}

export function ModalsWrapper() {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  const modalActions: ModalContextType = {
    openAppointment: () => {
      logger.debug('openAppointment called, setting showAppointmentModal to true')
      setShowAppointmentModal(true)
    },
    openPayment: () => setShowPaymentModal(true),
    openWorkout: () => setShowWorkoutModal(true),
    openDocument: () => setShowDocumentModal(true),
    isAvailable: true, // Indica che il context è disponibile
  }

  return (
    <ModalContext.Provider value={modalActions}>
      <Suspense fallback={<DashboardModalLazyFallback />}>
        <AppointmentModal
          open={showAppointmentModal}
          onOpenChange={setShowAppointmentModal}
          onSuccess={() => {
            // React Query invalida automaticamente le query, no reload necessario
          }}
        />
      </Suspense>

      <Suspense fallback={<DashboardModalLazyFallback />}>
        <PaymentFormModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onSuccess={() => {
            // React Query invalida automaticamente le query, no reload necessario
          }}
        />
      </Suspense>

      <Suspense fallback={<DashboardModalLazyFallback />}>
        <AssignWorkoutModal
          open={showWorkoutModal}
          onOpenChange={setShowWorkoutModal}
          onSuccess={() => {
            // React Query invalida automaticamente le query, no reload necessario
          }}
        />
      </Suspense>

      <Suspense fallback={<DashboardModalLazyFallback />}>
        <DocumentUploaderModal
          open={showDocumentModal}
          onOpenChange={setShowDocumentModal}
          onSuccess={() => {
            // React Query invalida automaticamente le query, no reload necessario
          }}
        />
      </Suspense>
    </ModalContext.Provider>
  )
}
