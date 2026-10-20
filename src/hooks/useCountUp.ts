import { useEffect, useRef, useState } from 'react'

interface CountUpResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>
  value: number
}

/**
 * Contador animado que comienza cuando el elemento entra en pantalla.
 * Respeta `prefers-reduced-motion` (muestra el valor final sin animar).
 */
export function useCountUp<T extends HTMLElement>(target: number, durationMs = 1400): CountUpResult<T> {
  const ref = useRef<T | null>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setValue(target)
      return
    }

    let frame = 0
    let started = false

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || started) {
          return
        }
        started = true
        observer.disconnect()

        const startTime = performance.now()
        const tick = (now: number): void => {
          const progress = Math.min((now - startTime) / durationMs, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(target * eased))
          if (progress < 1) {
            frame = requestAnimationFrame(tick)
          }
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, durationMs])

  return { ref, value }
}
