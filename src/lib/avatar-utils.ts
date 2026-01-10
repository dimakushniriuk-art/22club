// 🖼️ Avatar Utilities — 22Club

/**
 * Valida il file immagine per l'upload avatar
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  // 1. Controlla tipo MIME
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato file non supportato. Usa JPG, PNG, GIF o WebP.',
    }
  }

  // 2. Controlla dimensione (max 25MB)
  const maxSize = 25 * 1024 * 1024 // 25MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File troppo grande. Dimensione massima: 25MB.',
    }
  }

  return { valid: true }
}

/**
 * Ridimensiona un'immagine a dimensioni massime specificate
 * Mantiene le proporzioni
 */
export function resizeImage(
  file: File,
  maxWidth: number = 512,
  maxHeight: number = 512,
  quality: number = 0.9,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calcola nuove dimensioni mantenendo proporzioni
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Crea canvas per ridimensionare
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossibile creare contesto canvas'))
          return
        }

        // Disegna immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height)

        // Converti canvas in blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Impossibile convertire immagine'))
              return
            }

            // Crea nuovo File dal blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve(resizedFile)
          },
          file.type,
          quality,
        )
      }

      img.onerror = () => {
        reject(new Error('Errore nel caricamento immagine'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Errore nella lettura del file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Estrae estensione file dal nome o tipo MIME
 */
export function getFileExtension(file: File): string {
  // Prova prima dal nome file
  const nameExt = file.name.split('.').pop()?.toLowerCase()
  if (nameExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(nameExt)) {
    return nameExt === 'jpg' ? 'jpg' : nameExt
  }

  // Fallback al tipo MIME
  const mimeExt = file.type.split('/')[1]?.toLowerCase()
  if (mimeExt && ['jpeg', 'png', 'gif', 'webp'].includes(mimeExt)) {
    return mimeExt === 'jpeg' ? 'jpg' : mimeExt
  }

  // Default
  return 'jpg'
}
