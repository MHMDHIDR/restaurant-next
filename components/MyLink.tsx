import { useRouter } from 'next/router'
import Link from 'next/link'
import scrollTo from '../utils/functions/scrollToSection'
import menuToggler from '../utils/functions/menuToggler'
import { MyLinkProps } from '../types'

const MyLink = ({ children, to = `/`, className }: MyLinkProps) => {
  const { pathname } = useRouter()

  return pathname === '/' ? (
    <Link
      href={`/#${to}`}
      className={className ? className : 'underline-hover'}
      data-scroll={to}
      onClick={e => {
        scrollTo(e)
        menuToggler()
      }}
    >
      {children}
    </Link>
  ) : (
    <Link href={`/`} className={className ? className : 'underline-hover'}>
      {children}
    </Link>
  )
}

export default MyLink
