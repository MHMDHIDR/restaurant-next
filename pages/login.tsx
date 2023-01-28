import { useRouter } from 'next/router'
import { useEffect } from 'react'
const login = () => {
  const { push } = useRouter()
  useEffect(() => {
    push('/auth/login')

    return () => {
      push('')
    }
  }, [])

  return null
}

export default login
