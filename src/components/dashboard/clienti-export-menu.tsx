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
            'rounded-full border border-white/5 text-primary bg-transparent hover:bg-primary/10 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(2,179,191,0.2)] px-5 transition-all duration-300',
            isMobile ? 'min-h-[44px] touch-manipulation' : 'h-10',
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
