import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@/components/ui'

interface ClientiExportMenuProps {
  onExportCSV: () => void
  onExportPDF: () => void
  disabled?: boolean
}

export function ClientiExportMenu({
  onExportCSV,
  onExportPDF,
  disabled = false,
}: ClientiExportMenuProps) {
  return (
    <DropdownMenu>
      {/* FIX #12: Aggiunto aria-label per accessibilità */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} aria-label="Esporta dati clienti">
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export
        </Button>
      </DropdownMenuTrigger>
      {/* FIX #12: Aggiunto aria-label per accessibilità */}
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV} aria-label="Esporta clienti come file CSV">
          <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
          Esporta come CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF} aria-label="Esporta clienti come file PDF">
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          Esporta come PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
