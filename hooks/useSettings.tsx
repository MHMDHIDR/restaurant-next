import { useEffect, useState } from 'react'
import useAxios from './useAxios'

const useSettings = () => {
  const { response } = useAxios({ url: '/settings' })
  const [ITEMS_PER_PAGE, setITEMS_PER_PAGE] = useState(3)

  useEffect(() => {
    console.log(response?.itemsPerPage)

    setITEMS_PER_PAGE(response?.itemsPerPage || ITEMS_PER_PAGE)
  }, [response])

  return { ITEMS_PER_PAGE }
}

export default useSettings
