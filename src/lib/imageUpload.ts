// ============================================================================
// Subida de imágenes a la nube.
// ----------------------------------------------------------------------------
// El backend solo guarda la URL resultante. El panel sube el archivo directo
// al proveedor con un upload preset SIN FIRMA (unsigned) de Cloudinary, que
// devuelve `secure_url`. Todo se configura con variables VITE_*:
//
//   VITE_CLOUDINARY_CLOUD_NAME
//   VITE_CLOUDINARY_UPLOAD_PRESET
//
// El cloud name y el preset unsigned son públicos por diseño; las
// restricciones (carpeta, tamaño, formatos) se configuran en Cloudinary.
// Si no están definidos, el campo de imagen permite pegar una URL existente.
// ============================================================================

const CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '').trim()
const UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '').trim()

export const IMAGE_UPLOAD_CONFIGURED = CLOUD_NAME.length > 0 && UPLOAD_PRESET.length > 0
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_UPLOAD_CONFIGURED) {
    throw new Error(
      'La subida de imágenes no está configurada. Definí VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET, o pegá una URL.',
    )
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen (JPG, PNG, WebP, etc.).')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen supera el límite de 5 MB.')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  let response: Response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/image/upload`,
      { method: 'POST', body },
    )
  } catch {
    throw new Error('No se pudo subir la imagen. Revisá tu conexión e intentá de nuevo.')
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    let message = 'El proveedor de imágenes rechazó el archivo.'
    if (payload !== null && typeof payload === 'object' && 'error' in payload) {
      const error = (payload as { error?: unknown }).error
      if (error !== null && typeof error === 'object') {
        const detail = (error as { message?: unknown }).message
        if (typeof detail === 'string' && detail.length > 0) message = detail
      }
    }
    throw new Error(message)
  }

  if (payload === null || typeof payload !== 'object') {
    throw new Error('El proveedor no devolvió una respuesta válida.')
  }

  const secureUrl = (payload as { secure_url?: unknown }).secure_url
  if (typeof secureUrl !== 'string' || !secureUrl.startsWith('https://')) {
    throw new Error('El proveedor no devolvió una URL válida.')
  }
  return secureUrl
}
