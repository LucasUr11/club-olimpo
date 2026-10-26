import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

export interface AppRouteState {
  scrollTo?: string
}

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  state?: AppRouteState
}

export default function AppLink({ href, state, ...props }: AppLinkProps) {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return <Link to={href} state={state} {...props} />
  }

  return <a href={href} {...props} />
}
