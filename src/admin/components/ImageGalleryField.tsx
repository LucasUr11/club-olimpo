import { useId, useRef, useState, type DragEvent } from 'react'
import { Loader2, Star, Trash2, UploadCloud } from 'lucide-react'
import { IMAGE_UPLOAD_CONFIGURED, uploadImage } from '../../lib/imageUpload'
import { cn } from '../../lib/cn'

interface ImageGalleryFieldProps {
  values: string[]
  onChange: (values: string[]) => void
  error?: string
}

const MAX_IMAGES = 10

export default function ImageGalleryField({ values, onChange, error }: ImageGalleryFieldProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const message = uploadError ?? error

  async function handleFiles(files: FileList | File[]): Promise<void> {
    if (uploading) return
    const remaining = MAX_IMAGES - values.length
    if (remaining <= 0) {
      setUploadError(`La galería admite hasta ${MAX_IMAGES} imágenes.`)
      return
    }
    const selected = Array.from(files)
    if (selected.length > remaining) {
      setUploadError(`Solo se pueden agregar ${remaining} imágenes más.`)
    } else {
      setUploadError(null)
    }
    setUploading(true)
    const uploaded = [...values]
    try {
      for (const file of selected.slice(0, remaining)) {
        const imageUrl = await uploadImage(file)
        uploaded.push(imageUrl)
        onChange([...uploaded])
      }
    } catch (failure) {
      setUploadError(failure instanceof Error ? failure.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function addUrl(): void {
    const value = url.trim()
    if (!value || values.length >= MAX_IMAGES) return
    setUploadError(null)
    onChange([...values, value])
    setUrl('')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    setDragging(false)
    void handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`${id}-url`} className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Galería de imágenes
        </label>
        <span className="text-xs text-slate-400">{values.length}/{MAX_IMAGES}</span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!uploading) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border-2 border-dashed p-4 transition',
          dragging ? 'border-amarillo bg-amarillo/10' : 'border-slate-200 bg-slate-50',
          message && 'border-red-300',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !IMAGE_UPLOAD_CONFIGURED || values.length >= MAX_IMAGES}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-azul/25 px-3 py-1.5 text-xs font-semibold text-azul transition hover:border-azul hover:bg-azul hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
          title={IMAGE_UPLOAD_CONFIGURED ? 'Elegir una o varias imágenes' : 'Configurá Cloudinary para subir archivos'}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" aria-hidden />
          )}
          {uploading ? 'Subiendo imágenes…' : 'Subir imágenes'}
        </button>
        <span className="ml-2 text-xs text-slate-500">Podés elegir varios archivos o arrastrarlos acá.</span>

        {values.length > 0 ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {values.map((imageUrl, index) => (
              <li key={`${imageUrl}-${index}`} className="flex min-w-0 items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
                <img src={imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-md bg-slate-100 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-slate-600">{imageUrl}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amarillo/25 px-2 py-0.5 text-[10px] font-bold text-azul">
                        <Star className="h-3 w-3" aria-hidden />
                        Principal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onChange([imageUrl, ...values.filter((_, itemIndex) => itemIndex !== index)])}
                        disabled={uploading}
                        className="cursor-pointer text-[10px] font-semibold text-azul underline"
                      >
                        Usar como principal
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setUploadError(null)
                    onChange(values.filter((_, itemIndex) => itemIndex !== index))
                  }}
                  aria-label={`Quitar imagen ${index + 1}`}
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-500">La primera imagen será la principal. JPG, PNG o WebP · hasta 5 MB cada una.</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          id={`${id}-url`}
          type="url"
          inputMode="url"
          value={url}
          disabled={uploading}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addUrl()
            }
          }}
          placeholder="https://cdn.ejemplo.com/imagen.jpg"
          aria-invalid={message ? true : undefined}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 sm:text-sm"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={uploading || !url.trim() || values.length >= MAX_IMAGES}
          className="cursor-pointer rounded-lg bg-azul px-3 py-2 text-xs font-semibold text-white transition hover:bg-azul-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar URL
        </button>
      </div>

      {message ? (
        <p role="alert" className="text-xs font-medium text-red-600">{message}</p>
      ) : (
        <p className="text-xs text-slate-500">
          {IMAGE_UPLOAD_CONFIGURED
            ? 'Arrastrá archivos, elegilos en conjunto o agregá URLs. La primera imagen se muestra como principal.'
            : 'La subida directa no está configurada: agregá las URLs manualmente o definí las variables de Cloudinary.'}
        </p>
      )}
    </div>
  )
}
