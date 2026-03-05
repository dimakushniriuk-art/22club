// ============================================================================
// SCRIPT PER RESETTARE LA PASSWORD NEL BROWSER
// ============================================================================
// ISTRUZIONI:
// 1. Apri la console del browser (F12 > Console)
// 2. Copia e incolla questo script
// 3. Modifica userId e password se necessario
// 4. Premi Enter per eseguire
// ============================================================================

;(async function resetPassword() {
  const userId = 'bf759b73-cf0c-4e93-92a7-4a84715b972a' // Profile ID di dima.kushniriuk@gmail.com
  const newPassword = 'Dimon280894'

  console.log('🔄 Reset password in corso...')
  console.log('User ID:', userId)
  console.log('Nuova password:', newPassword)

  try {
    const response = await fetch('/api/admin/users/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        password: newPassword,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Password resettata con successo!')
      console.log('Risposta:', data)
      alert('Password resettata con successo! Ora puoi fare login con la nuova password.')
    } else {
      console.error('❌ Errore nel reset password:', data)
      alert('Errore: ' + (data.error || 'Errore sconosciuto'))
    }
  } catch (error) {
    console.error('❌ Errore nella chiamata API:', error)
    alert('Errore: ' + error.message)
  }
})()
