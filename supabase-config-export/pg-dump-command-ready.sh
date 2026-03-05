#!/bin/bash
# Comando pg_dump generato automaticamente
# Data: 2026-01-17T21:08:09.036Z

pg_dump "postgresql://postgres:22Club-NEW@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" \
  --schema=public \
  --no-owner \
  --no-acl \
  --file=supabase-config-export/schema-complete.sql
