'use client'

import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { ChatPageContent } from '@/app/dashboard/chat/page'

export default function NutrizionistaChatPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout title="Chat" description="Messaggi con gli atleti assegnati." theme="teal">
      <ChatPageContent basePath="/dashboard/nutrizionista/chat" />
    </StaffContentLayout>
  )
}
