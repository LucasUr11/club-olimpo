import type { SVGProps } from 'react'

/**
 * Iconos de redes sociales propios.
 * (lucide-react v1 ya no distribuye iconos de marca.)
 */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 21v-7.5h2.6l.4-3.2h-3V8.1c0-.9.3-1.6 1.7-1.6H17.7V3.6C17.3 3.5 16.3 3.4 15.2 3.4c-2.5 0-4.2 1.5-4.2 4.3v2.6H8.3v3.2h2.7V21" />
    </svg>
  )
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2.2" y="5" width="19.6" height="14" rx="4.5" />
      <path d="M10.2 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
    </svg>
  )
}
