/** Allineato a `src/app/api/athlete/coached-session-debit/route.ts` */
export const COACHED_APP_DEBIT_REASON_PREFIX = 'coached-app:wl:'

export function coachedAppDebitReasonForWorkoutLog(workoutLogId: string): string {
  return `${COACHED_APP_DEBIT_REASON_PREFIX}${workoutLogId}`
}
