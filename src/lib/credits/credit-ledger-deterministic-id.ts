/**
 * Idempotenza DEBIT da workout_log con trainer: stesso log → stesso UUID riga `credit_ledger`.
 * Evita doppia scalata al retry senza colonna FK dedicata.
 *
 * Usa Web Crypto (non `node:crypto`) così il modulo è sicuro per import da client/hook.
 */
export async function creditLedgerRowIdForCoachedWorkout(workoutLogId: string): Promise<string> {
  const payload = `22club:coached_workout_debit:v1:${workoutLogId}`
  const data = new TextEncoder().encode(payload)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hash = new Uint8Array(digest)
  const buf = new Uint8Array(16)
  buf.set(hash.subarray(0, 16))
  buf[6] = (buf[6]! & 0x0f) | 0x40
  buf[8] = (buf[8]! & 0x3f) | 0x80
  const h = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}
