'use client'

import { FileText } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface PaymentsExportMenuProps {
  onExportPdf: () => void | Promise<void>
  disabled?: boolean
  isExporting?: boolean
}

export function PaymentsExportMenu({
  onExportPdf,
  disabled = false,
  isExporting = false,
}: PaymentsExportMenuProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isExporting}
      aria-busy={isExporting}
      aria-label={isExporting ? 'Generazione PDF in corso' : 'Esporta pagamenti come PDF'}
      className={cn(isExporting && 'opacity-80')}
      onClick={() => void onExportPdf()}
    >
      <FileText className="mr-2 h-4 w-4" aria-hidden />
      {isExporting ? 'PDF…' : 'Esporta PDF'}
    </Button>
  )
}
