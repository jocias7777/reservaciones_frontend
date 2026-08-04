/** Lado máximo del avatar, en píxeles. */
const AVATAR_SIZE = 256

/**
 * Tamaño máximo del resultado. `sa_user_profiles.foto_url` es una columna TEXT
 * (65.535 bytes en MySQL), así que se deja margen de sobra.
 */
const AVATAR_MAX_BYTES = 40_000

/** Calidades que se prueban, de mejor a peor, hasta entrar en el presupuesto. */
const QUALITY_STEPS = [0.8, 0.65, 0.5, 0.35]

/**
 * Convierte una imagen en un avatar cuadrado listo para guardar en `foto_url`.
 *
 * Recorta al centro, reduce a {@link AVATAR_SIZE} y devuelve un data URL JPEG.
 * No hay endpoint de carga de archivos en el backend, así que la foto viaja
 * dentro del perfil; por eso se comprime hasta caber en la columna. Cuando
 * exista un endpoint de subida, solo cambia esta función.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen.')
  }

  const bitmap = await createImageBitmap(file)

  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const size = Math.min(AVATAR_SIZE, side)

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('El navegador no permitió procesar la imagen.')
    }

    // Recorte centrado: el avatar se muestra en círculo, así no se deforma.
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size
    )

    for (const quality of QUALITY_STEPS) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      if (dataUrl.length <= AVATAR_MAX_BYTES) {
        return dataUrl
      }
    }

    throw new Error('La imagen es demasiado pesada incluso comprimida. Prueba con otra.')
  } finally {
    bitmap.close()
  }
}
