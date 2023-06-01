import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { USER } from '@constants'
import { stringJson } from 'functions/jsonTools'
import useAxios from './useAxios'

/**
 * Custom hook to check if user is logged in then redirect to dashboard or home page
 */

const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [userType, setUserType] = useState<string>('')
  const [userStatus, setUserStatus] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const { data: session } = useSession()

  //get user data using token if the user is logged-in and token is saved in localStorage then I'll get the current user data from the database
  const headers = USER
    ? typeof window !== 'undefined'
      ? localStorage.getItem('user')
      : ''
    : stringJson(session!?.user!)

  const { loading, ...response }: any = useAxios({ url: `/users`, headers })

  useEffect(() => {
    if (!USER) {
      setIsAuth(false)
      setUserType('')
    }

    if (
      !loading &&
      ['admin', 'cashier', 'user'].includes(response.response?.userAccountType)
    ) {
      setIsAuth(true)
      setUserType(response.response?.userAccountType)
      setUserStatus(response.response?.userAccountStatus)
      setUserId(response.response?._id)
    }

    return (): void => {
      setIsAuth(false)
      setUserType('')
      setUserStatus('')
      setUserId('')
    }
  }, [response.response])

  return {
    isAuth,
    userType,
    userStatus,
    userId,
    loading
  }
}

export default useAuth
