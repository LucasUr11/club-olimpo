import { useEffect, useState } from 'react'
import { getJson } from '../lib/api'

export interface ApiState<T> {
  data: T
  loading: boolean
}

/**
 * Hook de datos para los endpoints /api/*.
 * Arranca con los fixtures (pintura inmediata) y reemplaza cuando responde.
 * `fallback` debe ser estable (se importa de shared/fixtures).
 */
export function useApi<T>(path: string, fallback: T): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: fallback, loading: true })

  useEffect(() => {
    let active = true

    void getJson<T>(path, fallback).then((data) => {
      if (active) {
        setState({ data, loading: false })
      }
    })

    return () => {
      active = false
    }
  }, [path, fallback])

  return state
}
