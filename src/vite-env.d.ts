/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloud name de Cloudinary para subir imágenes desde el panel. */
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  /** Upload preset sin firma (unsigned) de Cloudinary. */
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
