#!/bin/bash
# Comando pg_dump con Connection Pooling (alternativa se direct connection non funziona)
# Data: 2026-01-17T21:08:09.036Z

# Prova con Connection Pooling invece di Direct Connection
# Formato: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql

# Se anche questo non funziona, prova a cambiare la regione:
# - eu-central-1 (Europa Centrale)
# - us-east-1 (USA Est)
# - us-west-1 (USA Ovest)
# - ap-southeast-1 (Asia Pacifico)
# 
# Trova la regione corretta in: Supabase Dashboard > Settings > Database > Connection string
