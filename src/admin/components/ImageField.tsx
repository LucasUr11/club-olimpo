// ============================================================================
// Campo de imagen: vista previa + URL + subida a la nube (arrastrar o elegir).
// ----------------------------------------------------------------------------
// El valor que se envía a la API es siempre el string de la URL. Si Cloudinary
// está configurado, el archivo se sube directo al proveedor y se autocompleta
// la URL; si no, se puede pegar cualquier URL existente.
// ============================================================================

import { useId, useRef, useState, type DragEvent } from 'react'
import { Loader2, UploadCloud, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { IMAGE_UPLOAD_CONFIGURED, uploadImage } from '../../lib/imageUpload'
import ImagePreview from './ImagePreview'

interface ImageFieldProps {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  hint?: string
  required?: boolean
}

export default function ImageField({ label, value, onChange, error, hint, required }: ImageFieldProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const message = uploadError ?? error

  async function handleFile(file: File | undefined): Promise<void> {
    if (!file || uploading) return
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    setDragging(false)
    void handleFile(event.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-hidden>
            *
          </span>
        ) : null}
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!uploading) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-dashed transition',
          dragging ? 'border-amarillo bg-amarillo/10' : 'border-slate-200 bg-slate-50',
          message && 'border-red-300',
        )}
      >
        <ImagePreview
          src={value}
          alt="Vista previa de la imagen"
          className="h-40 w-full sm:h-48"
          icon={<UploadCloud className="h-8 w-8" aria-hidden />}
        />

        {uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-azul/70 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Subiendo imagen…
            </span>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          void handleFile(file)
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !IMAGE_UPLOAD_CONFIGURED}
          className="inline-flex items-center gap-1.5 rounded-full border border-azul/25 px-3 py-1.5 text-xs font-semibold text-azul transition hover:border-azul hover:bg-azul hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
          title={IMAGE_UPLOAD_CONFIGURED ? 'Subir una imagen' : 'Configurá Cloudinary para subir archivos'}
        >
          <UploadCloud className="h-3.5 w-3.5" aria-hidden />
          Subir imagen
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => {
              setUploadError(null)
              onChange(null)
            }}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Quitar
          </button>
        ) : null}

        <span className="text-xs text-slate-400">JPG, PNG o WebP · hasta 5 MB</span>
      </div>

      <label htmlFor={id} className="mt-1 text-xs font-medium text-slate-500">
        URL de la imagen
      </label>
      <input
        id={id}
        type="url"
        inputMode="url"
        value={value ?? ''}
        onChange={(event) => {
          setUploadError(null)
          onChange(event.target.value)
        }}
        placeholder="https://cdn.ejemplo.com/imagen.jpg"
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${id}-error` : undefined}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/20 sm:text-sm',
          message && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
        )}
      />

      {message ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
          {message}
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          {hint ??
            (IMAGE_UPLOAD_CONFIGURED
              ? 'Arrastrá un archivo o elegilo con el botón. La URL se completa sola y se guarda en la base.'
              : 'Subida directa no configurada: pegá la URL de una imagen o definí VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.')}
        </p>
      )}
    </div>
  )
}
