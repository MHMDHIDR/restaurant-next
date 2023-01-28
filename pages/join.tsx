import { useRouter } from 'next/router'
import { useEffect } from 'react'
const join = () => {
  const { push } = useRouter()
  useEffect(() => {
    push('/auth/join')

    return () => {
      push('')
    }
  }, [])

  return null
}

export default join
