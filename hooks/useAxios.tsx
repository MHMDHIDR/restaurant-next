import { useEffect, useState } from 'react'
import Axios from 'axios'
import { axiosProps, responseTypes } from '@types'
import { parseJson } from 'functions/jsonTools'

const { origin }: any = typeof window !== 'undefined' && window.location

Axios.defaults.baseURL = `${origin}/api`

const useAxios = ({ url, method = 'get', body = null, headers = null }: axiosProps) => {
  const [response, setResponse] = useState<responseTypes | null>(null)
  const [error, setError] = useState<{
    error: any
    response: any
  } | null>(null)
  const [loading, setloading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await Axios({
          url,
          method,
          data: body,
          headers:
            headers !== null
              ? parseJson(headers)
              : {
                  'Content-Type': 'application/json'
                }
        })
        setResponse(result.data)
        setloading(false)
      } catch (error) {
        setError({ error, response: error })
      } finally {
        setloading(false)
      }
    }
    fetchData()
  }, [url, method, body, headers])

  return { response, error, loading }
}

export default useAxios
