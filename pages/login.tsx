import { useRouter } from 'next/router'
import { useEffect } from 'react'
const Login = () => {
  const { push } = useRouter()
  useEffect(() => {
    push('/auth/login')

    return () => {
      push('')
    }
  }, [push])

  return null
}

export default Login
