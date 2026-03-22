# Resoconto: athletes-search con RPC search_athletes_for_marketing

## File toccati

| File                                                   | Modifica                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/marketing/leads/athletes-search/route.ts` | Sostituita query su `profiles` con `supabase.rpc('search_athletes_for_marketing', { q })`; risposta mappata con `id: athlete_id` per compatibilità UI |
| `docs/RESOCONTO_athletes_search_rpc.md`                | Creato (questo file)                                                                                                                                  |

La pagina `/dashboard/marketing/leads/[id]` e il blocco "Converti in atleta" non sono stati modificati: continuano a chiamare `GET /api/marketing/leads/athletes-search?q=...` e a usare `id`, `first_name`, `last_name`, `email` nella select e in `athlete_profile_id`.

---

## Comportamento endpoint

- **Query param:** `q` (string | null), opzionale.
- **Chiamata:** `supabase.rpc('search_athletes_for_marketing', { q })` con client server (RLS/contesto utente).
- **Risposta:** `{ data: Array<{ id, first_name, last_name, email }> }` (l’API mappa `athlete_id` → `id` per la UI).
- **Auth:** sessione obbligatoria; ruolo admin/marketing verificato (lettura `profiles.role` solo per 403).
- **Errori:** 500 con messaggio da `error.message` o "Errore ricerca atleti" / "Errore interno del server".

---

## Esempio risposta

```json
{
  "data": [
    {
      "id": "uuid-profilo-1",
      "first_name": "Mario",
      "last_name": "Rossi",
      "email": "mario.rossi@example.com"
    },
    {
      "id": "uuid-profilo-2",
      "first_name": null,
      "last_name": null,
      "email": "altro@example.com"
    }
  ]
}
```

---

## Come testare

1. Login con utente **marketing** (o admin).
2. Apri un lead: **Leads** → **Dettaglio** su un lead con stato ≠ Convertito.
3. Nel blocco **Converti in atleta**: digita (o lascia vuoto) nel campo "Cerca atleta per email..." e clicca **Cerca** o invio.
4. Verifica che nella select compaiano gli atleti restituiti dalla RPC (stesso org, filtrati per `q` se valorizzato).
5. Seleziona un atleta e clicca **Converti**: la conversione deve usare l’`id` (profile id) senza errori.

**Nota:** La RPC `public.search_athletes_for_marketing(q text)` deve esistere in DB e restituire righe con `athlete_id`, `first_name`, `last_name`, `email` (isolamento org/ruolo gestito nella RPC). Nessuna modifica a DB o RLS in questo intervento.
