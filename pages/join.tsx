import { useRouter } from 'next/router'
import { useEffect } from 'react'
const Join = () => {
  const { push } = useRouter()
  useEffect(() => {
    push('/auth/join')

    return () => {
      push('')
    }
  }, [push])

  return null
}

export default Join
