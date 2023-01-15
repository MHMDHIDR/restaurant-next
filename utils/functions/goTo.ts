// funciton that returns the subpath and give a go to path
const goTo = (subpath: string) => {
  const subpathRoot =
    typeof window !== 'undefined' && window.location.pathname.split('/')[1] // subpath root (/dashboard)
  return subpath === subpathRoot ? `/${subpathRoot}` : `/${subpathRoot}/` + subpath
}

export default goTo
