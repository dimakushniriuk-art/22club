import type { Allenamento } from '@/types/allenamento'
import { exportToCSV } from './export-utils'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatAllenamentiForExport(allenamenti: Allenamento[]) {
  return allenamenti.map((a) => ({
    ID: a.id,
    Atleta: a.atleta_nome,
    Scheda: a.scheda_nome,
    Data: formatDate(new Date(a.data)),
    'Durata (min)': a.durata_minuti,
    Stato: a.stato,
    'Esercizi completati': a.esercizi_completati,
    'Esercizi totali': a.esercizi_totali,
    'Volume (kg)': a.volume_totale,
    Note: a.note || '',
  }))
}

export function exportAllenamentiToCSV(allenamenti: Allenamento[]) {
  const data = formatAllenamentiForExport(allenamenti)
  const now = new Date()
  const filename = `allenamenti_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.csv`
  exportToCSV(data, filename)
}
