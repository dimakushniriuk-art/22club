# Conflitti regole / verità

| Conflitto | Descrizione | Azione conservativa |
|-----------|-------------|---------------------|
| **ai_memory vs agent** | Regole workspace vietano scrittura in `ai_memory/`; task cleanup chiedeva file lì | Mirror in `audit/operative_memory/` |
| **Ruoli** | Stringhe ruolo in API (`admin`, `trainer`, `athlete`, `marketing`, `nutrizionista`, `massaggiatore`) vs eventuali riferimenti legacy in doc vecchie | Allineare codice a `profiles.role` + `CHANGELOG_LEGACY_ROLES` |
| **Documentazione** | `DOCUMENTAZIONE/11_problemi_rilevati` vs singoli FIX_* risolti | Priorità a indice 01–12 + questo audit |
| **Trainer / clienti** | Più path: RPC debug, `trainer_athletes`, assign API | Non unificare senza batch dedicato (HIGH_RISK) |
| **TODO in codice** | Molti `logger.debug` e TODO non bloccanti | Non confondere con errori build |

---

## Conflitti strutturali (dettaglio)

- **Logica business duplicata:** fetch profili/atleti in hook + pagine + API admin; comunicazioni (lib + route); assegnazioni trainer in più punti (`data_access_map_clean`).
- **Ruoli:** `profiles.role` string vs tabella `roles` con permissions (`api/admin/roles`) — due livelli (nome ruolo vs permessi granulari).
- **Supabase sparsi:** `createClient` / `createAdminClient` / query dirette in centinaia di file (mappa in `data_access_map_clean.txt`).
- **Tipi sovrapposti:** `Database` in `lib/supabase/types.ts` vs export `types/supabase.ts`; tipi dominio in `src/types/*` vs inline `Pick<Tables<...>>` nelle API.
- **Debug temporanei:** `api/debug-trainer-visibility`, commenti "DISABILITATO TEMPORANEAMENTE" in `dashboard/layout.tsx`, molti `logger.debug` (elenco `todo_fixme_clean`).
- **TODO rischio medio:** placeholder riepilogo allenamenti (`riepilogo/page.tsx` TODO metriche); `home/nutrizionista` TODO hook stats.
- **Documentazione:** `DOCUMENTAZIONE/` con decine di PAGE_AUDIT/FIX/RESOCONTO concorrenti — **canonica** per architettura: serie `01-12` + `00_indice_dati_progetto`; resto **storico**.
