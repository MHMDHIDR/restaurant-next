import { useRouter } from 'next/router'
import Link from 'next/link'
import scrollTo from 'functions/scrollToSection'
import menuToggler from 'functions/menuToggler'
import { MyLinkProps } from '@types'
import { useLocale } from 'hooks/useLocale'

const MyLink = ({ children, to = `/`, className }: MyLinkProps) => {
  const { pathname } = useRouter()
  const { locale } = useLocale()

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
    <Link href={`/${locale}`} className={className ? className : 'underline-hover'}>
      {children}
    </Link>
  )
}

export default MyLink
