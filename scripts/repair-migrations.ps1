# ============================================================================
# Script PowerShell per Riparare Migrazioni Supabase
# ============================================================================
# Questo script ripara la tabella delle migrazioni sincronizzando lo stato
# tra migrazioni remote e locali
# ============================================================================

Write-Host "🔧 Riparazione Migrazioni Supabase" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Lista migrazioni da marcare come "reverted" (non esistono localmente)
$revertedMigrations = @(
    "20250111", "20250112", "20250113", "20250114", "20250115",
    "20250115120000", "20250115130000",
    "20250116", "20250116120000", "20250116130000", "20250116140000", "20250116150000", "20250116160000",
    "20250117", "20250118", "20250119", "20250120",
    "20250120120000", "20250120130000",
    "20250121", "20250121120000", "20250121130000", "20250121140000",
    "20250122", "20250123", "20250124", "20250125", "20250126",
    "20250127", "20250127120000", "20250127130000", "20250127140000", "20250127150000",
    "20250128", "20250129", "20250130", "20250131",
    "20250201", "20250202", "20250203", "20250204", "20250205",
    "20250206", "20250207", "20250208", "20250209", "20250210",
    "20250211", "20250212", "20250213", "20250214", "20250215",
    "20250216", "20250217", "20250218", "20250219",
    "20250301", "20250302", "20250303", "20250304", "20250305",
    "20250306", "20250307", "20250308", "20250309", "20250310",
    "20250311", "20250312", "20250313", "20250314", "20250315",
    "20251008", "20251009", "20251010", "20251011", "20251012", "20251013", "20251014",
    "20251031",
    "20251112", "20251115", "20251116", "20251117", "20251118",
    "20251120120000", "20251120130000", "20251120140000",
    "20251121", "20251122", "20251123",
    "20251130001839", "20251130001840", "20251130002000"
)

# Lista migrazioni da marcare come "applied" (esistono localmente)
$appliedMigrations = @(
    "001", "002", "09", "10", "11",
    "20240115", "20240116",
    "20241220",
    "20250109000001", "20250109000002", "20250109",
    "20250110",
    "20250127",
    "20251008", "20251009", "20251011", "20251031",
    "2025"
)

Write-Host "📋 Migrazioni da marcare come REVERTED (non esistono localmente): $($revertedMigrations.Count)" -ForegroundColor Yellow
Write-Host "📋 Migrazioni da marcare come APPLIED (esistono localmente): $($appliedMigrations.Count)" -ForegroundColor Green
Write-Host ""

$continue = Read-Host "Vuoi procedere con la riparazione? (S/N)"
if ($continue -ne "S" -and $continue -ne "s") {
    Write-Host "❌ Operazione annullata" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Riparazione in corso..." -ForegroundColor Cyan
Write-Host ""

# Ripara migrazioni reverted
$revertedCount = 0
foreach ($migration in $revertedMigrations) {
    Write-Host "  🔄 Marca come reverted: $migration" -ForegroundColor Gray
    $result = npx supabase migration repair --status reverted $migration 2>&1
    if ($LASTEXITCODE -eq 0) {
        $revertedCount++
    } else {
        Write-Host "    ⚠️ Errore: $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Migrazioni reverted: $revertedCount/$($revertedMigrations.Count)" -ForegroundColor Green

# Ripara migrazioni applied
$appliedCount = 0
foreach ($migration in $appliedMigrations) {
    Write-Host "  ✅ Marca come applied: $migration" -ForegroundColor Gray
    $result = npx supabase migration repair --status applied $migration 2>&1
    if ($LASTEXITCODE -eq 0) {
        $appliedCount++
    } else {
        Write-Host "    ⚠️ Errore: $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Migrazioni applied: $appliedCount/$($appliedMigrations.Count)" -ForegroundColor Green
Write-Host ""
Write-Host ("=" * 60)
Write-Host "✅ Riparazione completata!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prossimi passi:" -ForegroundColor Cyan
Write-Host "  1. Verifica con: npx supabase db push" -ForegroundColor White
Write-Host "  2. Applica la migrazione del trigger manualmente nel dashboard" -ForegroundColor White
Write-Host "  3. Verifica profili con: npm run db:verify-profiles" -ForegroundColor White
Write-Host ""
