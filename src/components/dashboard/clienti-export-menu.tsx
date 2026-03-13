import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@/components/ui'
import { cn } from '@/lib/utils'

interface ClientiExportMenuProps {
  onExportCSV: () => void
  onExportPDF: () => void
  disabled?: boolean
  /** Sotto 852px: trigger min-h 44px per touch */
  isMobile?: boolean
  /** Mostra stato "Export in corso" e disabilita azioni */
  isExporting?: boolean
}

export function ClientiExportMenu({
  onExportCSV,
  onExportPDF,
  disabled = false,
  isMobile = false,
  isExporting = false,
}: ClientiExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label={isExporting ? 'Export in corso' : 'Esporta dati clienti'}
          aria-busy={isExporting}
          className={cn(
            'rounded-lg border-white/20 text-text-secondary hover:bg-white/5 hover:border-white/30',
            isMobile && 'min-h-[44px] touch-manipulation',
          )}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          {isExporting ? 'Export in corso…' : 'Export'}
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
