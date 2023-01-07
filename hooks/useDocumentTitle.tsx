import { useEffect } from 'react'
import { API_URL } from '../constants'

const useDocumentTitle = (title: string) => {
  const response = fetch(`${API_URL}/settings`).then(res => res.json())

  console.log(response)

  const appName = response?.appName || 'Restaurant'

  useEffect(() => {
    document.title = window.location.pathname.includes('dashboard')
      ? title + ` | Dashboard | ${appName}`
      : title + ` | ${appName}`
  })
}

export default useDocumentTitle
