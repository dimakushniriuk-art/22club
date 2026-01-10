# Script PowerShell per backup database Supabase REMOTO
# Usa la connection string diretta per evitare problemi con Docker

$PROJECT_REF = "icibqnmtacibgnhaidlz"

Write-Host "[*] Backup database Supabase REMOTO..." -ForegroundColor Cyan
Write-Host "[*] Project: $PROJECT_REF" -ForegroundColor Cyan
Write-Host ""

# Genera nome file con data/ora
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backup_$date.sql"

Write-Host "[*] File backup: $backupFile" -ForegroundColor Cyan
Write-Host ""

# Workaround: rinomina temporaneamente .env.local se esiste
$envLocalPath = ".env.local"
$envLocalBackup = ".env.local.backup"
$envLocalExists = Test-Path $envLocalPath

if ($envLocalExists) {
    Write-Host "[*] Rinomina temporaneamente .env.local per evitare errori di parsing..." -ForegroundColor Yellow
    Rename-Item -Path $envLocalPath -NewName $envLocalBackup -ErrorAction SilentlyContinue
}

Write-Host "[!] ATTENZIONE: Per fare backup del database remoto hai due opzioni:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPZIONE 1: Dashboard Supabase (Raccomandato)" -ForegroundColor Cyan
Write-Host "  1. Vai su: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database" -ForegroundColor White
Write-Host "  2. Scorri fino a 'Connection string'" -ForegroundColor White
Write-Host "  3. Copia la connection string (URI mode)" -ForegroundColor White
Write-Host "  4. Usa pg_dump o un client SQL per fare il backup" -ForegroundColor White
Write-Host ""
Write-Host "OPZIONE 2: Usa pg_dump direttamente" -ForegroundColor Cyan
Write-Host "  pg_dump 'postgresql://postgres:[PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres' > $backupFile" -ForegroundColor White
Write-Host ""
Write-Host "[!] Il comando 'supabase db dump' richiede Docker per dump locali." -ForegroundColor Yellow
Write-Host "[!] Per dump remoti, usa pg_dump con la connection string." -ForegroundColor Yellow
Write-Host ""

# Ripristina .env.local
if ($envLocalExists -and (Test-Path $envLocalBackup)) {
    Write-Host "[*] Ripristino .env.local..." -ForegroundColor Yellow
    Rename-Item -Path $envLocalBackup -NewName $envLocalPath -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "[*] Per informazioni dettagliate, vedi: docs/COMANDI_SUPABASE_PRONTI.md" -ForegroundColor Cyan
exit 0

