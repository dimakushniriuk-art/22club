'use client'

import { MessageSquare } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { ChatPageContent } from '@/app/dashboard/chat/page'

const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function MassaggiatoreChatPage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Chat"
      description="Comunica con i clienti assegnati"
      icon={<MessageSquare className="w-6 h-6" />}
      theme="amber"
    >
      <ChatPageContent basePath="/dashboard/massaggiatore/chat" />
    </StaffContentLayout>
  )
}
