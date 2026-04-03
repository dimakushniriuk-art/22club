'use client'

import { MessageSquare } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { ChatPageContent } from '@/app/dashboard/chat/page'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'

export default function MassaggiatoreChatPage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="Chat"
      description="Messaggi con i clienti assegnati."
      icon={<MessageSquare className="w-6 h-6" />}
      theme="amber"
    >
      <ChatPageContent basePath="/dashboard/massaggiatore/chat" />
    </StaffContentLayout>
  )
}
