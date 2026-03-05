# Script di aggiornamento dipendenze - 22Club (PowerShell)
# Data: 2025-01-10

Write-Host "🚀 Avvio aggiornamento dipendenze 22Club..." -ForegroundColor Cyan
Write-Host ""

# Verifica che npm sia installato
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm non trovato. Installa Node.js e npm prima di continuare." -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm trovato: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Passo 1: Installazione dipendenze
Write-Host "📦 Passo 1/7: Installazione dipendenze aggiornate..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dipendenze installate" -ForegroundColor Green
} else {
    Write-Host "❌ Errore durante l'installazione" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Passo 2: Verifica TypeScript
Write-Host "🔍 Passo 2/7: Verifica TypeScript..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript: nessun errore" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript: errori trovati (verifica manualmente)" -ForegroundColor Yellow
}
Write-Host ""

# Passo 3: Verifica ESLint
Write-Host "🔍 Passo 3/7: Verifica ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ESLint: nessun errore bloccante" -ForegroundColor Green
} else {
    Write-Host "⚠️  ESLint: warning trovati (normalmente non bloccanti)" -ForegroundColor Yellow
}
Write-Host ""

# Passo 4: Verifica build
Write-Host "🔨 Passo 4/7: Verifica build produzione..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build: completata con successo" -ForegroundColor Green
} else {
    Write-Host "❌ Build: fallita (verifica errori sopra)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Passo 5: Verifica vulnerabilità
Write-Host "🔒 Passo 5/7: Verifica vulnerabilità sicurezza..." -ForegroundColor Yellow
npm audit --audit-level=moderate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Nessuna vulnerabilità critica trovata" -ForegroundColor Green
} else {
    Write-Host "⚠️  Vulnerabilità trovate (esegui 'npm audit fix' se necessario)" -ForegroundColor Yellow
}
Write-Host ""

# Passo 6: Test unitari
Write-Host "🧪 Passo 6/7: Esecuzione test unitari..." -ForegroundColor Yellow
npm run test:run
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Test: tutti i test passati" -ForegroundColor Green
} else {
    Write-Host "⚠️  Test: alcuni test falliti (verifica manualmente)" -ForegroundColor Yellow
}
Write-Host ""

# Passo 7: Riepilogo
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Aggiornamento completato!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prossimi passi:"
Write-Host "   1. Testa l'applicazione in sviluppo: npm run dev"
Write-Host "   2. Se tutto funziona, committa le modifiche:"
Write-Host "      git add package.json package-lock.json"
Write-Host "      git commit -m 'chore: aggiorna dipendenze a versioni più recenti'"
Write-Host ""
Write-Host "📚 Documentazione:"
Write-Host "   - AGGIORNAMENTO_DIPENDENZE_2025.md (piano completo)"
Write-Host "   - ISTRUZIONI_AGGIORNAMENTO.md (istruzioni dettagliate)"
Write-Host ""
