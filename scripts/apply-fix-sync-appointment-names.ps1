# ============================================================================
# Script PowerShell per Applicare Fix Sincronizzazione Nomi Appointments
# ============================================================================
# Esegue lo script SQL FIX_SYNC_APPOINTMENT_NAMES_COMPLETE.sql sul database
# ============================================================================

$PROJECT_REF = "icibqnmtacibgnhaidlz"
$DB_HOST = "db.$PROJECT_REF.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$SQL_FILE = "docs\FIX_SYNC_APPOINTMENT_NAMES_COMPLETE.sql"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    FIX SINCRONIZZAZIONE NOMI APPOINTMENTS - 22Club" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Project ID: $PROJECT_REF" -ForegroundColor Cyan
Write-Host "[*] Database: $DB_NAME @ $DB_HOST" -ForegroundColor Cyan
Write-Host "[*] Script SQL: $SQL_FILE" -ForegroundColor Cyan
Write-Host ""

# Verifica se il file SQL esiste
if (-not (Test-Path $SQL_FILE)) {
    Write-Host "[X] File SQL non trovato: $SQL_FILE" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Soluzione alternativa:" -ForegroundColor Yellow
    Write-Host "   1. Apri il Supabase Dashboard" -ForegroundColor White
    Write-Host "   2. Vai su SQL Editor" -ForegroundColor White
    Write-Host "   3. Copia e incolla il contenuto di $SQL_FILE" -ForegroundColor White
    Write-Host "   4. Esegui lo script" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "[*] Verifica prerequisiti..." -ForegroundColor Yellow

# Verifica se psql è disponibile
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "[!] psql non trovato nel PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Opzioni disponibili:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPZIONE 1: Usa Supabase Dashboard (CONSIGLIATO)" -ForegroundColor Green
    Write-Host "   1. Apri: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" -ForegroundColor White
    Write-Host "   2. Apri il file: $SQL_FILE" -ForegroundColor White
    Write-Host "   3. Copia tutto il contenuto" -ForegroundColor White
    Write-Host "   4. Incolla nel SQL Editor e clicca 'Run'" -ForegroundColor White
    Write-Host ""
    Write-Host "OPZIONE 2: Installa PostgreSQL Client" -ForegroundColor Green
    Write-Host "   - Scarica: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   - Oppure: choco install postgresql (se hai Chocolatey)" -ForegroundColor White
    Write-Host ""
    
    $useDashboard = Read-Host "Vuoi aprire il dashboard Supabase? (S/N)"
    if ($useDashboard -eq "S" -or $useDashboard -eq "s") {
        Start-Process "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    }
    
    exit 0
}

Write-Host "[OK] psql trovato: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Chiedi password
Write-Host "[*] Inserisci la password del database Supabase:" -ForegroundColor Yellow
Write-Host "   (La password non verrà mostrata mentre digiti)" -ForegroundColor Gray
$securePassword = Read-Host -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "[X] Password non inserita. Operazione annullata." -ForegroundColor Red
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    exit 1
}

Write-Host ""
Write-Host "[*] Esecuzione script SQL..." -ForegroundColor Yellow
Write-Host ""

# Imposta variabile d'ambiente per password
$env:PGPASSWORD = $password

# Esegui lo script SQL
& psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SQL_FILE

$exitCode = $LASTEXITCODE

# Pulisci password dalla memoria
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
Remove-Item Env:\PGPASSWORD

Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "[OK] Script eseguito con successo!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Prossimi passi:" -ForegroundColor Cyan
    Write-Host "   1. Verifica i trigger nel dashboard Supabase" -ForegroundColor White
    Write-Host "   2. Testa cambiando un nome in profiles e verifica che si aggiorni in appointments" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[X] Errore durante l'esecuzione dello script (exit code: $exitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Suggerimento:" -ForegroundColor Yellow
    Write-Host "   Esegui lo script manualmente nel Supabase Dashboard SQL Editor" -ForegroundColor White
    Write-Host "   Link: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" -ForegroundColor White
    Write-Host ""
}

