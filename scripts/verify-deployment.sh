#!/bin/bash
# Script per verificare il deployment completo su Vercel

echo "🔍 VERIFICA DEPLOYMENT VERCEL - 22Club"
echo "============================================================"
echo ""

# Verifica connessione Vercel
echo "📡 1. Verifica connessione Vercel..."
if ! vercel whoami &> /dev/null; then
  echo "❌ Non autenticato su Vercel. Esegui: vercel login"
  exit 1
fi
echo "✅ Autenticato su Vercel"
echo ""

# Verifica progetto linkato
echo "🔗 2. Verifica progetto linkato..."
if [ ! -f ".vercel/project.json" ]; then
  echo "⚠️  Progetto non linkato. Esegui: vercel link"
  exit 1
fi
echo "✅ Progetto linkato"
echo ""

# Verifica variabili d'ambiente
echo "🔐 3. Verifica variabili d'ambiente..."
echo ""
vercel env ls
echo ""

# Verifica ultimo deployment
echo "📦 4. Verifica ultimo deployment..."
echo ""
vercel ls --prod | head -5
echo ""

# Test connessione
echo "🌐 5. Test connessione app..."
DEPLOYMENT_URL=$(vercel ls --prod | grep -oP 'https://[^\s]+' | head -1)
if [ -z "$DEPLOYMENT_URL" ]; then
  echo "⚠️  Nessun deployment trovato"
else
  echo "URL: $DEPLOYMENT_URL"
  if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" | grep -q "200\|401\|403"; then
    echo "✅ App risponde correttamente"
  else
    echo "⚠️  App non risponde correttamente"
  fi
fi
echo ""

echo "============================================================"
echo "✅ Verifica completata!"
