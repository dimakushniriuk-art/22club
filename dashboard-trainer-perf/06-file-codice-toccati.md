# File di codice toccati (riferimento rapido)

| File                                                  | Modifica                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `src/hooks/appointments/useStaffAppointmentsTable.ts` | `useAuth`, batch profili, listener evento appuntamenti                |
| `src/components/shared/ui/transition-wrapper.tsx`     | `sync`, durata, `FadeInWrapper` `initial={false}`                     |
| `src/components/shared/dashboard/role-layout.tsx`     | `FadeInWrapper` delay 0, duration 0.2                                 |
| `src/hooks/calendar/use-calendar-page.ts`             | `useAuth`, listener evento appuntamenti                               |
| `src/hooks/use-staff-today-agenda.ts`                 | staff attore, visibility, no `getSession`, listener appuntamenti      |
| `src/hooks/calendar/use-staff-calendar-settings.ts`   | `useAuth` + `staffSource`                                             |
| `src/hooks/use-clienti.ts`                            | `useAuth`, `supabase` singleton, `subscribeOrgAthleteProfilesRefresh` |
| `src/hooks/__tests__/use-clienti.test.ts`             | mock `useAuth` + `supabase`                                           |
| `src/app/dashboard/layout.tsx`                        | realtime `appointments` + `profiles`, notifiche                       |
| `src/app/dashboard/clienti/page.tsx`                  | `subscribeOrgAthleteProfilesRefresh: true`                            |
| `src/hooks/useRealtimeChannel.ts`                     | rimossi hook no-op appointments/documents                             |
| `src/lib/staff-cross-tab-events.ts`                   | eventi invalidate appuntamenti + clienti                              |
| `tests/unit/realtime-hooks.test.tsx`                  | test allineati                                                        |

**Rimosso:** `src/lib/supabase/get-current-staff-profile-client.ts` (orfanino).
