# Script PowerShell per configurare autenticazione Supabase permanente
# Esegui questo script UNA SOLA VOLTA per salvare le credenziali

$PROJECT_REF = "icibqnmtacibgnhaidlz"

Write-Host "🔐 Configurazione Autenticazione Supabase Permanente" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se già autenticato
Write-Host "🔍 Verifica autenticazione esistente..." -ForegroundColor Yellow
try {
    $projects = npx supabase projects list 2>&1
    if ($LASTEXITCODE -eq 0 -and $projects -notmatch "Unauthorized") {
        Write-Host "✅ Sei già autenticato!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Progetti disponibili:" -ForegroundColor Cyan
        $projects | Select-String -Pattern $PROJECT_REF
        Write-Host ""
        Write-Host "Vuoi rigenerare l'autenticazione? (S/N)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne "S" -and $response -ne "s") {
            Write-Host "✅ Autenticazione già configurata. Nessuna modifica necessaria." -ForegroundColor Green
            exit 0
        }
    }
} catch {
    # Non autenticato, procediamo
}

Write-Host ""
Write-Host "📝 Per autenticarti, hai due opzioni:" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPZIONE 1: Access Token (Raccomandato)" -ForegroundColor Yellow
Write-Host "  1. Vai su: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "  2. Clicca su 'Generate new token'" -ForegroundColor White
Write-Host "  3. Copia il token (formato: sbp_...)" -ForegroundColor White
Write-Host ""
Write-Host "OPZIONE 2: Login Interattivo (Richiede browser)" -ForegroundColor Yellow
Write-Host "  Il browser si aprirà automaticamente per autenticarti" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Scegli opzione (1 per token, 2 per login interattivo)"

if ($choice -eq "1") {
    # Opzione 1: Token
    Write-Host ""
    Write-Host "🔑 Inserisci il tuo Access Token:" -ForegroundColor Cyan
    Write-Host "(Il token verrà salvato nel profilo Supabase CLI)" -ForegroundColor Gray
    $token = Read-Host -AsSecureString
    
    # Converti SecureString in stringa normale
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    $plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    Write-Host ""
    Write-Host "💾 Salvataggio autenticazione..." -ForegroundColor Yellow
    
    # Usa il token per fare login (viene salvato automaticamente)
    $env:SUPABASE_ACCESS_TOKEN = $plainToken
    npx supabase login --token $plainToken
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Autenticazione salvata con successo!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔍 Verifica autenticazione..." -ForegroundColor Cyan
        npx supabase projects list | Select-String -Pattern $PROJECT_REF
        Write-Host ""
        Write-Host "✅ Ora puoi generare i types senza dover reinserire il token!" -ForegroundColor Green
    } else {
        Write-Host "❌ Errore durante il salvataggio. Verifica che il token sia valido." -ForegroundColor Red
        exit 1
    }
    
} elseif ($choice -eq "2") {
    # Opzione 2: Login interattivo
    Write-Host ""
    Write-Host "🌐 Apertura browser per autenticazione..." -ForegroundColor Cyan
    Write-Host "(Se il browser non si apre, apri manualmente il link mostrato)" -ForegroundColor Yellow
    Write-Host ""
    
    npx supabase login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Autenticazione salvata con successo!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔍 Verifica autenticazione..." -ForegroundColor Cyan
        npx supabase projects list | Select-String -Pattern $PROJECT_REF
        Write-Host ""
        Write-Host "✅ Ora puoi generare i types senza dover reinserire il token!" -ForegroundColor Green
    } else {
        Write-Host "❌ Errore durante l'autenticazione." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Opzione non valida." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Prossimi passi:" -ForegroundColor Cyan
Write-Host "  1. Genera i types: npm run supabase:gen:types:direct" -ForegroundColor Yellow
Write-Host "  2. Oppure: npx supabase gen types typescript --project-id $PROJECT_REF > src/lib/supabase/types.ts" -ForegroundColor Yellow
Write-Host ""

