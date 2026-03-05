# ============================================================================
# Script Push Incrementale - Repository Grande
# ============================================================================
# 
# Push repository grande in batch più piccoli per evitare timeout
#
# Uso:
#   .\scripts\push-incremental.ps1
#   oppure
#   powershell -ExecutionPolicy Bypass -File .\scripts\push-incremental.ps1
#
# ============================================================================

param(
    [int]$BatchSize = 10,
    [string]$Branch = "main"
)

Write-Host "`n🚀 Push Incrementale - Repository Grande" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Verifica che siamo in un repository Git
if (-not (Test-Path .git)) {
    Write-Host "❌ Errore: Non sei in un repository Git!" -ForegroundColor Red
    exit 1
}

# Verifica commit da pushare
$commitsOutput = git log --oneline origin/$Branch..HEAD 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore: Impossibile verificare commit da pushare" -ForegroundColor Red
    Write-Host $commitsOutput -ForegroundColor Yellow
    exit 1
}

$commits = $commitsOutput | Measure-Object -Line
$totalCommits = $commits.Lines

if ($totalCommits -eq 0) {
    Write-Host "✅ Nessun commit da pushare. Repository aggiornato!" -ForegroundColor Green
    exit 0
}

$batches = [math]::Ceiling($totalCommits / $BatchSize)

Write-Host "`n📊 Statistiche:" -ForegroundColor Yellow
Write-Host "   Commit da pushare: $totalCommits" -ForegroundColor White
Write-Host "   Batch size: $BatchSize" -ForegroundColor White
Write-Host "   Batch totali: $batches" -ForegroundColor White
Write-Host ""

# Conferma
$confirm = Read-Host "Procedere con push incrementale? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Operazione annullata" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔄 Inizio push incrementale...`n" -ForegroundColor Cyan

# Push incrementale
$successCount = 0
$failCount = 0

for ($i = $batches; $i -ge 1; $i--) {
    $skip = ($i - 1) * $BatchSize
    $commitLine = git log --oneline origin/$Branch..HEAD | Select-Object -Skip $skip -First 1
    
    if (-not $commitLine) {
        Write-Host "⚠️  Batch $($batches - $i + 1)/$batches: Nessun commit trovato, skip" -ForegroundColor Yellow
        continue
    }
    
    $commitHash = $commitLine.Split(' ')[0]
    $commitMessage = $commitLine.Substring($commitHash.Length + 1)
    
    Write-Host "📦 Batch $($batches - $i + 1)/$batches: Push fino a $commitHash" -ForegroundColor Yellow
    Write-Host "   Commit: $commitMessage" -ForegroundColor Gray
    
    # Push
    $pushOutput = git push origin "$commitHash`:$Branch" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Push riuscito" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   ❌ Push fallito" -ForegroundColor Red
        Write-Host "   Output: $pushOutput" -ForegroundColor Red
        $failCount++
        
        # Chiedi se continuare
        $continue = Read-Host "   Continuare con batch successivi? (S/N)"
        if ($continue -ne "S" -and $continue -ne "s" -and $continue -ne "Y" -and $continue -ne "y") {
            Write-Host "`n❌ Push interrotto dall'utente" -ForegroundColor Yellow
            exit 1
        }
    }
    
    # Pausa tra batch
    if ($i -gt 1) {
        Start-Sleep -Seconds 2
    }
}

# Push finale
Write-Host "`n🚀 Push finale (tutti i commit rimanenti)..." -ForegroundColor Cyan
$finalPushOutput = git push origin $Branch 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push finale riuscito!" -ForegroundColor Green
    $successCount++
} else {
    Write-Host "❌ Push finale fallito" -ForegroundColor Red
    Write-Host "Output: $finalPushOutput" -ForegroundColor Red
    $failCount++
}

# Riepilogo
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Riepilogo:" -ForegroundColor Yellow
Write-Host "   Batch riusciti: $successCount" -ForegroundColor $(if ($successCount -gt 0) { "Green" } else { "Red" })
Write-Host "   Batch falliti: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host "`n✅ Push incrementale completato con successo!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Push completato con alcuni errori" -ForegroundColor Yellow
    Write-Host "   Verifica lo stato con: git log origin/$Branch..HEAD" -ForegroundColor Gray
    exit 1
}
