'use client'

import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@/components/ui'
import { exportPaymentsToCSV, exportPaymentsToPDF } from '@/lib/export-payments'
import type { Payment } from '@/types/payment'

interface PaymentsExportMenuProps {
  payments: Payment[]
  disabled?: boolean
}

export function PaymentsExportMenu({ payments, disabled = false }: PaymentsExportMenuProps) {
  const handleExportCSV = () => {
    exportPaymentsToCSV(payments)
  }

  const handleExportPDF = () => {
    exportPaymentsToPDF(payments)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || payments.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Esporta come CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Esporta come PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
