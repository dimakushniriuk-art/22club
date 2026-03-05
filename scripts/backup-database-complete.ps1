# Script PowerShell per backup COMPLETO database Supabase REMOTO
# Supporta pg_dump se disponibile, altrimenti fornisce istruzioni chiare

$PROJECT_REF = "icibqnmtacibgnhaidlz"
$DB_HOST = "db.$PROJECT_REF.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    BACKUP COMPLETO DATABASE SUPABASE - 22Club" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Project ID: $PROJECT_REF" -ForegroundColor Cyan
Write-Host "[*] Database: $DB_NAME @ $DB_HOST" -ForegroundColor Cyan
Write-Host ""

# Genera nome file con data/ora
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "backups"
$backupFile = "$backupDir\backup_completo_$date.sql"

# Crea cartella backups se non esiste
if (-not (Test-Path $backupDir)) {
    Write-Host "[*] Creazione cartella backups..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    Write-Host "[OK] Cartella creata: $backupDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "[*] Verifica prerequisiti..." -ForegroundColor Yellow

# Verifica se pg_dump è disponibile
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue

if ($pgDumpPath) {
    Write-Host "[OK] pg_dump trovato: $($pgDumpPath.Source)" -ForegroundColor Green
    Write-Host ""
    
    # Chiedi password in modo sicuro
    Write-Host "[*] Inserisci la password del database Supabase:" -ForegroundColor Yellow
    Write-Host "   (La password non verrà mostrata mentre digiti)" -ForegroundColor Gray
    $securePassword = Read-Host -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    
    if ([string]::IsNullOrWhiteSpace($password)) {
        Write-Host "[X] Password non inserita. Backup annullato." -ForegroundColor Red
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        exit 1
    }
    
    Write-Host ""
    Write-Host "[*] Generazione backup completo..." -ForegroundColor Cyan
    Write-Host "[*] File: $backupFile" -ForegroundColor Cyan
    Write-Host ""
    
    # Costruisci connection string
    $connectionString = "postgresql://${DB_USER}:${password}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    
    # Opzioni pg_dump per backup completo
    $pgDumpOptions = @(
        "--verbose",
        "--clean",
        "--if-exists",
        "--create",
        "--format=plain",
        "--no-owner",
        "--no-privileges",
        "--encoding=UTF8"
    )
    
    try {
        # Esegui backup
        $env:PGPASSWORD = $password
        $pgDumpArgs = $pgDumpOptions + @($connectionString)
        
        $startTime = Get-Date
        & pg_dump $pgDumpArgs | Out-File -FilePath $backupFile -Encoding utf8
        
        # Rimuovi password dalla memoria
        Remove-Item Env:\PGPASSWORD
        $password = $null
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
            $fileSize = (Get-Item $backupFile).Length
            $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
            $lineCount = (Get-Content $backupFile | Measure-Object -Line).Lines
            
            Write-Host ""
            Write-Host "================================================================" -ForegroundColor Green
            Write-Host "           BACKUP COMPLETATO CON SUCCESSO" -ForegroundColor Green
            Write-Host "================================================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "[OK] File: $backupFile" -ForegroundColor Green
            Write-Host "[OK] Dimensione: $fileSizeMB MB" -ForegroundColor Green
            Write-Host "[OK] Righe: $lineCount" -ForegroundColor Green
            Write-Host "[OK] Tempo: $([math]::Round($duration, 2)) secondi" -ForegroundColor Green
            Write-Host ""
            
            # Verifica base del file
            $fileContent = Get-Content $backupFile -TotalCount 50
            if ($fileContent -match "CREATE TABLE" -or $fileContent -match "PostgreSQL database dump") {
                Write-Host "[OK] Verifica: File sembra valido" -ForegroundColor Green
            } else {
                Write-Host "[!] Attenzione: Il file potrebbe essere incompleto" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "[*] Prossimi passi:" -ForegroundColor Cyan
            Write-Host "   1. Verifica il file: Get-Content $backupFile -Head 20" -ForegroundColor White
            Write-Host "   2. Testa il restore su un database di test" -ForegroundColor White
            Write-Host "   3. Conserva il backup in un luogo sicuro" -ForegroundColor White
            Write-Host ""
            
        } else {
            Write-Host ""
            Write-Host "[X] Errore durante la generazione del backup" -ForegroundColor Red
            Write-Host "    Verifica la password e la connessione al database" -ForegroundColor Yellow
            exit 1
        }
        
    } catch {
        # Pulisci password dalla memoria in caso di errore
        if ($bstr) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        Write-Host ""
        Write-Host "[X] Errore: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "[!] pg_dump non trovato nel sistema" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "           OPZIONI PER FARE IL BACKUP" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "OPZIONE 1: Dashboard Supabase (PIÙ SEMPLICE)" -ForegroundColor Cyan
    Write-Host "  1. Vai su: https://supabase.com/dashboard/project/$PROJECT_REF/database/backups" -ForegroundColor White
    Write-Host "  2. Clicca 'Create backup' o 'New backup'" -ForegroundColor White
    Write-Host "  3. Scarica il file SQL quando pronto" -ForegroundColor White
    Write-Host ""
    
    Write-Host "OPZIONE 2: Installa PostgreSQL (per avere pg_dump)" -ForegroundColor Cyan
    Write-Host "  Windows (Chocolatey): choco install postgresql" -ForegroundColor White
    Write-Host "  Oppure: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "  Poi riesegui questo script" -ForegroundColor White
    Write-Host ""
    
    Write-Host "OPZIONE 3: Usa un Client SQL" -ForegroundColor Cyan
    Write-Host "  - DBeaver (gratuito): https://dbeaver.io/download/" -ForegroundColor White
    Write-Host "  - TablePlus: https://tableplus.com/" -ForegroundColor White
    Write-Host "  - pgAdmin: https://www.pgadmin.org/download/" -ForegroundColor White
    Write-Host ""
    
    Write-Host "OPZIONE 4: pg_dump manuale (se installi PostgreSQL)" -ForegroundColor Cyan
    Write-Host "  1. Ottieni connection string da:" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/project/$PROJECT_REF/settings/database" -ForegroundColor White
    Write-Host "  2. Esegui:" -ForegroundColor White
    $hostPart = $DB_HOST + ":" + $DB_PORT + "/" + $DB_NAME
    $cmdExample = "     pg_dump 'postgresql://postgres:[PASSWORD]@" + $hostPart + "' > backup.sql"
    Write-Host $cmdExample -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "[*] Per una guida completa, vedi: docs/GUIDA_BACKUP_COMPLETO.md" -ForegroundColor Cyan
    Write-Host ""
    
    exit 0
}