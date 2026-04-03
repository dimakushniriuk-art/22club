import { Download, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@/components/ui'
import { cn } from '@/lib/utils'

interface ClientiExportMenuProps {
  onExportPdf: () => void | Promise<void>
  disabled?: boolean
  /** Sotto 852px: trigger min-h 44px per touch */
  isMobile?: boolean
  /** Mostra stato "Export in corso" e disabilita azioni */
  isExporting?: boolean
}

export function ClientiExportMenu({
  onExportPdf,
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
          aria-label={isExporting ? 'Export in corso' : 'Esporta dati clienti come PDF'}
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
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void onExportPdf()} aria-label="Esporta clienti come file PDF">
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          Esporta come PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
