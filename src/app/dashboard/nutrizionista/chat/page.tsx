'use client'

import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { ChatPageContent } from '@/app/dashboard/chat/page'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function NutrizionistaChatPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Chat"
      description="Messaggi con gli atleti assegnati."
      theme="teal"
    >
      <ChatPageContent basePath="/dashboard/nutrizionista/chat" />
    </StaffContentLayout>
  )
}
