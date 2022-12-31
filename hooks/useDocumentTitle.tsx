import { useEffect } from 'react'
import useAxios from './useAxios'

const useDocumentTitle = (title: string) => {
  const { response } = useAxios({ url: '/settings' })
  const appName = response?.appName || 'Restaurant'

  useEffect(() => {
    document.title = window.location.pathname.includes('dashboard')
      ? title + ` | Dashboard | ${appName}`
      : title + ` | ${appName}`
  })
}

export default useDocumentTitle
