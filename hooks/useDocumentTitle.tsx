import { useEffect } from 'react'
import { API_URL } from '../constants'

const useDocumentTitle = (title: string) => {
  const response = fetch(`http://dev.com:3000/api/settings`).then(res => {
    return res.json()
  })

  console.log(response)

  const appName = response?.appName || 'Restaurant'

  useEffect(() => {
    document.title = window.location.pathname.includes('dashboard')
      ? title + ` | Dashboard | ${appName}`
      : title + ` | ${appName}`
  })
}

export default useDocumentTitle
