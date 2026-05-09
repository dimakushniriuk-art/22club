/**
 * Checklist operativa (dashboard Supabase, non codice):
 *
 * - **JWT expiry (access token)**: valori tipici 3600s; su mobile WebKit il refresh in background può ritardare.
 *   Valutare leggermente più lunghi solo se accettabile per il modello di minaccia; in alternativa affidatevi al recovery client (visibility + TOKEN_REFRESHED).
 * - **Refresh token rotation**: lasciare abilitata; evitare login su decine di tab contemporanee con lo stesso refresh (causa reuse detection).
 * - **Rate limits Auth**: con molti utenti, monitorare 429 su `/auth/v1/user` e allineare retry lato client (già presenti fallback getSession nel middleware/auth).
 * - **Region**: progetto Supabase nella stessa regione dell’hosting Next riduce timeout intermittenti.
 *
 * Ultimo aggiornamento: allineamento piano stabilità sessione.
 */

export {}
