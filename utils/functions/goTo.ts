import { useRouter } from 'next/router'

/**
 * funciton that returns the subpath and give a go to path
 * @returns /en/dashboard if pathname includes /en
 * @returns /dashboard if pathname DOES NOT includes /en
 */
const goTo = (subpath: string) => {
  const { pathname } = typeof window !== 'undefined' ? window.location : useRouter()
  const subpathRoot = pathname.includes('/en')
    ? pathname.split('/')[2]
    : pathname.split('/')[1]

  return subpath === subpathRoot ? `/${subpathRoot}` : `/${subpathRoot}/` + subpath
}

export default goTo
