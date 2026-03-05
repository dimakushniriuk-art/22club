# Script PowerShell per redeploy completo su Vercel
# Verifica tutto e fa un redeploy pulito

Write-Host "🚀 REDEPLOY COMPLETO VERCEL - 22Club" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verifica autenticazione
Write-Host "🔐 1. Verifica autenticazione Vercel..." -ForegroundColor Yellow
$vercelCheck = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non autenticato su Vercel. Esegui: vercel login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Autenticato su Vercel" -ForegroundColor Green
Write-Host ""

# Verifica progetto linkato
Write-Host "🔗 2. Verifica progetto linkato..." -ForegroundColor Yellow
if (-not (Test-Path ".vercel\project.json")) {
    Write-Host "⚠️  Progetto non linkato. Esegui: vercel link" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Progetto linkato" -ForegroundColor Green
Write-Host ""

# Verifica variabili d'ambiente
Write-Host "🔐 3. Lista variabili d'ambiente configurate..." -ForegroundColor Yellow
vercel env ls
Write-Host ""

# Build locale di verifica
Write-Host "🏗️  4. Build locale di verifica..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build fallita. Risolvi gli errori prima di fare il deploy." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build locale completata con successo" -ForegroundColor Green
Write-Host ""

# Pulizia cache .next
Write-Host "🧹 5. Pulizia cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cache pulita" -ForegroundColor Green
}
Write-Host ""

# Deploy produzione
Write-Host "🚀 6. Deploy su Vercel (produzione)..." -ForegroundColor Yellow
Write-Host "Questo può richiedere alcuni minuti..." -ForegroundColor Gray
Write-Host ""

vercel --prod --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "✅ DEPLOYMENT COMPLETATO CON SUCCESSO!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔍 Per verificare i log:" -ForegroundColor Yellow
    Write-Host "   vercel logs --prod" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 Per ispezionare il deployment:" -ForegroundColor Yellow
    Write-Host "   vercel inspect [url]" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ DEPLOYMENT FALLITO" -ForegroundColor Red
    Write-Host "Controlla gli errori sopra" -ForegroundColor Yellow
    exit 1
}
