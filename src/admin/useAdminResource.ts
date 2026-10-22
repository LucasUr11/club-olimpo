// ============================================================================
// Carga de una colección del panel con estado de carga/error y recarga.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { adminApi, AdminApiError, type AdminResource } from '../lib/adminApi'

export type ResourceStatus = 'loading' | 'ready' | 'error'

export interface AdminResourceState<T> {
  data: T[]
  status: ResourceStatus
  error: string | null
  /** Recarga sin volver al skeleton (los datos actuales quedan visibles). */
  reload: () => Promise<void>
}

export function useAdminResource<T>(resource: AdminResource): AdminResourceState<T> {
  const [data, setData] = useState<T[]>([])
  const [status, setStatus] = useState<ResourceStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const active = useRef(true)

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) setStatus('loading')
      setError(null)
      try {
        const rows = await adminApi.list<T>(resource)
        if (!active.current) return
        setData(rows)
        setStatus('ready')
      } catch (loadError) {
        if (!active.current) return
        // Un 401 ya dispara el logout global; no mostramos un error de carga.
        if (loadError instanceof AdminApiError && loadError.status === 401) return
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.')
        setStatus('error')
      }
    },
    [resource],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  const reload = useCallback(() => load(true), [load])

  return { data, status, error, reload }
}
