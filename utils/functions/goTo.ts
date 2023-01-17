import { useRouter } from 'next/router'

// funciton that returns the subpath and give a go to path
const goTo = (subpath: string) => {
  const { pathname } = useRouter()

  const subpathRoot = pathname.split('/')[1] // subpath root (/dashboard)
  return subpath === subpathRoot ? `/${subpathRoot}` : `/${subpathRoot}/` + subpath
}

export default goTo
