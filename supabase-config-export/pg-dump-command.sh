# =====================================================
# Comando pg_dump per esportare schema completo
# =====================================================
#
# PREREQUISITI:
# 1. PostgreSQL client tools installati (pg_dump)
#    macOS: brew install postgresql
#    Linux: sudo apt-get install postgresql-client
#    Windows: Installa PostgreSQL o usa WSL
#
# 2. Connection string dal Supabase Dashboard:
#    - Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
#    - Copia la "Connection string" (usa "Direct connection")
#    - Formato: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
#
# =====================================================
# SOLO SCHEMA (senza dati) - RACCOMANDATO
# =====================================================

pg_dump "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-only.sql

# =====================================================
# SCHEMA + DATI (file molto grande)
# =====================================================

pg_dump "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-with-data.sql

# =====================================================
# ALTERNATIVA: Usa connection string diretta
# =====================================================
# Se hai la connection string diretta (non pooler):
#
# pg_dump "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" \
#   --schema=public \
#   --schema-only \
#   --no-owner \
#   --no-acl \
#   --file=supabase-config-export/schema-only.sql

# =====================================================
# NOTE:
# =====================================================
# - Sostituisci [PASSWORD] con la password del database
# - Sostituisci [PROJECT-REF] con: icibqnmtacibgnhaidlz
# - Sostituisci [REGION] con la tua regione (es: eu-central-1)
# - La password NON è la service role key!
# - Trova la password in: Dashboard > Settings > Database > Database password
