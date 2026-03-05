# Hard Plan – Stato Lint 2025-11-10

## Criticità Prioritarie

1. **Regola `@typescript-eslint/no-require-imports` su configurazioni e test**
   - File coinvolti: `next.config.ts`, `next.config.production.ts`, numerosi test/unit e mock.
   - **Rischio**: build bloccata dal lint; mancata coerenza ESM con Next.js 15.
   - **Azione**: convertire i `require()` in `import` o migrare i file a ESM (`.mjs`/`tsconfig`), applicando `createRequire` solo dove inevitabile.

2. **Violazioni `react-hooks/rules-of-hooks`**
   - `src/hooks/useRealtimeChannel.ts` e `tests/__mocks__/framer-motion.tsx`.
   - **Rischio**: comportamento runtime imprevedibile.
   - **Azione**: spostare gli hook fuori dai percorsi condizionali; rifattorizzare i mock per invocare `useEffect`/`useLayoutEffect` sempre allo stesso livello.

3. **Cleanup script CLI (`prefer-const`, `any`)**
   - `scripts/create-test-athletes.ts`, `scripts/create-workout-script.ts`, ecc.
   - **Azione**: promuovere le variabili a `const`, introdurre tipi espliciti (`TablesInsert`, interfacce dedicate).

## Warning Rilevanti

- **Import inutilizzati / variabili non usate**: pagine dashboard, modali e script (`CardHeader`, `toast`, `user`, `router`, ecc.).  
  → Rimuovere o prefissare con `_` se placeholder intenzionale.

- **`any` diffusi**: hook (`use-clienti`, `use-chat`, `use-workouts`), componenti calendario e mock.  
  → Sostituire con tipi Supabase (`Tables`, `TablesInsert`) o tipi di dominio.

- **Regole React (`react-hooks/exhaustive-deps`)**: pagine come `dashboard/atleti/[id]`, `nuovo-pagamento-modal`, `two-factor-setup`.  
  → Riesaminare dipendenze e memorizzazioni (`useCallback`, `useMemo`).

- **Accessibilità / testo**: aggiungere `alt` in `document-uploader.tsx`, escapare apostrofi (`&apos;`) nei testi indicati.

- **Config/PostCSS**: esportazioni anonime (`postcss.config.mjs`) da rinominare (`const config = {...}; export default config;`).

## Passi Operativi Consigliati

1. **Batch configurazioni/test** – dedicare una sessione per convertire tutti i `require()` e assicurare compatibilità ESM.
2. **Refactor hook realtime** – correggere subito il condizionale; rieseguire lint/unit test collegati.
3. **Script CLI** – breve passaggio per `prefer-const` + tipi, riducendo warning ripetitivi.
4. **UI Dashboard** – pulizia import inutilizzati + alt text; consolidare stato warning accessibilità.
5. **Tipizzazione progressiva hook** – affrontare blocchi `any` partendo da `use-clienti` e `use-chat`.
6. **Aggiornare documentazione** – dopo ogni batch, registrare stato lint nel presente piano e nel changelog.

## Note

- L’esecuzione di `npm run lint` deve restare verde prima di proseguire con build/test automatizzati.
- Valutare eventuale configurazione ESLint separata per script Node (CommonJS) se migrazione completa a ESM non è immediata.
