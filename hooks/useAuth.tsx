import { useState, useEffect } from 'react'
import useAxios from './useAxios'

/**
 * Custom hook to check if user is logged in then redirect to dashboard or home page
 */

//setting user token from local storage
const USER = JSON.parse(localStorage.getItem('user'))

const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false)
  const [userType, setUserType] = useState('')

  //get user data using token if the user is logged-in and token is saved in localStorage then I'll get the current user data from the database
  const { loading, ...response } = useAxios({
    url: `/users`,
    headers: USER ? JSON.stringify({ Authorization: `Bearer ${USER.token}` }) : null
  })

  useEffect(() => {
    if (!USER) {
      setIsAuth(false)
      setUserType('')
    }

    if (response.response !== null && response.response._id === USER._id) {
      if (response.response.userAccountType === 'admin') {
        setIsAuth(true)
        setUserType(response.response.userAccountType)
      } else if (response.response.userAccountType === 'cashier') {
        setIsAuth(true)
        setUserType(response.response.userAccountType)
      } else if (response.response.userAccountType === 'user') {
        setIsAuth(true)
        setUserType(response.response.userAccountType)
      }
    }

    return (): void => {
      setIsAuth(false)
      setUserType('')
    }
  }, [response.response])

  return { isAuth, userType, loading }
}

export default useAuth
