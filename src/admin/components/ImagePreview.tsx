// ============================================================================
// Miniatura con fallback cuando la URL está vacía o rota.
// ============================================================================

import { useEffect, useState, type ReactNode } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '../../lib/cn'

interface ImagePreviewProps {
  src: string | null
  alt: string
  className?: string
  icon?: ReactNode
}

export default function ImagePreview({ src, alt, className, icon }: ImagePreviewProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div className={cn('grid place-items-center bg-slate-100 text-slate-300', className)}>
        {icon ?? <ImageOff className="h-6 w-6" aria-hidden />}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('bg-slate-100 object-cover', className)}
    />
  )
}
