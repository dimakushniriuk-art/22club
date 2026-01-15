# Script PowerShell per rimuovere test-results e artefatti Playwright dal tracking Git
# Esegue: .\scripts\cleanup-git-test-results.ps1

Write-Host "🧹 Cleanup Git - Test Results e Artefatti Playwright" -ForegroundColor Cyan
Write-Host ""

# Verifica che siamo in una repository Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Errore: Non sei in una repository Git" -ForegroundColor Red
    exit 1
}

# Verifica se i file sono tracciati da Git
Write-Host "📋 Verifica file tracciati da Git..." -ForegroundColor Yellow

$trackedFiles = @()
$trackedFiles += git ls-files test-results/ 2>$null
$trackedFiles += git ls-files playwright-report/ 2>$null
$trackedFiles += git ls-files .last-run.json 2>$null
$trackedFiles += git ls-files tmp-pw*/ 2>$null
$trackedFiles += git ls-files tmp-e2e/ 2>$null

if ($trackedFiles.Count -eq 0) {
    Write-Host "✅ Nessun file da rimuovere - già ignorati da .gitignore" -ForegroundColor Green
    exit 0
}

Write-Host "⚠️  Trovati $($trackedFiles.Count) file tracciati da Git:" -ForegroundColor Yellow
$trackedFiles | Select-Object -First 10 | ForEach-Object { Write-Host "   - $_" }
if ($trackedFiles.Count -gt 10) {
    Write-Host "   ... e altri $($trackedFiles.Count - 10) file" -ForegroundColor Gray
}
Write-Host ""

# Chiedi conferma
$confirmation = Read-Host "Vuoi rimuovere questi file dal tracking Git? (S/N)"
if ($confirmation -ne "S" -and $confirmation -ne "s") {
    Write-Host "❌ Operazione annullata" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🗑️  Rimozione file dal tracking Git (mantiene file locali)..." -ForegroundColor Yellow

# Rimuovi test-results/
if (git ls-files test-results/ 2>$null) {
    git rm -r --cached test-results/ 2>$null
    Write-Host "✅ rimosso test-results/" -ForegroundColor Green
}

# Rimuovi playwright-report/
if (git ls-files playwright-report/ 2>$null) {
    git rm -r --cached playwright-report/ 2>$null
    Write-Host "✅ rimosso playwright-report/" -ForegroundColor Green
}

# Rimuovi .last-run.json
if (git ls-files .last-run.json 2>$null) {
    git rm --cached .last-run.json 2>$null
    Write-Host "✅ rimosso .last-run.json" -ForegroundColor Green
}

# Rimuovi tmp-pw*/
Get-ChildItem -Directory -Filter "tmp-pw*" -ErrorAction SilentlyContinue | ForEach-Object {
    $dir = $_.Name
    if (git ls-files "$dir/" 2>$null) {
        git rm -r --cached "$dir/" 2>$null
        Write-Host "✅ rimosso $dir/" -ForegroundColor Green
    }
}

# Rimuovi tmp-e2e/
if (git ls-files tmp-e2e/ 2>$null) {
    git rm -r --cached tmp-e2e/ 2>$null
    Write-Host "✅ rimosso tmp-e2e/" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cleanup completato!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prossimi passi:" -ForegroundColor Cyan
Write-Host "   1. Verifica: git status" -ForegroundColor White
Write-Host "   2. Aggiungi .gitignore: git add .gitignore" -ForegroundColor White
Write-Host "   3. Commit: git commit -m 'chore: rimuove test-results e artefatti Playwright dal tracking Git'" -ForegroundColor White
