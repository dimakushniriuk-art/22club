# Fix Test Protected Routes

## Problema
Il test `smoke.spec.ts:93` falliva su Chromium perché:
- Il test usava il `page` che aveva già lo `storageState` dell'atleta configurato in `playwright.config.ts`
- Quando il test andava su `/dashboard`, il middleware vedeva che c'era una sessione attiva (di atleta)
- Invece di reindirizzare a `/login`, reindirizzava a `/home` (perché l'atleta non può accedere a `/dashboard`)

## Soluzione Applicata
Modificato il test per usare un nuovo contesto browser senza autenticazione:

```typescript
test('should handle protected routes', async ({ browser }) => {
  // Usa un nuovo contesto senza autenticazione per testare le protected routes
  const context = await browser.newContext({
    storageState: undefined, // Nessuna autenticazione
  })
  const page = await context.newPage()
  
  await page.goto('/dashboard')
  await page.waitForURL('**/login*')
  await expect(page.getByText('Accedi')).toBeVisible()
  
  await context.close()
})
```

## Modifiche
- File: `tests/e2e/smoke.spec.ts:93`
- Cambiato da `async ({ page })` a `async ({ browser })`
- Creato nuovo contesto senza `storageState`
- Chiuso il contesto alla fine del test

## Test Eseguito
```bash
npm run test:e2e -- tests/e2e/smoke.spec.ts:93
```

## Risultato
✅ **PASS** - Tutti i 5 browser passano il test:
- Chromium: PASS (1.2s)
- Firefox: PASS (2.6s)
- WebKit: PASS (2.3s)
- Mobile Chrome: PASS (1.7s)
- Mobile Safari: PASS (1.3s)

## Note
- Il test ora verifica correttamente che le route protette reindirizzino a `/login` quando non c'è autenticazione
- Il fix è stato verificato e funziona correttamente su tutti i browser
