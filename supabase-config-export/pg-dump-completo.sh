#!/bin/bash
# Comando pg_dump completo con connection string corretta
# Regione: eu-north-1
# Data: 2026-01-17

# =====================================================
# SOLO SCHEMA (senza dati) - RACCOMANDATO
# =====================================================
# Usa DIRECT_URL (porta 5432) per pg_dump

pg_dump "postgresql://postgres.icibqnmtacibgnhaidlz:22Club-NEW@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql

echo "✅ Schema esportato in: supabase-config-export/schema-complete.sql"
